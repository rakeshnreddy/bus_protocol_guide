# Synthetic Learner Pilot Simulation Report — 2026-07-27

## Purpose and evidence boundary

This report records deterministic synthetic-persona sessions used to stress the
pilot rubric, recovery paths, calculators, formal evaluator, search index, and
visual registry before real learner sessions.

Synthetic sessions are not human usability or comprehension evidence. They
cannot authorize promotion to `v1.0.0`, even when every synthetic criterion
passes.

## Reproduction

```bash
npm run pilot:simulate
```

The command executes `src/learner-pilot-simulation.test.ts` against the real
academy sources and models. It fails if a required lesson phrase, calculator
result, WLAST diagnostic, search destination, visual registration, or
responsive/reduced-motion capability probe disappears.

## Simulated personas

| Persona | Experience model | Seeded recovery need | Viewport emphasis |
| --- | --- | --- | --- |
| New-to-AMBA learner | Digital-design fundamentals; no prior AMBA project | AHB overlap vs AXI outstanding state; AXI4 write-response dependencies | Desktop |
| AHB-experienced verification engineer | AHB monitor and scoreboard work; limited AXI ownership work | Legal W-before-AW handling and accepted early-data retention | Desktop |
| AXI-experienced verification engineer | AXI channel and ordering work; limited AHB pipeline debug | Pending visible AHB address vs accepted data/response owner | Desktop |
| Senior DV mobile and keyboard learner | Cross-protocol and accessibility-aware review | Discovery and dense visual containment; no seeded protocol misconception | `375 × 812` |

## Aggregate result

| Metric | Result |
| --- | ---: |
| Synthetic personas | 4 |
| Tasks per persona | 8 |
| Protocol attempts, Tasks 1–6 | 24 |
| Correct first attempts | 20 |
| Synthetic first-attempt rate | 83.3% |
| Seeded misconceptions | 4 |
| Recovered through academy evidence | 4 / 4 |
| Search/visual/mobile attempts | 8 |
| Search/visual/mobile completions | 8 / 8 |
| Failed evidence probes | 0 |
| Synthetic criteria | Pass |
| Eligible to promote `v1.0.0` | **No — real learner evidence required** |

## Executed evidence

| Task | Executed probe |
| ---: | --- |
| 1. Phase overlap vs outstanding | Foundations 03 must separately contain AHB phase overlap, accepted context, AXI outstanding requests, and ID ordering/correlation. |
| 2. AHB wait-state ownership | AHB 16 must expose pending valid address state and the accepted transfer that owns the active data/response phase. |
| 3. AHB 1 KB boundary | The production `calculateBurst` function evaluates `0x3F4`, four beats, four bytes as final byte/end-exclusive `0x403 / 0x404` with a `3 + 1` split. |
| 4. AXI4 write response | AXI 13 must retain accepted pre-address W, require accepted AW plus accepted final W before `BVALID`, and keep `BVALID` independent of `BREADY`. |
| 5. Transaction-aware WLAST | The production formal evaluator must identify early `WLAST` for AWID 9, `AWLEN=2`, accepted beat 2 of 3. |
| 6. AXI lanes and 4 KB | The production calculator must produce final byte/end-exclusive `0x1007 / 0x1008`, a `2 + 2` split, and unaligned masks `0x0E` then `0xF0`. |
| 7. Search and Visuals Explorer | The production search index must resolve `/lesson/25_4kb_boundary_rule`; the registry must resolve `model-axi-burst-checker` as a checker model. |
| 8. Mobile repeat | Responsive sources must retain internal calculator/checker scrolling and reduced-motion rules; the dated live facilitator dry run supplies exact browser evidence. |

## Simulated recovery paths

- The new-to-AMBA persona recovered the overlap/outstanding distinction in
  Foundations 03 and the AXI4 B-response dependencies in AXI 13.
- The AHB-experienced persona recovered the legal W-before-AW model from the
  AXI write walkthrough and executable checker.
- The AXI-experienced persona recovered AHB address/data ownership from AHB 16's
  visible, pending, accepted, and active-owner model.
- The senior mobile persona exercised the no-misconception path while retaining
  the platform task requirements.

## Disposition

**Synthetic recovery readiness passed.**

This result meaningfully advances release confidence by proving that the pilot
rubric is executable and its recovery evidence is present. The remaining gate
is still 3–5 anonymized real learner sessions using
`docs/LEARNER_PILOT_SESSION_TEMPLATE.md`.
