---
id: "17_multi_cycle_examples"
title: "Multi-Cycle Worked Examples"
summary: "Putting it all together: tracing a complex AHB sequence cycle-by-cycle."
protocol: "ahb"
tier: "1"
level: "advanced"
order: 17
tags: ["ahb", "timing"]
relatedLessons: []
prerequisites: ["16_wait_states_hready"]
visualIds: ["wf-ahb-wait-state-heavy"]
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

To truly master AHB, you must be able to look at a waveform and mentally divide it into Address Phases and Data Phases, even when `HREADY` is bouncing up and down.

Let's do a worked example using the "Wait-State Heavy Burst" waveform we saw earlier.

![wf-ahb-wait-state-heavy](visual:wf-ahb-wait-state-heavy)

## Cycle-by-Cycle Breakdown

### Cycle 1
- **Address Phase 1:** Master drives `HTRANS=NONSEQ`, `HADDR=0x50`. The burst begins.

### Cycle 2
- **Data Phase 1:** Slave drives `HREADY=0`. The data is not ready.
- **Address Phase 2:** Master drives `HTRANS=SEQ`, `HADDR=0x54`. Because `HREADY` is `0`, this address phase is *stalled*. The master must hold these values into the next cycle.

### Cycle 3
- **Data Phase 1 (cont):** Slave drives `HREADY=1`. It provides `HRDATA` (if reading) or samples `HWDATA` (if writing). The Data Phase for `0x50` is finally complete.
- **Address Phase 2 (cont):** Master continues holding `HTRANS=SEQ`, `HADDR=0x54`. Because `HREADY=1` at the end of this cycle, the slave successfully samples Address Phase 2.

### Cycle 4
- **Data Phase 2:** Slave drives `HREADY=1` immediately. The Data Phase for `0x54` completes in a single cycle.
- **Address Phase 3:** Master drives `HTRANS=SEQ`, `HADDR=0x58`. Slave samples it successfully.

### Cycle 5
- **Data Phase 3:** Slave drives `HREADY=0`. Data Phase 3 is stalled.
- **Address Phase 4:** Master drives `HTRANS=SEQ`, `HADDR=0x5C`. Address Phase 4 is stalled and must be held.

### Cycle 6
- **Data Phase 3 (cont):** Slave drives `HREADY=0`. Data Phase 3 is still stalled.
- **Address Phase 4 (cont):** Master continues holding `0x5C`.

### Cycle 7
- **Data Phase 3 (cont):** Slave drives `HREADY=1`. Data Phase 3 finally completes.
- **Address Phase 4 (cont):** Master continues holding `0x5C`. It is successfully sampled.

### Cycle 8
- **Data Phase 4:** Slave drives `HREADY=1`. Data Phase 4 completes.
- **Address Phase 5 (Next Transfer):** Master drives `HTRANS=IDLE`. The burst is over.
