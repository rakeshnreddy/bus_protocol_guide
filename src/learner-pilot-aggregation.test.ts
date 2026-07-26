import {
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterAll, describe, expect, it } from 'vitest';

type CheckResult = 'pass' | 'fail' | 'not-tested';

interface PilotTaskFixture {
  id: number;
  route: string;
  completedWithoutHelp: boolean;
  correctFirstAttempt: boolean | null;
  recoverableThroughAcademy: boolean | null;
  timeSeconds: number;
  brokenMissingOrInaccessible: boolean;
  findingIds: string[];
}

interface FindingFixture {
  id: string;
  severity: 'release-blocker' | 'important-follow-up' | 'observation';
  status: 'open' | 'fixed' | 'accepted';
  category:
    | 'protocol'
    | 'wording'
    | 'discoverability'
    | 'visual'
    | 'accessibility'
    | 'platform';
  area: string;
  routeOrAsset: string;
  summary: string;
  regressionEvidence?: string;
  deploymentEvidence?: string;
}

interface PilotSessionFixture {
  schemaVersion: '1.0';
  evidenceClass: 'human' | 'synthetic';
  participantId: string;
  experienceBand:
    | 'new-to-amba'
    | 'ahb-experienced'
    | 'axi-experienced'
    | 'senior-dv';
  testedCommit: string;
  productionUrl: string;
  date: string;
  primaryViewport: string;
  mobileViewport: '375x812' | null;
  tasks: PilotTaskFixture[];
  usabilityChecks: Record<string, CheckResult>;
  findings: FindingFixture[];
  participantName?: string;
}

const repositoryRoot = process.cwd();
const scriptPath = join(
  repositoryRoot,
  'scripts/aggregate-learner-pilot-results.mjs',
);
const fixtureDirectory = mkdtempSync(
  join(tmpdir(), 'bus-protocol-pilot-aggregation-'),
);

afterAll(() => {
  rmSync(fixtureDirectory, { recursive: true, force: true });
});

function createSession(
  participantId: string,
  experienceBand: PilotSessionFixture['experienceBand'],
  incorrectTaskId: number,
): PilotSessionFixture {
  const routes = [
    '/lesson/03_timing_diagrams',
    '/lesson/16_wait_states_hready',
    '/lesson/16_wait_states_hready',
    '/lesson/13_write_transaction_walkthrough',
    '/lesson/37_axi_formal_property_patterns',
    '/lesson/25_4kb_boundary_rule',
    '/visuals',
    '/lesson/25_4kb_boundary_rule',
  ];

  return {
    schemaVersion: '1.0',
    evidenceClass: 'human',
    participantId,
    experienceBand,
    testedCommit: '07e920dba487680a4f4ee994181bb6759896fdfe',
    productionUrl: 'https://busprotocolguide.vercel.app',
    date: '2026-07-27',
    primaryViewport: '1440x1000',
    mobileViewport: '375x812',
    tasks: routes.map((route, index) => {
      const id = index + 1;
      const protocolTask = id <= 6;
      const correct = protocolTask ? id !== incorrectTaskId : null;
      return {
        id,
        route,
        completedWithoutHelp: true,
        correctFirstAttempt: correct,
        recoverableThroughAcademy: protocolTask ? true : null,
        timeSeconds: 90 + id * 10,
        brokenMissingOrInaccessible: false,
        findingIds: [],
      };
    }),
    usabilityChecks: {
      keyboard: 'pass',
      pointer: 'pass',
      themes: 'pass',
      reducedMotion: 'pass',
      mobile375x812: 'pass',
      consoleClean: 'pass',
      pageContainment: 'pass',
    },
    findings: [],
  };
}

function writeSession(name: string, session: PilotSessionFixture): string {
  const path = join(fixtureDirectory, `${name}.json`);
  writeFileSync(path, JSON.stringify(session), 'utf8');
  return path;
}

function runAggregator(sessions: PilotSessionFixture[]) {
  const paths = sessions.map((session, index) =>
    writeSession(`session-${Date.now()}-${index}`, session),
  );
  return spawnSync(process.execPath, [scriptPath, '--json', ...paths], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  });
}

function eligibleCohort(): PilotSessionFixture[] {
  return [
    createSession('P01', 'new-to-amba', 1),
    createSession('P02', 'ahb-experienced', 4),
    createSession('P03', 'axi-experienced', 2),
  ];
}

