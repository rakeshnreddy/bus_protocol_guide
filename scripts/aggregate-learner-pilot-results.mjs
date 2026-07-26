#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const taskIds = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8]);
const protocolTaskIds = new Set([1, 2, 3, 4, 5, 6]);
const experienceBands = new Set([
  'new-to-amba',
  'ahb-experienced',
  'axi-experienced',
  'senior-dv',
]);
const checkNames = Object.freeze([
  'keyboard',
  'pointer',
  'themes',
  'reducedMotion',
  'mobile375x812',
  'consoleClean',
  'pageContainment',
]);
const checkResults = new Set(['pass', 'fail', 'not-tested']);
const findingSeverities = new Set([
  'release-blocker',
  'important-follow-up',
  'observation',
]);
const findingStatuses = new Set(['open', 'fixed', 'accepted']);
const findingCategories = new Set([
  'protocol',
  'wording',
  'discoverability',
  'visual',
  'accessibility',
  'platform',
]);
const conditionalGoCategories = new Set(['wording', 'discoverability']);
const productionUrl = 'https://busprotocolguide.vercel.app';
const forbiddenPrivacyKeys = new Set([
  'participantname',
  'fullname',
  'firstname',
  'lastname',
  'email',
  'emailaddress',
  'employer',
  'employername',
  'company',
  'companyname',
  'organization',
  'organizationname',
  'phone',
  'phonenumber',
  'address',
  'streetaddress',
  'productionaddress',
  'designname',
  'confidentialdesigndata',
  'internalwaveform',
]);

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizedKey(key) {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function inspectPrivacy(value, path, errors) {
  if (typeof value === 'string' && /\b[^@\s]+@[^@\s]+\.[^@\s]+\b/.test(value)) {
    errors.push(`${path}: email-like values are not permitted`);
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      inspectPrivacy(item, `${path}[${index}]`, errors),
    );
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    if (forbiddenPrivacyKeys.has(normalizedKey(key))) {
      errors.push(
        `${path}.${key}: identifying or confidential fields are not permitted`,
      );
    }
    inspectPrivacy(child, `${path}.${key}`, errors);
  }
}

function validateNonEmptyString(value, path, errors) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    errors.push(`${path}: expected a non-empty string`);
    return false;
  }
  return true;
}

function validateTask(task, path, errors) {
  if (!isRecord(task)) {
    errors.push(`${path}: expected an object`);
    return;
  }

  if (!Number.isInteger(task.id) || !taskIds.includes(task.id)) {
    errors.push(`${path}.id: expected an integer from 1 through 8`);
  }
  if (
    !validateNonEmptyString(task.route, `${path}.route`, errors) ||
    !task.route.startsWith('/')
  ) {
    errors.push(
      `${path}.route: expected an application route beginning with /`,
    );
  }
  if (typeof task.completedWithoutHelp !== 'boolean') {
    errors.push(`${path}.completedWithoutHelp: expected a boolean`);
  }
  if (!Number.isInteger(task.timeSeconds) || task.timeSeconds < 1) {
    errors.push(`${path}.timeSeconds: expected a positive integer`);
  }
  if (typeof task.brokenMissingOrInaccessible !== 'boolean') {
    errors.push(
      `${path}.brokenMissingOrInaccessible: expected a boolean`,
    );
  }
  if (
    !Array.isArray(task.findingIds) ||
    task.findingIds.some(id => typeof id !== 'string')
  ) {
    errors.push(
      `${path}.findingIds: expected an array of finding-ID strings`,
    );
  }

  if (protocolTaskIds.has(task.id)) {
    if (typeof task.correctFirstAttempt !== 'boolean') {
      errors.push(
        `${path}.correctFirstAttempt: Tasks 1–6 require a boolean`,
      );
    }
    if (typeof task.recoverableThroughAcademy !== 'boolean') {
      errors.push(
        `${path}.recoverableThroughAcademy: Tasks 1–6 require a boolean`,
      );
    }
  } else {
    if (task.correctFirstAttempt !== null) {
      errors.push(`${path}.correctFirstAttempt: Tasks 7–8 require null`);
    }
    if (task.recoverableThroughAcademy !== null) {
      errors.push(
        `${path}.recoverableThroughAcademy: Tasks 7–8 require null`,
      );
    }
  }
}

