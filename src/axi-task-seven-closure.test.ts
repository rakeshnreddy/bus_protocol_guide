import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getLessons } from './lib/loaders';
import { getVisualById } from './lib/visualLoaders';

const repositoryRoot = process.cwd();

function lesson(order: number) {
  const item = getLessons().find(entry => entry.lesson.protocol === 'axi' && entry.lesson.order === order);
  if (!item) throw new Error(`Missing AXI lesson ${order}`);
  return item;
}

describe('AXI Task 7 closure guards', () => {
  it('teaches the complete TKEEP/TSTRB byte-type table and a stable position-byte example', () => {
    const stream = getVisualById('wf-axi-stream');
    if (!stream || stream.type !== 'waveform') throw new Error('Missing AXI4-Stream waveform');

    expect(lesson(29).body).toMatch(/TKEEP=1, TSTRB=1.*data byte/i);
    expect(lesson(29).body).toMatch(/TKEEP=1, TSTRB=0.*position byte/i);
    expect(lesson(29).body).toMatch(/TKEEP=0, TSTRB=0.*null byte/i);
    expect(lesson(29).body).toMatch(/TKEEP=0, TSTRB=1.*reserved/i);
    expect(stream.signals.find(signal => signal.name === 'TSTRB')?.values.slice(3, 5))
      .toEqual(['0001', '0001']);
  });

  it('keeps the WLAST evaluator transaction-aware rather than hardcoding a teaching burst length', () => {
    const evaluatorSource = readFileSync(
      `${repositoryRoot}/src/components/visuals/FormalPropertyPlayground.tsx`,
      'utf8',
    );

    expect(evaluatorSource).toMatch(/acceptedAwQueue/);
    expect(evaluatorSource).toMatch(/parseAwlen/);
    expect(evaluatorSource).toMatch(/bufferedWQueue/);
    expect(evaluatorSource).not.toMatch(/const\s+totalBeats\s*=\s*4/);
  });

  it('keeps the debug narrative and waveform on the same addresses and symbolic data', () => {
    expect(lesson(39).body).toMatch(/0x1000[\s\S]*0x2000/);
    expect(lesson(39).body).toMatch(/B0[\s\S]*B1[\s\S]*A0[\s\S]*A1/);
    expect(lesson(39).body).not.toMatch(/0xAAAA|0xBBBB/);
  });

  it('retains AXI4-Lite handshake, response, partial-write, reset, and outstanding complexity', () => {
    expect(lesson(28).body).not.toMatch(/strips away all the complexity/i);
    expect(lesson(28).body).toMatch(/independently handshaken channels.*response handling.*backpressure.*reset obligations.*WSTRB.*outstanding-transaction limits/i);
  });

  it('defines a reproducible GitHub CI gate for locked install, tests, and build', () => {
    const workflow = readFileSync(`${repositoryRoot}/.github/workflows/ci.yml`, 'utf8');
    expect(workflow).toMatch(/push:[\s\S]*branches: \[main\]/);
    expect(workflow).toMatch(/pull_request:[\s\S]*branches: \[main\]/);
    expect(workflow).toContain('npm ci --ignore-scripts');
    expect(workflow).toContain('npm run test');
    expect(workflow).toContain('npm run build');
  });
});
