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
visualIds: ["wf-ahb-incr4-burst"]
exerciseIds: []
glossaryTerms: ["HBURST", "INCR", "Beat"]
checklistIds: []
---

We've seen that `HBURST` defines the shape of a transaction, but how does that actually play out cycle-by-cycle? Let's trace the progression of an incrementing burst.

## The Incrementing (INCR) Burst

In an incrementing burst, the master specifies the start address (`HADDR`) on the first beat (`HTRANS = NONSEQ`). For every subsequent beat (`HTRANS = SEQ`), the address must increment by the size of the transfer (`HSIZE`).

Let's look at an `INCR4` (4-beat incrementing) burst where `HSIZE` is Word (4 bytes), starting at address `0x20`.

![wf-ahb-incr4-burst](visual:wf-ahb-incr4-burst)

### Cycle-by-Cycle Breakdown

1. **Beat 1:** Master drives `HADDR = 0x20`, `HTRANS = NONSEQ`, `HBURST = INCR4`. 
2. **Beat 2:** Master drives `HADDR = 0x24`, `HTRANS = SEQ`. The address incremented by 4.
3. **Beat 3:** Master drives `HADDR = 0x28`, `HTRANS = SEQ`. The address incremented by 4.
4. **Beat 4:** Master drives `HADDR = 0x2C`, `HTRANS = SEQ`. The address incremented by 4.

### Undefined Length Bursts (INCR)

The `HBURST` signal has a value called `INCR` (as opposed to `INCR4`, `INCR8`, etc.). This indicates a burst of *undefined length*.
- The master can keep issuing `SEQ` beats indefinitely.
- The burst is only terminated when the master drops `HTRANS` to `NONSEQ` (starting a new burst) or `IDLE` (stopping altogether).

## Bug Gallery: Incorrect Address Calculation

A common RTL bug in slave design is ignoring the master's `HADDR` during `SEQ` beats and relying entirely on an internal counter.

While it is true that the slave *can* calculate the address of a `SEQ` beat itself (by taking the previous address + `HSIZE`), it is much safer for verification if the slave checks that the master's `HADDR` actually matches the expected value. If a master calculates `0x24` but accidentally drives `0x28` on the second beat of an `INCR4`, a lazy slave will write data to `0x24`, masking the master's bug!