function validateFinding(finding, path, errors) {
  if (!isRecord(finding)) {
    errors.push(`${path}: expected an object`);
    return;
  }

  if (
    !validateNonEmptyString(finding.id, `${path}.id`, errors) ||
    !/^LP-\d{3,}$/.test(finding.id)
  ) {
    errors.push(`${path}.id: expected a stable ID such as LP-001`);
  }
  if (!findingSeverities.has(finding.severity)) {
    errors.push(
      `${path}.severity: expected release-blocker, important-follow-up, or observation`,
    );
  }
  if (!findingStatuses.has(finding.status)) {
    errors.push(`${path}.status: expected open, fixed, or accepted`);
  }
  if (!findingCategories.has(finding.category)) {
    errors.push(`${path}.category: unsupported finding category`);
  }
  validateNonEmptyString(finding.area, `${path}.area`, errors);
  validateNonEmptyString(finding.routeOrAsset, `${path}.routeOrAsset`, errors);
  validateNonEmptyString(finding.summary, `${path}.summary`, errors);

  if (finding.severity === 'release-blocker' && finding.status === 'fixed') {
    validateNonEmptyString(
      finding.regressionEvidence,
      `${path}.regressionEvidence`,
      errors,
    );
    validateNonEmptyString(
      finding.deploymentEvidence,
      `${path}.deploymentEvidence`,
      errors,
    );
  }
}

