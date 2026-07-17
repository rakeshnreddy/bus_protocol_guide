---
id: "35_ahb_expert_checklist"
title: "AHB Expert Checklist"
summary: "An interactive pre-signoff review tool for AHB designs."
protocol: "ahb"
tier: "1"
level: "expert"
order: 35
tags: ["ahb", "review", "checklist"]
relatedLessons: []
prerequisites: ["34_debug_case_studies"]
visualIds: ["sig-ahb-signoff-evidence", "model-signoff-traceability"]
exerciseIds: []
glossaryTerms: []
checklistIds: ["chk-ahb-expert"]
---

Before declaring an AHB master or slave "verified," run through this expert checklist. It covers the most common fatal flaws found in real-world silicon designs.

Checking every box is not itself signoff. Closure is configuration-specific and evidence-based: each item needs a linked artifact, owner, specification revision and optional-property configuration, latest regression status, and a reviewed waiver or exclusion status where applicable.

Before ticking a box, inspect the evidence board and name the artifact that proves the claim. The interactive checklist follows below the lesson.

![Interactive AHB signoff evidence board linking protocol risks to assertions, scoreboards, coverage, and review artifacts](visual:sig-ahb-signoff-evidence)

Use the traceability model to inspect the minimum review record behind a closed item: requirement and revision/configuration, stimulus, checker, coverage, evidence artifact, owner, latest regression, reviewer, and any justified waiver. A zero-hit planned bin creates work; it does not become evidence merely because the overall percentage is high.

![Executable signoff traceability model linking requirements to owned, reviewed, configuration-specific evidence](visual:model-signoff-traceability)
