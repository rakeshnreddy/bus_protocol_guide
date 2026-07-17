---
id: "16_wait_states_hready"
title: "Wait States and HREADY"
summary: "How slaves stall the pipeline, and how stalling the Data Phase inherently stalls the subsequent Address Phase."
protocol: "ahb"
tier: "1"
level: "advanced"
order: 16
tags: ["ahb", "timing", "wait-states", "hready"]
relatedLessons: []
prerequisites: ["15_address_data_phase"]
visualIds: ["wf-ahb-wait-state-heavy", "model-ahb-core-checker"]
exerciseIds: ["lab-ahb-stall-stability"]
glossaryTerms: ["HREADY"]
checklistIds: []
---

Because AHB is pipelined (Address Phase N+1 overlaps with Data Phase N), introducing a wait state has a cascading effect on the bus.

The active subordinate drives `HREADYOUT`; the interconnect routes that value to global `HREADY`. When global `HREADY=0`, it extends Data Phase N and prevents a pending valid Address Phase N+1 from being accepted. The manager retains that complete valid address/control context and any stalled write data until the completion/acceptance edge.

Select Cycles 2–3 and 5–7 to see the domino effect: the current data beat waits, the following address freezes, and every later completion moves outward.

![INCR4 write burst showing HREADY wait states freezing the following address phase](visual:wf-ahb-wait-state-heavy)

## Bug Gallery: The Wait State Domino Effect

Consider a 4-beat burst.
- Cycle 1: Address Phase 1.
- Cycle 2: Data Phase 1 (Slave drives `HREADY=0`). Address Phase 2 is broadcast by the master.
- Cycle 3: Data Phase 1 continues (`HREADY=0`). Address Phase 2 MUST be held stable by the master.

**Common Master Bug:** The master logic sees that it has already broadcast Address Phase 2. In Cycle 3, its internal counter increments, and it drives Address Phase 3, even though `HREADY` is still `0`. This destroys Address Phase 2 entirely! The slave will eventually sample Address Phase 3 instead, skipping a beat and corrupting the memory transfer.

**Common Slave Bug:** The slave forgets that `HREADY` is a global signal. If Slave B is currently executing a transfer and driving `HREADYOUT=0`, Slave A (who might be targeted by the next transfer) must see that global `HREADY=0` and realize that its own Address Phase hasn't finished yet. If Slave A starts fetching data before `HREADY` is high, it will fetch the wrong data or corrupt its internal state.

The freeze rule is signal- and state-specific. IDLE can change to NONSEQ during a wait, BUSY has burst-dependent legal changes, and ERROR1 permits cancellation of the pending transfer. AHB defines no universal maximum wait-state count; a timeout or bounded-service check is a configured implementation contract with stated assumptions, not a base-protocol safety rule.

## Execute the phase-aware checker

The model retains three distinct states: the currently visible address/control, any pending valid address that has not yet been accepted, and the accepted transfer that owns the active data/response phase. Execute the zero-wait, stalled-burst, boundary-error, and two-cycle ERROR scenarios to see when counters allocate and retire. This is the state boundary a monitor needs before it can check beat count, stability, alignment, the 1 KB rule, and response timing without confusing adjacent pipeline phases.

![Executable AHB core checker showing visible, pending, accepted, and completed transfer state](visual:model-ahb-core-checker)
