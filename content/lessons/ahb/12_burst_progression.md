---
id: "12_burst_progression"
title: "Burst Progression Rules"
summary: "How addresses increment across a burst, and how the slave knows when a burst is done."
protocol: "ahb"
tier: "1"
level: "intermediate"
order: 12
tags: ["ahb", "semantics", "burst"]
relatedLessons: []
prerequisites: ["07_burst_and_size", "11_htrans_semantics"]
visualIds: ["wf-ahb-incr4-burst", "sig-ahb-burst-size"]
exerciseIds: []
glossaryTerms: ["HBURST", "INCR", "Beat"]
checklistIds: []
---

We've seen that `HBURST` defines the shape of a transaction, but how does that actually play out cycle-by-cycle? Let's trace the progression of an incrementing burst.

## The Incrementing (INCR) Burst

In an incrementing burst, the master specifies the start address (`HADDR`) on the first beat (`HTRANS = NONSEQ`). For every subsequent beat (`HTRANS = SEQ`), the address must increment by the size of the transfer (`HSIZE`).

Let's look at an `INCR4` (4-beat incrementing) burst where `HSIZE` is Word (4 bytes), starting at address `0x20`.

Select each cycle to follow both the current address phase and the data beat belonging to the previous address.

![INCR4 word burst showing NONSEQ, SEQ address increments, and one-cycle-later data ownership](visual:wf-ahb-incr4-burst)

### Cycle-by-Cycle Breakdown

1. **Beat 1:** Master drives `HADDR = 0x20`, `HTRANS = NONSEQ`, `HBURST = INCR4`. 
2. **Beat 2:** Master drives `HADDR = 0x24`, `HTRANS = SEQ`. The address incremented by 4.
3. **Beat 3:** Master drives `HADDR = 0x28`, `HTRANS = SEQ`. The address incremented by 4.
4. **Beat 4:** Master drives `HADDR = 0x2C`, `HTRANS = SEQ`. The address incremented by 4.

### Undefined Length Bursts (INCR)

The `HBURST` signal has a value called `INCR` (as opposed to `INCR4`, `INCR8`, etc.). This indicates a burst of *undefined length*.
- The manager can choose the length, but every accepted beat remains subject to the 1KB boundary rule.
- The burst is only terminated when the master drops `HTRANS` to `NONSEQ` (starting a new burst) or `IDLE` (stopping altogether).
- If the next beat would enter another 1KB region, the manager ends the burst before that beat and restarts remaining work with `NONSEQ` in the new region.

Expand `INCR` and the fixed-length burst entries below to compare termination rules, beat counts, and the address checks a monitor must maintain.

![Interactive comparison of undefined and fixed-length AHB burst progression rules](visual:sig-ahb-burst-size)

Progress advances only on accepted valid beats (`HREADY && HTRANS[1]`). Waited repetitions and BUSY cycles do not advance the beat index or predicted address.

## Checker Gallery: Incorrect Address Calculation

A protocol checker should retain an independent predicted next address and compare it with the manager's actual `HADDR` on each accepted `SEQ` beat.

A subordinate may predict addresses as an implementation optimization, but functional access remains defined by the manager-driven protocol address. If the manager drives `0x28` where the accepted progression requires `0x24`, the checker reports a progression violation; the subordinate must not silently substitute its own counter value and mask the bad input.
