export type PilotTaskId =
  | 'task-1'
  | 'task-2'
  | 'task-3'
  | 'task-4'
  | 'task-5'
  | 'task-6'
  | 'task-7'
  | 'task-8';

export interface PilotProbe {
  taskId: PilotTaskId;
  passed: boolean;
  evidence: string;
}

export interface SyntheticLearnerPersona {
  id: string;
  label: string;
  experience: string;
  firstAttemptCorrect: readonly PilotTaskId[];
  expectedRecoveryNeed: string;
  viewport: 'desktop' | '375x812';
}

export interface SyntheticTaskResult {
  taskId: PilotTaskId;
  firstAttemptCorrect: boolean | null;
  recoveredThroughAcademy: boolean;
  completedWithoutFacilitator: boolean;
  evidence: string;
}

export interface SyntheticSessionResult {
  persona: SyntheticLearnerPersona;
  tasks: SyntheticTaskResult[];
}

export interface SyntheticPilotSummary {
  evidenceClass: 'synthetic-recovery-readiness';
  participantSimulations: number;
  protocolAttempts: number;
  protocolFirstAttemptCorrect: number;
  protocolFirstAttemptRate: number;
  seededMisconceptions: number;
  recoveredMisconceptions: number;
  navigationAndMobileAttempts: number;
  navigationAndMobileCompleted: number;
  releaseBlockers: string[];
  syntheticCriteriaPassed: boolean;
  canPromoteRelease: false;
}

export const protocolTaskIds: readonly PilotTaskId[] = [
  'task-1',
  'task-2',
  'task-3',
  'task-4',
  'task-5',
  'task-6',
];

export const platformTaskIds: readonly PilotTaskId[] = ['task-7', 'task-8'];

export const syntheticLearnerPersonas: readonly SyntheticLearnerPersona[] = [
  {
    id: 'sim-novice',
    label: 'New-to-AMBA learner',
    experience: 'Digital-design fundamentals; no prior AMBA project',
    firstAttemptCorrect: ['task-2', 'task-3', 'task-5', 'task-6'],
    expectedRecoveryNeed: 'Distinguish phase overlap from outstanding state and learn AXI4 write-response dependencies.',
    viewport: 'desktop',
  },
  {
    id: 'sim-ahb',
    label: 'AHB-experienced verification engineer',
    experience: 'AHB monitor and scoreboard experience; limited AXI ownership work',
    firstAttemptCorrect: ['task-1', 'task-2', 'task-3', 'task-5', 'task-6'],
    expectedRecoveryNeed: 'Replace an address-first assumption with legal W-before-AW handling.',
    viewport: 'desktop',
  },
  {
    id: 'sim-axi',
    label: 'AXI-experienced verification engineer',
    experience: 'AXI channel and ordering experience; limited AHB pipeline debug',
    firstAttemptCorrect: ['task-1', 'task-3', 'task-4', 'task-5', 'task-6'],
    expectedRecoveryNeed: 'Separate the visible pending AHB address from the accepted data/response owner.',
    viewport: 'desktop',
  },
  {
    id: 'sim-senior-mobile',
    label: 'Senior DV mobile and keyboard learner',
    experience: 'Cross-protocol verification and accessibility-aware review',
    firstAttemptCorrect: protocolTaskIds,
    expectedRecoveryNeed: 'Exercise discovery and dense visual containment without a seeded protocol misconception.',
    viewport: '375x812',
  },
];

function isProtocolTask(taskId: PilotTaskId): boolean {
  return protocolTaskIds.includes(taskId);
}

export function runSyntheticSession(
  persona: SyntheticLearnerPersona,
  probes: Readonly<Record<PilotTaskId, PilotProbe>>,
): SyntheticSessionResult {
  const taskIds = [...protocolTaskIds, ...platformTaskIds];
  const tasks = taskIds.map<SyntheticTaskResult>((taskId) => {
    const probe = probes[taskId];
    const protocolTask = isProtocolTask(taskId);
    const firstAttemptCorrect = protocolTask
      ? persona.firstAttemptCorrect.includes(taskId)
      : null;

    return {
      taskId,
      firstAttemptCorrect,
      recoveredThroughAcademy: firstAttemptCorrect === false && probe.passed,
      completedWithoutFacilitator: probe.passed,
      evidence: probe.evidence,
    };
  });

  return { persona, tasks };
}

export function summarizeSyntheticPilot(
  sessions: readonly SyntheticSessionResult[],
): SyntheticPilotSummary {
  const allTasks = sessions.flatMap(session => session.tasks);
  const protocolResults = allTasks.filter(
    (result): result is SyntheticTaskResult & { firstAttemptCorrect: boolean } =>
      result.firstAttemptCorrect !== null,
  );
  const platformResults = allTasks.filter(result =>
    platformTaskIds.includes(result.taskId),
  );
  const protocolFirstAttemptCorrect = protocolResults.filter(
    result => result.firstAttemptCorrect,
  ).length;
  const seededMisconceptions = protocolResults.length - protocolFirstAttemptCorrect;
  const recoveredMisconceptions = protocolResults.filter(
    result => !result.firstAttemptCorrect && result.recoveredThroughAcademy,
  ).length;
  const releaseBlockers = allTasks
    .filter(result => !result.completedWithoutFacilitator)
    .map(result => result.taskId)
    .filter((taskId, index, values) => values.indexOf(taskId) === index);
  const protocolFirstAttemptRate = protocolResults.length === 0
    ? 0
    : protocolFirstAttemptCorrect / protocolResults.length;
  const navigationAndMobileCompleted = platformResults.filter(
    result => result.completedWithoutFacilitator,
  ).length;

  return {
    evidenceClass: 'synthetic-recovery-readiness',
    participantSimulations: sessions.length,
    protocolAttempts: protocolResults.length,
    protocolFirstAttemptCorrect,
    protocolFirstAttemptRate,
    seededMisconceptions,
    recoveredMisconceptions,
    navigationAndMobileAttempts: platformResults.length,
    navigationAndMobileCompleted,
    releaseBlockers,
    syntheticCriteriaPassed:
      sessions.length >= 3 &&
      protocolFirstAttemptRate >= 0.8 &&
      recoveredMisconceptions === seededMisconceptions &&
      navigationAndMobileCompleted === platformResults.length &&
      releaseBlockers.length === 0,
    canPromoteRelease: false,
  };
}
