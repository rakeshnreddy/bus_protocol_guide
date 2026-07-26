# Learner Pilot Facilitator Dry Run — 2026-07-27

## Purpose

Validate that the facilitator instructions map to usable production routes and
interactions before recruiting learners. This is a scripted readiness check,
not participant evidence, and cannot satisfy the learner-pilot release criteria.

## Environment

| Field | Value |
| --- | --- |
| Production URL | https://busprotocolguide.vercel.app |
| Tested commit | `3e59270f1214408d521a9fad6e9db16175c8a212` |
| Desktop viewport | `1440 × 1000` |
| Mobile viewport | `375 × 812` |
| Browser automation | agent-browser 0.33.0, Chromium |
| Theme/motion mobile check | Dark system result, reduced motion |

## Task results

| Task | Result | Evidence |
| ---: | --- | --- |
| 1. Phase overlap vs outstanding | Pass | `/lesson/03_timing_diagrams` loaded with its AHB overlap, accepted-context, AXI outstanding, ID, and retirement teaching; no missing state or page overflow. |
| 2. AHB wait-state ownership | Pass | `/lesson/16_wait_states_hready` rendered the wait waveform, visible/pending/accepted state model, and diagnostic lab without a missing visual. |
| 3. AHB 1 KB boundary | Pass | Changing the live calculator to `0x03F4`, four accepted beats, and four bytes per beat produced final byte/end-exclusive `0x0403 / 0x0404`, `crosses region`, and the legal `3 + 1` request split. |
| 4. AXI4 write response | Pass | `/lesson/13_write_transaction_walkthrough` rendered W-before-AW, `BVALID`, accepted-final-W prerequisites, and the executable write-association model without overflow or missing state. |
| 5. Transaction-aware WLAST | Pass | On `/lesson/37_axi_formal_property_patterns`, toggling cycle 8 `WLAST` produced `FAIL (Property Violation)`. Focusing `Inspect cycle 8` and pressing Enter exposed: `WLAST is asserted early for AWID 9, accepted at cycle 7, AWLEN=2. This is accepted beat 2 of 3.` |
| 6. AXI lanes and 4 KB | Pass | The initial `0x0FF8` case showed final byte/end-exclusive `0x1007 / 0x1008` and a `2 + 2` split. Changing the start to `0x1001` showed first active range `0x1001–0x1003`, mask `0x0E`, next address `0x1004`, and mask `0xF0`. |
| 7. Search and Visuals Explorer | Pass | Searching `4 KB` exposed the glossary, rule, and lesson; selecting the lesson navigated to `/lesson/25_4kb_boundary_rule`. Filtering `/visuals` to AXI plus Checker model exposed and expanded the AXI burst checker. |
| 8. Exact mobile repeat | Pass | `/lesson/25_4kb_boundary_rule` at `375 × 812` had no page overflow, missing visual, undersized visible button, or running animation. Waveform, calculator, checker trace, and diagnostic evidence used internal horizontal scrolling. |

## Console and rendering result

- No console errors or page errors were reported.
- All directly tested lesson and shared routes rendered their expected headings.
- Desktop and mobile page-level horizontal overflow checks were false.
- Reduced-motion media preference was active and no animation remained running.
- Visible buttons on the mobile task met the 44 × 44 px minimum.

## Runbook adjustment

The formal-property failure status appears immediately after toggling `WLAST`,
while the exact transaction diagnostic appears after selecting the failing
cycle. The facilitator guide now states that second step explicitly.

## Disposition

**Facilitator dry run passed.**

The pilot kit is ready for 3–5 anonymized learner sessions. Promotion to
`v1.0.0` remains blocked on real learner evidence and the release criteria in
`docs/LEARNER_PILOT_PLAN.md`.
