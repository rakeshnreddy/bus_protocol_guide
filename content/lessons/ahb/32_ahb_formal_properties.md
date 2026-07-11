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
visualIds: []
exerciseIds: ["ex-ahb-bounded-liveness"]
glossaryTerms: ["Bounded Liveness"]
checklistIds: []
---

While simulation relies on generating enough random traffic to hopefully hit every bug, **Formal Verification** uses mathematical proofs to guarantee that a bug *cannot possibly exist* under any circumstances.

Formal tools rely on assertions, but instead of checking them during a simulation run, the tool analyzes the RTL logic gates statically.

We divide formal properties into two categories: Safety and Liveness.

## Safety Properties (Nothing bad ever happens)

Safety properties ensure the protocol rules are never broken. If a safety property fails, the formal tool produces a waveform showing the exact sequence of events that caused the violation.

- **Wait State Lock:** `If HREADY == 0, then HTRANS, HADDR, HWRITE, HSIZE, and HBURST must remain unchanged in the next cycle.`
- **Two-Cycle Error Guarantee:** `If a slave asserts HRESP == 1, it must hold HREADY == 0 for exactly one cycle, and then assert HREADY == 1 on the next cycle while maintaining HRESP == 1.`
- **Exclusive Integrity:** `A slave must never assert HEXOKAY == 1 unless the preceding Address Phase had HEXCL == 1.`
- **Data Stability:** `If a master is writing (HWRITE == 1) and HREADY == 0, the master must keep HWDATA stable in the next cycle.`

## Liveness Properties (Something good eventually happens)

Liveness properties prevent deadlocks and starvation. They are much harder for formal tools to prove than safety properties.

- **Bounded Liveness (Non-blocking Slave):** `If a master initiates a valid NONSEQ or SEQ transfer, the slave must assert HREADY == 1 within 4 cycles.` In real formal verification, liveness is often unbounded ("eventually"), but for hardware implementations and interactive teaching tools, we bound the property to a fixed window (e.g., max 4 wait states) so we can give definitive pass/fail results.

![AHB Liveness: HREADY Assertion](visual:fp-ahb-hready-liveness)
Try it yourself — toggle **HREADY** below and see whether the bounded liveness property holds or breaks, and why.
- **Arbitration Fairness:** `If a master asserts HBUSREQ, the Arbiter must eventually assert HGRANT.` (A master cannot be starved forever by higher-priority traffic).
- **Master Progress:** `If a master is granted the bus, it must eventually complete its burst and return to the IDLE state.`

Writing these properties in standard SystemVerilog Assertions allows them to be used in both Simulation and Formal Verification.
