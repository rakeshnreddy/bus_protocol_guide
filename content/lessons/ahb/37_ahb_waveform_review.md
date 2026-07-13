---
id: "37_ahb_waveform_review"
title: "AHB Waveform Review Pack"
summary: "A rapid-fire self-test to identify issues in common AHB waveforms."
protocol: "ahb"
tier: "1"
level: "expert"
order: 37
tags: ["ahb", "review", "waveforms"]
relatedLessons: []
prerequisites: ["36_ahb_signal_reference"]
visualIds: ["wf-ahb-review-error", "wf-ahb-illegal-htrans", "wf-ahb-wait-state-heavy"]
exerciseIds: ["ex-ahb-review-error"]
glossaryTerms: []
checklistIds: []
---

In a senior DV interview or on a stressful Friday afternoon debug session, you will be handed a waveform and asked, "What is happening here, and is it legal?"

Test your intuition with the following review waveform. Look at the visual first, then answer the interactive question below to see if your analysis was correct.

## Scenario 1: The Aborted Sequence

Analyze the following waveform carefully. Pay special attention to the relationship between the `HRESP` signal and the master's subsequent `HTRANS` behavior.

![Review waveform showing two-cycle ERROR ownership and an optional cancellation of the following transfer](visual:wf-ahb-review-error)

## Scenario 2: The Broken Pending Beat

Find the first edge where the master changes address/control while a valid transfer is still pending. Explain why the checker must identify the owner before reporting the violation.

![Review waveform highlighting an illegal AHB address and HTRANS change during a wait state](visual:wf-ahb-illegal-htrans)

## Scenario 3: The HREADY Domino Effect

Trace which address and data phases are held through the long stall, then identify the first cycle where each can advance again.

![Review waveform tracing accepted address and data owners through multiple AHB wait states](visual:wf-ahb-wait-state-heavy)
