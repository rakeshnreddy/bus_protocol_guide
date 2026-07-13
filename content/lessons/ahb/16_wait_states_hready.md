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
visualIds: ["wf-ahb-wait-state-heavy"]
exerciseIds: []
glossaryTerms: ["HREADY"]
checklistIds: []
---

Because AHB is pipelined (Address Phase N+1 overlaps with Data Phase N), introducing a wait state has a cascading effect on the bus.

When a slave drives `HREADY = 0`, it extends Data Phase N. Because Data Phase N is extended, the master **cannot** move on to Data Phase N+1. Therefore, the master must freeze Address Phase N+1 exactly as it is until `HREADY` goes back to `1`.

Select Cycles 2–3 and 5–7 to see the domino effect: the current data beat waits, the following address freezes, and every later completion moves outward.

![INCR4 write burst showing HREADY wait states freezing the following address phase](visual:wf-ahb-wait-state-heavy)

## Bug Gallery: The Wait State Domino Effect

Consider a 4-beat burst.
- Cycle 1: Address Phase 1.
- Cycle 2: Data Phase 1 (Slave drives `HREADY=0`). Address Phase 2 is broadcast by the master.
- Cycle 3: Data Phase 1 continues (`HREADY=0`). Address Phase 2 MUST be held stable by the master.

**Common Master Bug:** The master logic sees that it has already broadcast Address Phase 2. In Cycle 3, its internal counter increments, and it drives Address Phase 3, even though `HREADY` is still `0`. This destroys Address Phase 2 entirely! The slave will eventually sample Address Phase 3 instead, skipping a beat and corrupting the memory transfer.

**Common Slave Bug:** The slave forgets that `HREADY` is a global signal. If Slave B is currently executing a transfer and driving `HREADYOUT=0`, Slave A (who might be targeted by the next transfer) must see that global `HREADY=0` and realize that its own Address Phase hasn't finished yet. If Slave A starts fetching data before `HREADY` is high, it will fetch the wrong data or corrupt its internal state.