export function validateSession(session, source = '<session>') {
  const errors = [];

  if (!isRecord(session)) {
    return { valid: false, errors: [`${source}: expected a JSON object`] };
  }

  inspectPrivacy(session, source, errors);

  if (session.schemaVersion !== '1.0') {
    errors.push(`${source}.schemaVersion: expected "1.0"`);
  }
  if (!['human', 'synthetic'].includes(session.evidenceClass)) {
    errors.push(`${source}.evidenceClass: expected human or synthetic`);
  }

  if (session.evidenceClass === 'human') {
    if (
      typeof session.participantId !== 'string' ||
      !/^P\d{2,3}$/.test(session.participantId)
    ) {
      errors.push(
        `${source}.participantId: human sessions require a pseudonym such as P01`,
      );
    }
  } else if (
    typeof session.participantId !== 'string' ||
    !/^SIM-[A-Z0-9-]+$/.test(session.participantId)
  ) {
    errors.push(
      `${source}.participantId: synthetic sessions require an ID such as SIM-NOVICE`,
    );
  }

  if (!experienceBands.has(session.experienceBand)) {
    errors.push(`${source}.experienceBand: unsupported experience band`);
  }
  if (
    typeof session.testedCommit !== 'string' ||
    !/^[0-9a-f]{40}$/.test(session.testedCommit)
  ) {
    errors.push(`${source}.testedCommit: expected a full 40-character Git commit`);
  }
  if (session.productionUrl !== productionUrl) {
    errors.push(`${source}.productionUrl: expected ${productionUrl}`);
  }
  if (
    typeof session.date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(session.date) ||
    Number.isNaN(Date.parse(`${session.date}T00:00:00Z`))
  ) {
    errors.push(`${source}.date: expected a valid YYYY-MM-DD date`);
  }
  validateNonEmptyString(
    session.primaryViewport,
    `${source}.primaryViewport`,
    errors,
  );
  if (session.mobileViewport !== null && session.mobileViewport !== '375x812') {
    errors.push(`${source}.mobileViewport: expected "375x812" or null`);
  }

  if (!Array.isArray(session.tasks)) {
    errors.push(`${source}.tasks: expected an array`);
  } else {
    session.tasks.forEach((task, index) =>
      validateTask(task, `${source}.tasks[${index}]`, errors),
    );
    const foundTaskIds = session.tasks.filter(isRecord).map(task => task.id);
    for (const taskId of taskIds) {
      if (foundTaskIds.filter(id => id === taskId).length !== 1) {
        errors.push(`${source}.tasks: expected exactly one Task ${taskId}`);
      }
    }
    if (foundTaskIds.some(id => !taskIds.includes(id))) {
      errors.push(`${source}.tasks: found an unsupported task ID`);
    }
  }

  if (!isRecord(session.usabilityChecks)) {
    errors.push(`${source}.usabilityChecks: expected an object`);
  } else {
    for (const name of checkNames) {
      if (!checkResults.has(session.usabilityChecks[name])) {
        errors.push(
          `${source}.usabilityChecks.${name}: expected pass, fail, or not-tested`,
        );
      }
    }
  }

  if (!Array.isArray(session.findings)) {
    errors.push(`${source}.findings: expected an array`);
  } else {
    session.findings.forEach((finding, index) =>
      validateFinding(finding, `${source}.findings[${index}]`, errors),
    );
    const findingIds = session.findings
      .filter(isRecord)
      .map(finding => finding.id);
    if (new Set(findingIds).size !== findingIds.length) {
      errors.push(
        `${source}.findings: finding IDs must be unique within a session`,
      );
    }
    if (Array.isArray(session.tasks)) {
      for (const task of session.tasks.filter(isRecord)) {
        if (!Array.isArray(task.findingIds)) {
          continue;
        }
        for (const findingId of task.findingIds) {
          if (!findingIds.includes(findingId)) {
            errors.push(
              `${source}.tasks[Task ${task.id}].findingIds: ${findingId} does not resolve`,
            );
          }
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length === 0) {
    return null;
  }
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

export function aggregateSessions(sessions) {
  const validationErrors = sessions.flatMap((session, index) => {
    const result = validateSession(session, `session[${index}]`);
    return result.errors;
  });
  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join('\n'));
  }

  const humanSessions = sessions.filter(
    session => session.evidenceClass === 'human',
  );
  const syntheticSessions = sessions.filter(
    session => session.evidenceClass === 'synthetic',
  );
  const protocolTasks = sessions.flatMap(session =>
    session.tasks.filter(task => protocolTaskIds.has(task.id)),
  );
  const firstAttemptCorrect = protocolTasks.filter(
    task => task.correctFirstAttempt,
  ).length;
  const incorrectTasks = protocolTasks.filter(
    task => !task.correctFirstAttempt,
  );
  const navigationTasks = sessions.flatMap(session =>
    session.tasks.filter(task => task.id === 7 || task.id === 8),
  );
  const findings = sessions.flatMap(session => session.findings);
  const activeReleaseBlockers = findings.filter(
    finding =>
      finding.severity === 'release-blocker' &&
      (finding.status !== 'fixed' ||
        !finding.regressionEvidence ||
        !finding.deploymentEvidence),
  );
  const activeImportantFollowUps = findings.filter(
    finding =>
      finding.severity === 'important-follow-up' &&
      finding.status === 'open',
  );
  const conditionalFollowUps = activeImportantFollowUps.filter(finding =>
    conditionalGoCategories.has(finding.category),
  );
  const disqualifyingImportantFollowUps = activeImportantFollowUps.filter(
    finding => !conditionalGoCategories.has(finding.category),
  );
  const brokenTasks = sessions.flatMap(session =>
    session.tasks.filter(task => task.brokenMissingOrInaccessible),
  );

  const usability = Object.fromEntries(
    checkNames.map(name => {
      const results = sessions.map(session => session.usabilityChecks[name]);
      return [
        name,
        {
          pass: results.filter(result => result === 'pass').length,
          fail: results.filter(result => result === 'fail').length,
          notTested: results.filter(result => result === 'not-tested').length,
          criterionPassed:
            results.some(result => result === 'pass') &&
            !results.some(result => result === 'fail'),
        },
      ];
    }),
  );

  const experienceCoverage = {
    newToAmba: humanSessions.some(
      session => session.experienceBand === 'new-to-amba',
    ),
    ahbExperienced: humanSessions.some(
      session => session.experienceBand === 'ahb-experienced',
    ),
    axiExperienced: humanSessions.some(
      session => session.experienceBand === 'axi-experienced',
    ),
    mobile375x812: humanSessions.some(
      session =>
        session.mobileViewport === '375x812' &&
        session.tasks.find(task => task.id === 8)?.completedWithoutHelp,
    ),
  };
  const humanOnly = sessions.length > 0 && syntheticSessions.length === 0;
  const testedCommits = [...new Set(sessions.map(session => session.testedCommit))];
  const productionUrls = [...new Set(sessions.map(session => session.productionUrl))];
  const consistentReleaseTarget =
    testedCommits.length === 1 &&
    productionUrls.length === 1 &&
    productionUrls[0] === productionUrl;
  const cohortSizeEligible =
    humanSessions.length >= 3 && humanSessions.length <= 5;
  const cohortCoverageEligible =
    Object.values(experienceCoverage).every(Boolean);
  const eligibleForReleaseDecision =
    humanOnly &&
    consistentReleaseTarget &&
    cohortSizeEligible &&
    cohortCoverageEligible;
  const protocolFirstAttemptRate =
    protocolTasks.length === 0
      ? 0
      : firstAttemptCorrect / protocolTasks.length;
  const navigationPassed = navigationTasks.every(
    task => task.completedWithoutHelp,
  );
  const recoveryPassed = incorrectTasks.every(
    task => task.recoverableThroughAcademy,
  );
  const usabilityPassed = Object.values(usability).every(
    result => result.criterionPassed,
  );
  const coreCriteriaPassed =
    protocolFirstAttemptRate >= 0.8 &&
    navigationPassed &&
    recoveryPassed &&
    activeReleaseBlockers.length === 0 &&
    disqualifyingImportantFollowUps.length === 0 &&
    brokenTasks.length === 0 &&
    usabilityPassed;

  let decision = 'not-eligible';
  if (eligibleForReleaseDecision && !coreCriteriaPassed) {
    decision = 'no-go';
  } else if (
    eligibleForReleaseDecision &&
    coreCriteriaPassed &&
    conditionalFollowUps.length > 0
  ) {
    decision = 'conditional-go';
  } else if (eligibleForReleaseDecision && coreCriteriaPassed) {
    decision = 'go';
  }

  const eligibilityReasons = [];
  if (!humanOnly) {
    eligibilityReasons.push('release decisions require human-only evidence');
  }
  if (!cohortSizeEligible) {
    eligibilityReasons.push(
      'release decisions require 3–5 human participants',
    );
  }
  if (!consistentReleaseTarget) {
    eligibilityReasons.push(
      'all sessions must target one full commit on the production URL',
    );
  }
  if (!experienceCoverage.newToAmba) {
    eligibilityReasons.push('missing a new-to-AMBA human participant');
  }
  if (!experienceCoverage.ahbExperienced) {
    eligibilityReasons.push('missing an AHB-experienced human participant');
  }
  if (!experienceCoverage.axiExperienced) {
    eligibilityReasons.push('missing an AXI-experienced human participant');
  }
  if (!experienceCoverage.mobile375x812) {
    eligibilityReasons.push('missing a completed human 375x812 mobile task');
  }

  const taskResults = taskIds.map(taskId => {
    const results = sessions.map(session =>
      session.tasks.find(task => task.id === taskId),
    );
    const protocolTask = protocolTaskIds.has(taskId);
    return {
      taskId,
      attempted: results.length,
      completedWithoutHelp: results.filter(
        result => result.completedWithoutHelp,
      ).length,
      correctFirstAttempt: protocolTask
        ? results.filter(result => result.correctFirstAttempt).length
        : null,
      medianTimeSeconds: median(results.map(result => result.timeSeconds)),
      findingCount: results.reduce(
        (count, result) => count + result.findingIds.length,
        0,
      ),
    };
  });

  return {
    schemaVersion: '1.0',
    evidenceClass:
      syntheticSessions.length === 0
        ? 'human'
        : humanSessions.length === 0
          ? 'synthetic'
          : 'mixed',
    sessions: sessions.length,
    humanParticipants: humanSessions.length,
    syntheticParticipants: syntheticSessions.length,
    testedCommit: testedCommits.length === 1 ? testedCommits[0] : null,
    productionUrl: productionUrls.length === 1 ? productionUrls[0] : null,
    experienceCoverage,
    protocolAttempts: protocolTasks.length,
    protocolFirstAttemptCorrect: firstAttemptCorrect,
    protocolFirstAttemptRate,
    navigationAttempts: navigationTasks.length,
    navigationCompletedWithoutHelp: navigationTasks.filter(
      task => task.completedWithoutHelp,
    ).length,
    incorrectAnswers: incorrectTasks.length,
    incorrectAnswersRecoverable: incorrectTasks.filter(
      task => task.recoverableThroughAcademy,
    ).length,
    activeReleaseBlockers: activeReleaseBlockers.map(finding => finding.id),
    activeImportantFollowUps: activeImportantFollowUps.map(
      finding => finding.id,
    ),
    conditionalFollowUps: conditionalFollowUps.map(finding => finding.id),
    disqualifyingImportantFollowUps: disqualifyingImportantFollowUps.map(
      finding => finding.id,
    ),
    brokenMissingOrInaccessibleTasks: brokenTasks.length,
    usability,
    taskResults,
    eligibleForReleaseDecision,
    eligibilityReasons,
    coreCriteriaPassed,
    decision,
    canPromoteStable: decision === 'go',
  };
}

function percentage(rate) {
  return `${(rate * 100).toFixed(1)}%`;
}

export function formatMarkdownReport(summary) {
  const taskRows = summary.taskResults
    .map(
      task =>
        `| ${task.taskId} | ${task.attempted} | ${task.completedWithoutHelp} | ${task.correctFirstAttempt ?? 'N/A'} | ${task.medianTimeSeconds}s | ${task.findingCount} |`,
    )
    .join('\n');
  const reasons =
    summary.eligibilityReasons.length === 0
      ? '- None'
      : summary.eligibilityReasons.map(reason => `- ${reason}`).join('\n');

  return `# Learner Pilot Aggregate

## Evidence and decision

| Measure | Result |
| --- | --- |
| Evidence class | ${summary.evidenceClass} |
| Sessions | ${summary.sessions} (${summary.humanParticipants} human, ${summary.syntheticParticipants} synthetic) |
| Tested commit | ${summary.testedCommit ?? 'Mixed'} |
| Production URL | ${summary.productionUrl ?? 'Mixed'} |
| Protocol first attempts | ${summary.protocolFirstAttemptCorrect}/${summary.protocolAttempts} (${percentage(summary.protocolFirstAttemptRate)}) |
| Navigation/mobile without help | ${summary.navigationCompletedWithoutHelp}/${summary.navigationAttempts} |
| Incorrect answers recoverable | ${summary.incorrectAnswersRecoverable}/${summary.incorrectAnswers} |
| Active release blockers | ${summary.activeReleaseBlockers.length} |
| Broken, missing, or inaccessible task results | ${summary.brokenMissingOrInaccessibleTasks} |
| Eligible for release decision | ${summary.eligibleForReleaseDecision ? 'Yes' : 'No'} |
| Decision | **${summary.decision}** |
| Can promote stable | ${summary.canPromoteStable ? 'Yes' : 'No'} |

## Task results

| Task | Attempted | Without help | Correct first attempt | Median time | Findings |
| ---: | ---: | ---: | ---: | ---: | ---: |
${taskRows}

## Eligibility notes

${reasons}
`;
}

function usage() {
  return `Usage:
  npm run pilot:aggregate -- [--json] <session.json> [session.json ...]

The default output is Markdown. --json emits machine-readable JSON.
Synthetic or mixed evidence can be analyzed but can never authorize promotion.`;
}

function readSessions(filePaths) {
  const sessions = [];
  const errors = [];

  for (const filePath of filePaths) {
    const absolutePath = resolve(filePath);
    let session;
    try {
      session = JSON.parse(readFileSync(absolutePath, 'utf8'));
    } catch (error) {
      errors.push(
        `${filePath}: ${error instanceof Error ? error.message : String(error)}`,
      );
      continue;
    }
    const validation = validateSession(session, filePath);
    errors.push(...validation.errors);
    sessions.push(session);
  }

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
  return sessions;
}

function main(argv) {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(`${usage()}\n`);
    return 0;
  }

  const jsonOutput = argv.includes('--json');
  const filePaths = argv.filter(argument => argument !== '--json');
  if (filePaths.length === 0) {
    process.stderr.write(`${usage()}\n`);
    return 1;
  }

  try {
    const summary = aggregateSessions(readSessions(filePaths));
    process.stdout.write(
      jsonOutput
        ? `${JSON.stringify(summary, null, 2)}\n`
        : formatMarkdownReport(summary),
    );
    return 0;
  } catch (error) {
    process.stderr.write(
      `Learner pilot aggregation failed:\n${error instanceof Error ? error.message : String(error)}\n`,
    );
    return 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
