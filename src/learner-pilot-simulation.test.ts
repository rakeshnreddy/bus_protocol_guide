import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { calculateBurst } from './components/visuals/BurstCalculator';
import { evaluateFormalProperty } from './components/visuals/FormalPropertyPlayground';
import {
  runSyntheticSession,
  summarizeSyntheticPilot,
  syntheticLearnerPersonas,
  type PilotProbe,
  type PilotTaskId,
} from './lib/learnerPilotSimulation';
import { search } from './lib/search';
import { getVisualById } from './lib/visualLoaders';
import type {
  BurstCalculatorConfig,
  FormalPropertyData,
} from './types/visuals';

const repositoryRoot = process.cwd();

function read(path: string): string {
  return readFileSync(`${repositoryRoot}/${path}`, 'utf8');
}

function probe(
  taskId: PilotTaskId,
  passed: boolean,
  evidence: string,
): PilotProbe {
  return { taskId, passed, evidence };
}

function buildTaskProbes(): Record<PilotTaskId, PilotProbe> {
  const foundationsTiming = read('content/lessons/foundations/03_timing_diagrams.md');
  const ahbWait = read('content/lessons/ahb/16_wait_states_hready.md');
  const axiWrite = read('content/lessons/axi/13_write_transaction_walkthrough.md');
  const visualCss = read('src/components/visuals/visuals.css');
  const globalCss = read('src/styles/global.css');

  const ahbModel = JSON.parse(
    read('content/visuals/checker-models/ahb_core_model.json'),
  ) as { calculator: BurstCalculatorConfig };
  const axiBurstModel = JSON.parse(
    read('content/visuals/checker-models/axi_burst_model.json'),
  ) as { calculator: BurstCalculatorConfig };
  const formalProperty = JSON.parse(
    read('content/visuals/formal-properties/axi_wlast_exact.json'),
  ) as FormalPropertyData;

  const ahbBoundary = calculateBurst(ahbModel.calculator, {
    ...ahbModel.calculator.initial,
    startAddress: '0x03F4',
    burst: 'INCR',
    bytesPerBeat: 4,
    beats: 4,
    busBytes: 4,
  });
  const axiBoundary = calculateBurst(
    axiBurstModel.calculator,
    axiBurstModel.calculator.initial,
  );
  const axiUnaligned = calculateBurst(axiBurstModel.calculator, {
    ...axiBurstModel.calculator.initial,
    startAddress: '0x1001',
    burst: 'INCR',
    bytesPerBeat: 4,
    beats: 4,
    busBytes: 8,
    strobe: '0x0E',
  });

  const earlyWlastTrace = {
    ...formalProperty.waveform,
    signals: formalProperty.waveform.signals.map(signal =>
      signal.name === 'WLAST'
        ? {
            ...signal,
            values: signal.values.map((value, index) =>
              index === 7 ? '1' : value,
            ),
          }
        : signal,
    ),
  };
  const earlyWlast = evaluateFormalProperty(
    earlyWlastTrace,
    formalProperty.property.evaluatorRule,
  );

  const searchResults = search('4 KB');
  const burstVisual = getVisualById('model-axi-burst-checker');

  return {
    'task-1': probe(
      'task-1',
      foundationsTiming.includes('AHB zero-wait pipeline') &&
        foundationsTiming.includes('accepted address requests can remain outstanding') &&
        foundationsTiming.includes('IDs define ordering/correlation streams'),
      'Foundations 03 separates AHB phase overlap, accepted context, AXI outstanding requests, and ID ordering/correlation.',
    ),
    'task-2': probe(
      'task-2',
      ahbWait.includes('pending valid Address Phase') &&
        ahbWait.includes('accepted transfer that owns the active data/response phase'),
      'AHB 16 exposes visible, pending, accepted, and active data/response-owner state.',
    ),
    'task-3': probe(
      'task-3',
      !ahbBoundary.boundaryLegal &&
        ahbBoundary.finalByte === 0x403 &&
        ahbBoundary.endExclusive === 0x404 &&
        ahbBoundary.firstTransactionBeats === 3 &&
        ahbBoundary.secondTransactionBeats === 1,
      'Actual calculator result: 0x3F4 INCR4 × 4 bytes ends at 0x403 and splits 3 + 1 across the AHB 1 KB boundary.',
    ),
    'task-4': probe(
      'task-4',
      axiWrite.includes('must retain pre-address data for later association') &&
        axiWrite.includes('must not assert `BVALID` before accepted AW and accepted final W') &&
        axiWrite.includes('`BVALID` cannot depend on `BREADY`'),
      'AXI 13 contains W-before-AW retention, AXI4 response prerequisites, AW-order association, and BREADY independence.',
    ),
    'task-5': probe(
      'task-5',
      earlyWlast.violations.some(violation =>
        /WLAST is asserted early.*AWID 9.*AWLEN=2.*accepted beat 2 of 3/i.test(
          violation.message,
        ),
      ),
      'Actual transaction-aware evaluator identifies early WLAST on accepted beat 2 of 3 for AWID 9 and AWLEN=2.',
    ),
    'task-6': probe(
      'task-6',
      !axiBoundary.boundaryLegal &&
        axiBoundary.finalByte === 0x1007 &&
        axiBoundary.endExclusive === 0x1008 &&
        axiBoundary.firstTransactionBeats === 2 &&
        axiBoundary.secondTransactionBeats === 2 &&
        axiUnaligned.beats[0]?.laneMask === 0x0e &&
        axiUnaligned.beats[1]?.address === 0x1004 &&
        axiUnaligned.beats[1]?.laneMask === 0xf0,
      'Actual calculator results cover 0x0FF8 final-byte/end-exclusive 0x1007/0x1008 with 2 + 2 split and 0x1001 masks 0x0E then 0xF0.',
    ),
    'task-7': probe(
      'task-7',
      searchResults.some(
        result =>
          result.type === 'lesson' &&
          result.path === '/lesson/25_4kb_boundary_rule',
      ) &&
        burstVisual?.type === 'checker-model',
      'Production search index resolves the 4 KB lesson and the registry resolves the AXI burst checker for Visuals Explorer.',
    ),
    'task-8': probe(
      'task-8',
      visualCss.includes('.calculator-table-scroll') &&
        visualCss.includes('overflow-x: auto') &&
        visualCss.includes('@media (prefers-reduced-motion: reduce)') &&
        globalCss.includes('@media (prefers-reduced-motion: reduce)'),
      'Responsive source keeps dense calculator/checker content internally scrollable and defines reduced-motion behavior; the dated live dry run supplies exact 375×812 evidence.',
    ),
  };
}

