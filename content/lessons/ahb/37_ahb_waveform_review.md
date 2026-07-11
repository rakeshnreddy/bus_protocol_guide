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
visualIds: ["wf-ahb-review-error"]
exerciseIds: ["ex-ahb-review-error"]
glossaryTerms: []
checklistIds: []
---

In a senior DV interview or on a stressful Friday afternoon debug session, you will be handed a waveform and asked, "What is happening here, and is it legal?"

Test your intuition with the following review waveform. Look at the visual first, then answer the interactive question below to see if your analysis was correct.

## Scenario 1: The Aborted Sequence

Analyze the following waveform carefully. Pay special attention to the relationship between the `HRESP` signal and the master's subsequent `HTRANS` behavior.

![wf-ahb-review-error](visual:wf-ahb-review-error)
