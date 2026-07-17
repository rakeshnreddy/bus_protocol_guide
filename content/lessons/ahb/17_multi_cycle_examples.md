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

Let's do a worked example using the "Wait-State Heavy Burst" waveform: an `INCR4` **write** with `HBURST=INCR4`, `HSIZE=010` (4 bytes), `HWRITE=1`, and `HRESP=OKAY` throughout.

The cycle selector is the worked-example navigator. Match its phase-owner label and annotation to each written breakdown below before moving to the next cycle.

![Cycle-by-cycle AHB INCR4 worked example with two separate wait-state intervals](visual:wf-ahb-wait-state-heavy)

## Cycle-by-Cycle Breakdown

### Cycle 1
- **Address beat 1:** Manager drives `HTRANS=NONSEQ`, `HADDR=0x50`, `HBURST=INCR4`, `HSIZE=010`, and `HWRITE=1`. The burst begins.

### Cycle 2
- **Data phase for address 0x50:** The active subordinate's `HREADYOUT` produces global `HREADY=0`; write payload `W0` is not accepted.
- **Address beat 2:** `HTRANS=SEQ`, `HADDR=0x54` is visible but pending and must be retained.

### Cycle 3
- **Data phase for address 0x50 (continued):** Global `HREADY=1`, `HRESP=OKAY`; the subordinate samples `W0` and completes beat 1.
- **Address beat 2 (continued):** The retained `0x54` context is accepted on the same edge.

### Cycle 4
- **Data phase for address 0x54:** `W1`, `HREADY=1`, `HRESP=OKAY`; beat 2 completes.
- **Address beat 3:** `HTRANS=SEQ`, `HADDR=0x58` is accepted.

### Cycle 5
- **Data phase for address 0x58:** `W2` is stalled by `HREADY=0`.
- **Address beat 4:** `HTRANS=SEQ`, `HADDR=0x5C` is visible but pending.

### Cycle 6
- **Data phase for address 0x58 (continued):** `W2` remains stable with `HREADY=0`.
- **Address beat 4 (continued):** The manager retains the complete `0x5C` context.

### Cycle 7
- **Data phase for address 0x58 (continued):** `W2` completes with `HREADY=1`, `HRESP=OKAY`.
- **Address beat 4 (continued):** The retained `0x5C` context is accepted.

### Cycle 8
- **Data phase for address 0x5C:** `W3` completes with `HREADY=1`, `HRESP=OKAY`.
- **Idle address/control cycle:** The manager drives `HTRANS=IDLE`; there is no fifth burst beat.