describe('synthetic learner pilot sessions', () => {
  const probes = buildTaskProbes();
  const sessions = syntheticLearnerPersonas.map(persona =>
    runSyntheticSession(persona, probes),
  );
  const summary = summarizeSyntheticPilot(sessions);

  it('executes all eight tasks for four distinct learner personas', () => {
    expect(sessions).toHaveLength(4);
    expect(sessions.map(session => session.persona.id)).toEqual([
      'sim-novice',
      'sim-ahb',
      'sim-axi',
      'sim-senior-mobile',
    ]);
    sessions.forEach(session => {
      expect(session.tasks).toHaveLength(8);
      expect(session.tasks.every(task => task.completedWithoutFacilitator)).toBe(true);
    });
  });

  it('forces every seeded misconception through a real academy recovery probe', () => {
    const recoveries = sessions.flatMap(session =>
      session.tasks.filter(task => task.recoveredThroughAcademy),
    );

    expect(recoveries).toHaveLength(4);
    expect(recoveries.every(result => result.evidence.length > 40)).toBe(true);
    expect(summary.seededMisconceptions).toBe(4);
    expect(summary.recoveredMisconceptions).toBe(4);
  });

  it('meets 20/24 (83.3%) synthetically without claiming human release evidence', () => {
    expect(summary).toMatchObject({
      evidenceClass: 'synthetic-recovery-readiness',
      participantSimulations: 4,
      protocolAttempts: 24,
      protocolFirstAttemptCorrect: 20,
      seededMisconceptions: 4,
      recoveredMisconceptions: 4,
      navigationAndMobileAttempts: 8,
      navigationAndMobileCompleted: 8,
      releaseBlockers: [],
      syntheticCriteriaPassed: true,
      canPromoteRelease: false,
    });
    expect(summary.protocolFirstAttemptRate).toBeCloseTo(5 / 6);
  });
});
