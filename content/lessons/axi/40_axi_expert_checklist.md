---
id: "40_axi_expert_checklist"
tier: "3"
level: "advanced"
protocol: "axi"
title: "AXI Expert Checklist"
section: "H"
order: 40
exerciseIds: []
summary: "An expert checklist for reviewing and verifying AXI implementations."
tags:
  - axi
  - checklist
  - review
prerequisites: []
relatedLessons: []
visualIds: ["sig-axi-signoff-evidence", "model-signoff-traceability"]
glossaryTerms: []
checklistIds: ["axi-expert"]
---

# AXI Expert Checklist

Before signing off an AXI-based IP or interconnect, run through this expert checklist. A “yes” is meaningful only when it points to reviewable evidence and the checker configuration matches the implemented AXI revision and options.

Use the evidence board first to connect each risk with an assertion, scoreboard result, coverage report, configuration audit, or performance contract. Then complete the interactive checklist below the lesson.

![AXI signoff evidence board connecting protocol, ordering, stress, configuration, coverage, and progress risks to concrete artifacts](visual:sig-axi-signoff-evidence)

Use the traceability model to inspect the minimum review record behind a closed item: requirement and revision/configuration, stimulus, checker, coverage, evidence artifact, owner, latest regression, reviewer, and any justified waiver. A configuration mismatch or unreviewed exclusion remains open even when a dashboard reports 100%.

![Executable signoff traceability model linking requirements to owned, reviewed, configuration-specific evidence](visual:model-signoff-traceability)
