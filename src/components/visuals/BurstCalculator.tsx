import { useState } from 'react';
import type { BurstCalculatorConfig } from '../../types/visuals';

type BurstKind = BurstCalculatorConfig['initial']['burst'];

export interface BurstBeatResult {
  index: number;
  address: number;
  firstByte: number;
  lastByte: number;
  laneMask: number;
}

export interface BurstCalculation {
  validAddress: boolean;
  alignedStart: number;
  wrapBase: number;
  wrapBytes: number;
  beats: BurstBeatResult[];
  finalByte: number;
  endExclusive: number;
  boundaryLegal: boolean;
  alignmentLegal: boolean;
  lengthLegal: boolean;
  sizeLegal: boolean;
  strobeValue: number | undefined;
  strobeLegal: boolean;
  firstTransactionBeats: number;
  secondTransactionBeats: number;
  legal: boolean;
}

function parseInteger(value: string): number | undefined {
  const normalized = value.trim();
  if (!/^(?:0x[0-9a-f]+|\d+)$/i.test(normalized)) return undefined;
  const parsed = Number.parseInt(normalized, normalized.toLowerCase().startsWith('0x') ? 16 : 10);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : undefined;
}

function laneMask(firstByte: number, lastByte: number, busBytes: number): number {
  let mask = 0;
  for (let address = firstByte; address <= lastByte; address += 1) mask |= 1 << (address % busBytes);
  return mask;
}

export function calculateBurst(
  config: BurstCalculatorConfig,
  values: BurstCalculatorConfig['initial'],
): BurstCalculation {
  const parsedAddress = parseInteger(values.startAddress);
  const start = parsedAddress ?? 0;
  const alignedStart = Math.floor(start / values.bytesPerBeat) * values.bytesPerBeat;
  const wrapBytes = values.bytesPerBeat * values.beats;
  const wrapBase = Math.floor(start / wrapBytes) * wrapBytes;
  const isUnaligned = start !== alignedStart;
  const beats = Array.from({ length: values.beats }, (_, index) => {
    let address = start;
    if (values.burst === 'INCR' && index > 0) address = alignedStart + index * values.bytesPerBeat;
    if (values.burst === 'WRAP') address = wrapBase + ((start - wrapBase + index * values.bytesPerBeat) % wrapBytes);
    const firstByte = config.protocol === 'axi' && isUnaligned && (index === 0 || values.burst === 'FIXED')
      ? start
      : address;
    const lastByte = config.protocol === 'axi' && isUnaligned && (index === 0 || values.burst === 'FIXED')
      ? alignedStart + values.bytesPerBeat - 1
      : address + values.bytesPerBeat - 1;
    return { index, address, firstByte, lastByte, laneMask: laneMask(firstByte, lastByte, values.busBytes) };
  });
  const finalBeat = beats.at(-1);
  const finalByte = finalBeat?.lastByte ?? start;
  const endExclusive = finalByte + 1;
  const startingRegion = Math.floor(start / config.boundaryBytes);
  const firstIllegalIndex = beats.findIndex(beat =>
    Math.floor(beat.firstByte / config.boundaryBytes) !== startingRegion ||
    Math.floor(beat.lastByte / config.boundaryBytes) !== startingRegion,
  );
  const boundaryLegal = firstIllegalIndex === -1;
  const alignmentLegal = config.protocol === 'axi'
    ? values.burst !== 'WRAP' || !isUnaligned
    : !isUnaligned;
  const legalWrapLengths = config.protocol === 'axi' ? [2, 4, 8, 16] : [4, 8, 16];
  const lengthLegal = values.burst !== 'WRAP' || legalWrapLengths.includes(values.beats);
  const sizeLegal = values.bytesPerBeat <= values.busBytes;
  const strobeValue = config.protocol === 'axi' && values.strobe !== undefined
    ? parseInteger(values.strobe)
    : undefined;
  const firstMask = beats[0]?.laneMask ?? 0;
  const maxMask = (1 << values.busBytes) - 1;
  const strobeLegal = config.protocol !== 'axi' || (
    strobeValue !== undefined && strobeValue <= maxMask && (strobeValue & ~firstMask) === 0
  );
  const firstTransactionBeats = boundaryLegal ? values.beats : Math.max(0, firstIllegalIndex);
  const secondTransactionBeats = boundaryLegal ? 0 : values.beats - firstTransactionBeats;
  return {
    validAddress: parsedAddress !== undefined,
    alignedStart,
    wrapBase,
    wrapBytes,
    beats,
    finalByte,
    endExclusive,
    boundaryLegal,
    alignmentLegal,
    lengthLegal,
    sizeLegal,
    strobeValue,
    strobeLegal,
    firstTransactionBeats,
    secondTransactionBeats,
    legal: parsedAddress !== undefined && boundaryLegal && alignmentLegal && lengthLegal && sizeLegal && strobeLegal,
  };
}

function hex(value: number, digits = 4): string {
  return `0x${value.toString(16).toUpperCase().padStart(digits, '0')}`;
}

function mask(value: number, busBytes: number): string {
  return `0x${value.toString(16).toUpperCase().padStart(Math.ceil(busBytes / 4), '0')}`;
}

