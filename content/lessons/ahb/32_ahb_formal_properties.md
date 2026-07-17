---
id: "32_ahb_formal_properties"
title: "AHB Formal Properties"
summary: "Using mathematical proofs to guarantee protocol compliance."
protocol: "ahb"
tier: "1"
level: "expert"
order: 32
tags: ["ahb", "verification", "formal"]
relatedLessons: []
prerequisites: ["30_ahb_assertions"]
visualIds: ["fp-ahb-hready-liveness", "model-ahb-dv-rigor"]
exerciseIds: ["lab-ahb-configured-liveness", "ex-ahb-bounded-liveness"]
glossaryTerms: ["Bounded Liveness"]
checklistIds: []
---

While simulation explores generated traces, **Formal Verification** proves properties across all behaviors permitted by the formal model. The result is only as strong as the property, assumptions, reset model, and abstraction boundary; an over-constrained environment can hide a real bug.

Formal tools rely on assertions, but instead of checking them during a simulation run, the tool analyzes the RTL logic gates statically.

We divide formal properties into two categories: Safety and Liveness.

## Safety Properties (Nothing bad ever happens)

Safety properties ensure the protocol rules are never broken. If a safety property fails, the formal tool produces a waveform showing the exact sequence of events that caused the violation.

- **Wait State Lock:** `If a valid NONSEQ/SEQ address phase remains pending with HREADY == 0, its address/control remains stable until completion.` Add separate handling for stalled write data and the protocol-defined IDLE, BUSY, and ERROR exceptions.
- **Two-Cycle Error Guarantee:** `If ERROR1 occurs with HRESP == 1 and HREADY == 0, then ERROR2 has HRESP == 1 and HREADY == 1 on the next cycle.`
- **Exclusive Integrity:** When `Exclusive_Transfers` is declared, capture an accepted address phase's `HEXCL`, `HMASTER`, direction, size, address/granule, and required attributes. Model monitor establishment/invalidation and check `HEXOKAY` only on the corresponding completed response; a successful exclusive read establishes state, while a failed exclusive write has no update and can use `HRESP=OKAY`, `HEXOKAY=0`.
- **Data Stability:** Capture accepted `HWRITE` into data-phase context. If that saved direction is write and global `HREADY=0`, require `HWDATA` stable. Current visible `HWRITE` belongs to the next address phase and cannot classify the stalled payload.

## Liveness Properties (Something good eventually happens)

Liveness properties prevent deadlocks and starvation. They are much harder for formal tools to prove than safety properties.

- **Bounded Liveness (Configured Service Contract):** Trigger only when a valid address phase is **accepted** with `HTRANS[1] && HREADY`. The accepted transfer's completion window starts in its following data phase, so same-edge `HREADY` cannot satisfy it. Reset cancels the obligation through `disable iff (!HRESETn)`. A four-cycle window below is a teaching contract, not a universal AHB maximum.

![Interactive formal example checking a configured four-cycle AHB completion bound](visual:fp-ahb-hready-liveness)
Try it yourself — toggle **HREADY** below and see whether the bounded liveness property holds or breaks, and why.
- **Arbitration Fairness Contract:** `If an eligible master keeps requesting, it receives service within the configured bound.` AHB does not mandate one fairness policy, so assert this only when the product contract promises it and model higher-priority traffic assumptions explicitly.
- **Master Progress Contract:** `After ownership and under a bounded-response environment, the master eventually completes or legally terminates its work.` Separate assumptions about slave/interconnect progress from assertions about master behavior.

Writing these properties in standard SystemVerilog Assertions allows them to be used in both Simulation and Formal Verification.

## Execute the proof contract

The formal-rigor model separates an accepted-transfer antecedent from the following completion window, reset cancellation, environment assumptions, and a cover that demonstrates the antecedent is reachable. It also classifies configuration-derived coverage values as legal, illegal, or ignored. Execute the vacuity and reset cases before treating a green proof as signoff evidence.

![Executable AHB formal model showing accepted-event triggers, reset cancellation, vacuity covers, assumptions, and configuration-derived bins](visual:model-ahb-dv-rigor)
