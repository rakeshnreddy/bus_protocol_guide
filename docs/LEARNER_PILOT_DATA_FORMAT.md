# Learner Pilot Machine-Readable Evidence

## Purpose

Use the versioned JSON session format to aggregate anonymized learner evidence
without treating synthetic simulations as human validation. The executable
validator enforces the stricter task-specific rules and privacy checks; the
JSON Schema documents the portable structure.

Do not commit raw participant session files. Keep them in the ignored local
`pilot-sessions/` directory, remove identifying or confidential information,
and commit only an anonymized aggregate report when appropriate.

## Capture workflow

1. Complete the Markdown session sheet while facilitating the pilot.
2. Translate the scored fields into one JSON file per participant.
3. Use `P01`, `P02`, and similar pseudonyms. Never include a name, email,
   employer, organization, phone number, production address, confidential
   design detail, or proprietary waveform.
4. Use `evidenceClass: "human"` only for an actual observed learner session.
   Use `evidenceClass: "synthetic"` for automation, rehearsals, or modeled
   personas.
5. Validate and aggregate the files:

```bash
npm run pilot:aggregate -- pilot-sessions/P01.json pilot-sessions/P02.json pilot-sessions/P03.json
npm run pilot:aggregate -- --json pilot-sessions/*.json
```

The first command emits a Markdown report. The second emits machine-readable
JSON. Validation fails closed for incomplete tasks, unresolved finding IDs,
invalid evidence values, and obvious identifying fields or email-like values.

## Session example

This abbreviated structure shows the field meanings. A real file must contain
exactly one entry for every Task 1 through Task 8.

```json
{
  "schemaVersion": "1.0",
  "evidenceClass": "human",
  "participantId": "P01",
  "experienceBand": "new-to-amba",
  "testedCommit": "07e920dba487680a4f4ee994181bb6759896fdfe",
  "productionUrl": "https://busprotocolguide.vercel.app",
  "date": "2026-07-27",
  "primaryViewport": "1440x1000",
  "mobileViewport": null,
  "tasks": [
    {
      "id": 1,
      "route": "/lesson/03_timing_diagrams",
      "completedWithoutHelp": true,
      "correctFirstAttempt": false,
      "recoverableThroughAcademy": true,
      "timeSeconds": 210,
      "brokenMissingOrInaccessible": false,
      "findingIds": []
    }
  ],
  "usabilityChecks": {
    "keyboard": "pass",
    "pointer": "pass",
    "themes": "not-tested",
    "reducedMotion": "not-tested",
    "mobile375x812": "not-tested",
    "consoleClean": "pass",
    "pageContainment": "pass"
  },
  "findings": []
}
```

Tasks 1–6 require Boolean `correctFirstAttempt` and
`recoverableThroughAcademy` values. Tasks 7–8 require `null` for both fields.
`brokenMissingOrInaccessible` records a missing visual or exercise, blank
region, console/page failure, page overflow, or inaccessible required
interaction.

## Findings and decisions

Finding IDs use `LP-001` or a higher number. A fixed release blocker requires
both regression and deployment evidence. An unresolved or unevidenced release
blocker produces `no-go` for an otherwise eligible human cohort.
All participant files must name the same full tested commit and the production
URL. Open important findings are eligible for `conditional-go` only when their
category is `wording` or `discoverability`; other categories require a
`no-go` disposition or remediation.

The aggregator returns:

- `not-eligible` when evidence is synthetic or mixed, fewer than three or more
  than five human sessions exist, the required experience mix is absent, or no
  human completes the exact `375x812` task;
- `no-go` when an eligible cohort fails a release criterion;
- `conditional-go` when every core criterion passes but an important wording
  or discoverability follow-up remains open;
- `go` only when all eligibility and core criteria pass with no open important
  follow-up.

`canPromoteStable` is true only for `go`. Synthetic sessions can exercise the
same calculations but can never authorize promotion.