export default function BurstCalculator({ config }: { config: BurstCalculatorConfig }) {
  const [values, setValues] = useState(config.initial);
  const result = calculateBurst(config, values);
  const updateNumber = (field: 'bytesPerBeat' | 'beats' | 'busBytes', value: string) => {
    setValues(current => ({ ...current, [field]: Number(value) }));
  };

  return (
    <section className="burst-calculator" aria-labelledby={`${config.protocol}-burst-calculator-title`}>
      <div className="burst-calculator-heading">
        <div>
          <h3 id={`${config.protocol}-burst-calculator-title`}>{config.protocol.toUpperCase()} burst, lane, and boundary calculator</h3>
          <p>Change the request fields. Results use accepted-beat addresses and every active byte, not elapsed stall cycles.</p>
        </div>
        <span className={`calculator-verdict ${result.legal ? 'is-pass' : 'is-fail'}`} role="status">
          {result.legal ? 'Legal request' : 'Checker flags request'}
        </span>
      </div>

      <div className="calculator-controls">
        <label>Start address
          <input value={values.startAddress} onChange={event => setValues(current => ({ ...current, startAddress: event.target.value }))} inputMode="text" />
        </label>
        <label>Burst type
          <select value={values.burst} onChange={event => setValues(current => ({ ...current, burst: event.target.value as BurstKind }))}>
            {config.burstOptions.map(option => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label>{config.protocol === 'axi' ? 'Bytes/beat (2^AxSIZE)' : 'Bytes/beat (2^HSIZE)'}
          <select value={values.bytesPerBeat} onChange={event => updateNumber('bytesPerBeat', event.target.value)}>
            {config.bytesPerBeatOptions.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label>{config.protocol === 'axi' ? 'Beats (AxLEN+1)' : 'Accepted beats'}
          <select value={values.beats} onChange={event => updateNumber('beats', event.target.value)}>
            {config.beatOptions.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label>Data bus bytes
          <select value={values.busBytes} onChange={event => updateNumber('busBytes', event.target.value)}>
            {config.busBytesOptions.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        {config.protocol === 'axi' && <label>First-beat WSTRB mask
          <input value={values.strobe ?? ''} onChange={event => setValues(current => ({ ...current, strobe: event.target.value }))} inputMode="text" />
        </label>}
      </div>

      <div className="calculator-summary" aria-live="polite">
        <div><span>Aligned address</span><strong>{hex(result.alignedStart)}</strong></div>
        <div><span>Wrap base / span</span><strong>{hex(result.wrapBase)} / {result.wrapBytes} B</strong></div>
        <div><span>Final beat byte / end-exclusive</span><strong>{hex(result.finalByte)} / {hex(result.endExclusive)}</strong></div>
        <div><span>{config.boundaryBytes / 1024} KB boundary</span><strong>{result.boundaryLegal ? 'one region' : 'crosses region'}</strong></div>
        <div><span>First active lane mask</span><strong>{mask(result.beats[0]?.laneMask ?? 0, values.busBytes)}</strong></div>
        {config.protocol === 'axi' && <div><span>WSTRB subset</span><strong>{result.strobeLegal ? 'legal subset' : 'outside active lanes'}</strong></div>}
      </div>

      <ul className="calculator-checks" aria-label="Calculator legality results">
        {!result.validAddress && <li className="is-fail">Address must be non-negative hexadecimal (0x…) or decimal.</li>}
        {!result.sizeLegal && <li className="is-fail">Transfer size exceeds the configured data-bus width.</li>}
        {!result.alignmentLegal && <li className="is-fail">{config.protocol === 'axi' ? 'WRAP start must be transfer-size aligned.' : 'AHB start must be aligned to HSIZE.'}</li>}
        {!result.lengthLegal && <li className="is-fail">WRAP length is not legal for the selected protocol.</li>}
        {!result.boundaryLegal && <li className="is-fail">Active bytes leave the starting {config.boundaryBytes / 1024} KB region.</li>}
        {!result.strobeLegal && <li className="is-fail">WSTRB asserts a byte lane outside the first beat's legal lane mask.</li>}
      </ul>

      {!result.boundaryLegal && values.burst === 'INCR' && (
        <p className="calculator-split"><strong>Legal split:</strong> {result.firstTransactionBeats} beat{result.firstTransactionBeats === 1 ? '' : 's'} before the boundary, then {result.secondTransactionBeats} beat{result.secondTransactionBeats === 1 ? '' : 's'} in a new transaction.</p>
      )}

      <div className="calculator-table-scroll" role="region" tabIndex={0} aria-label="Scrollable calculated burst beats">
        <table>
          <caption>Accepted-beat address and active-byte results</caption>
          <thead><tr><th>Beat</th><th>Address</th><th>Active bytes</th><th>Lane mask</th><th>LAST expected</th></tr></thead>
          <tbody>{result.beats.map(beat => (
            <tr key={beat.index}>
              <th scope="row">{beat.index + 1}</th><td>{hex(beat.address)}</td><td>{hex(beat.firstByte)}–{hex(beat.lastByte)}</td><td>{mask(beat.laneMask, values.busBytes)}</td><td>{beat.index === result.beats.length - 1 ? 'yes' : 'no'}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </section>
  );
}
