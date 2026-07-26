# AHB/AXI v1.0 Release-Candidate Learner Pilot

## Goal

Confirm that learners can navigate, understand, and apply the completed AHB and AXI curriculum without facilitator correction before promoting `v1.0.0-rc.1` to `v1.0.0`.

## Pilot kit

- `docs/LEARNER_PILOT_FACILITATOR_GUIDE.md` — exact routes, task prompts,
  answer rubric, primary-source anchors, scoring, and severity definitions.
- `docs/LEARNER_PILOT_SESSION_TEMPLATE.md` — anonymized per-participant
  evidence capture.
- `docs/LEARNER_PILOT_REPORT_TEMPLATE.md` — aggregate metrics and release
  decision.
- `.github/ISSUE_TEMPLATE/learner-pilot-finding.yml` — privacy-safe actionable
  finding intake.
- `docs/LEARNER_PILOT_DRY_RUN_2026-07-27.md` — scripted facilitator readiness
  evidence; it is not a substitute for real participant results.
- `docs/LEARNER_PILOT_SIMULATION_REPORT_2026-07-27.md` — reproducible
  four-persona recovery simulation; it cannot authorize a stable release.

## Participants

Recruit 3–5 learners:

- at least one engineer new to AMBA;
- at least one RTL or verification engineer with AHB experience;
- at least one engineer with AXI experience;
- at least one participant who completes the mobile checks at 375 px width.

Do not coach protocol answers during a task. Record where the learner hesitates, searches, backtracks, or asks for clarification.

## Pilot path

Each participant completes these tasks:

1. Use Foundations 03 to explain the difference between AHB phase overlap and AXI outstanding transactions.
2. Diagnose one AHB wait-state or ERROR scenario and identify the address owner and data/response owner.
3. Use an AHB burst visual or calculator to determine whether a transfer crosses a 1 KB boundary.
4. Explain the AXI write-response prerequisites, including W-before-AW behavior and the accepted final W beat.
5. Use the formal WLAST playground to identify an early or missing WLAST.
6. Use the AXI burst calculator to evaluate an unaligned transfer and a 4 KB boundary case.
7. Find one answer through production search and one through the Visuals Explorer.
8. Repeat one lesson-and-visual task on a 375 px-wide mobile viewport.

## Evidence to capture

For each task, record:

- participant role and relevant experience;
- route and device/viewport;
- completed without help: yes or no;
- answer correct on first attempt: yes or no;
- time to completion;
- confusing term, label, control, or transition;
- missing, clipped, overflowing, or unreadable content;
- protocol-correctness concern with the exact lesson or visual;
- severity: release blocker, important follow-up, or observation.

Do not collect confidential design data, production addresses, or employer-specific protocol details.

## Release criteria

Promote the release candidate only when:

- every participant completes navigation without facilitator intervention;
- at least 80% of protocol tasks are correct on the first attempt;
- every incorrect answer is recoverable through the lesson, linked visual, glossary, or feedback;
- there are zero protocol-accuracy release blockers;
- there are zero missing visuals, exercises, blank regions, console errors, or page-level horizontal overflows;
- keyboard, pointer, theme, reduced-motion, and mobile checks remain usable;
- every release blocker is fixed with a regression test and verified deployment.

## Decision

- **Go:** all release criteria pass; tag the verified commit `v1.0.0`.
- **Conditional go:** only wording or discoverability follow-ups remain and none can cause a wrong protocol conclusion.
- **No go:** any protocol error, broken route, missing learning asset, inaccessible required interaction, or unrecoverable learner misconception remains.

Summarize outcomes in a dated pilot report under `docs/` without including participant names or confidential information.