describe('learner pilot aggregation CLI', () => {
  it('produces go only for a complete privacy-safe human cohort', () => {
    const result = runAggregator(eligibleCohort());

    expect(result.status).toBe(0);
    const summary = JSON.parse(result.stdout) as {
      evidenceClass: string;
      humanParticipants: number;
      protocolFirstAttemptCorrect: number;
      protocolAttempts: number;
      protocolFirstAttemptRate: number;
      eligibleForReleaseDecision: boolean;
      decision: string;
      canPromoteStable: boolean;
    };
    expect(summary).toMatchObject({
      evidenceClass: 'human',
      humanParticipants: 3,
      protocolFirstAttemptCorrect: 15,
      protocolAttempts: 18,
      eligibleForReleaseDecision: true,
      decision: 'go',
      canPromoteStable: true,
    });
    expect(summary.protocolFirstAttemptRate).toBeCloseTo(5 / 6);
  });

  it('returns conditional-go for a non-blocking open follow-up', () => {
    const sessions = eligibleCohort();
    sessions[0].findings.push({
      id: 'LP-001',
      severity: 'important-follow-up',
      status: 'open',
      category: 'discoverability',
      area: 'discovery',
      routeOrAsset: '/visuals',
      summary: 'A label caused recoverable hesitation.',
    });
    sessions[0].tasks[6].findingIds.push('LP-001');

    const result = runAggregator(sessions);
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      decision: 'conditional-go',
      canPromoteStable: false,
      activeImportantFollowUps: ['LP-001'],
    });
  });

  it('returns no-go for an unrecoverable answer or active release blocker', () => {
    const sessions = eligibleCohort();
    sessions[0].tasks[0].recoverableThroughAcademy = false;
    sessions[1].findings.push({
      id: 'LP-002',
      severity: 'release-blocker',
      status: 'open',
      category: 'protocol',
      area: 'AXI',
      routeOrAsset: '/lesson/13_write_transaction_walkthrough',
      summary: 'The observed explanation can teach a wrong protocol conclusion.',
    });
    sessions[1].tasks[3].findingIds.push('LP-002');

    const result = runAggregator(sessions);
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      eligibleForReleaseDecision: true,
      coreCriteriaPassed: false,
      decision: 'no-go',
      canPromoteStable: false,
      activeReleaseBlockers: ['LP-002'],
    });
  });

  it('does not grant conditional-go to a non-wording platform follow-up', () => {
    const sessions = eligibleCohort();
    sessions[0].findings.push({
      id: 'LP-004',
      severity: 'important-follow-up',
      status: 'open',
      category: 'platform',
      area: 'production',
      routeOrAsset: '/search',
      summary: 'A platform issue needs remediation before release.',
    });
    sessions[0].tasks[6].findingIds.push('LP-004');

    const result = runAggregator(sessions);
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      decision: 'no-go',
      canPromoteStable: false,
      disqualifyingImportantFollowUps: ['LP-004'],
    });
  });

  it('analyzes synthetic evidence but permanently rejects release eligibility', () => {
    const sessions = eligibleCohort().map((session, index) => ({
      ...session,
      evidenceClass: 'synthetic' as const,
      participantId: `SIM-PERSONA-${index + 1}`,
    }));

    const result = runAggregator(sessions);
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      evidenceClass: 'synthetic',
      humanParticipants: 0,
      syntheticParticipants: 3,
      eligibleForReleaseDecision: false,
      decision: 'not-eligible',
      canPromoteStable: false,
    });
  });

  it('fails closed for incomplete or privacy-unsafe evidence', () => {
    const incomplete = createSession('P01', 'new-to-amba', 1);
    incomplete.tasks.pop();
    const incompleteResult = runAggregator([incomplete]);

    expect(incompleteResult.status).toBe(1);
    expect(incompleteResult.stderr).toContain(
      'expected exactly one Task 8',
    );

    const privacyUnsafe = createSession('P02', 'ahb-experienced', 4);
    privacyUnsafe.participantName = 'Identifying value';
    privacyUnsafe.findings.push({
      id: 'LP-003',
      severity: 'observation',
      status: 'open',
      category: 'platform',
      area: 'session',
      routeOrAsset: '/visuals',
      summary: 'Contact learner@example.com for notes.',
    });
    const privacyResult = runAggregator([privacyUnsafe]);

    expect(privacyResult.status).toBe(1);
    expect(privacyResult.stderr).toContain(
      'identifying or confidential fields are not permitted',
    );
    expect(privacyResult.stderr).toContain(
      'email-like values are not permitted',
    );
  });
});
