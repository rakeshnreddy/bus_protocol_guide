---
id: "13_wrapping_bursts"
title: "Wrapping Burst Intuition"
summary: "Why wrapping bursts exist, how cache lines dictate their behavior, and how to calculate the wrap boundary."
protocol: "ahb"
tier: "1"
level: "intermediate"
order: 13
tags: ["ahb", "semantics", "burst", "wrapping"]
relatedLessons: []
prerequisites: ["12_burst_progression"]
visualIds: ["wf-ahb-wrap4-burst"]
exerciseIds: ["ex-ahb-wrap-boundary"]
glossaryTerms: ["HBURST", "WRAP", "Wrap Boundary"]
checklistIds: []
---

Incrementing bursts are intuitive: the address goes up. But what is a `WRAP` burst, and why would you ever want an address to wrap backwards?

## The "Cache Line Fill" Problem

Imagine a CPU is trying to execute an instruction at address `0x38`, but it's not in the cache (a cache miss). The CPU needs to fetch a whole cache line (say, 16 bytes) from memory into the cache. 

The CPU *could* issue an `INCR4` burst starting at `0x30` to fetch the 16 bytes: `0x30, 0x34, 0x38, 0x3C`.
However, the CPU is starving! It specifically needs the data at `0x38` right *now* to execute the instruction. It doesn't want to wait for `0x30` and `0x34` to arrive first.

## The Solution: WRAP Bursts

A **Wrapping Burst** allows a master to request the exact word it needs *first*, and then fetch the rest of the cache line afterward. 

If the CPU issues a `WRAP4` (Word size) starting at `0x38`:
1. The memory returns `0x38` (CPU gets the instruction immediately!)
2. The memory returns `0x3C`
3. The address **wraps around** to the start of the 16-byte boundary: `0x30`
4. The memory returns `0x34`

Select Cycle 3 in the waveform to inspect the exact wrap decision and the aligned region that contains all four beats.

![WRAP4 critical-word-first address order with the 0x3C to 0x30 wrap event](visual:wf-ahb-wrap4-burst)

## Calculating the Wrap Boundary

For an accepted beat at `current_address`:

- `byte_increment = 1 << HSIZE`
- `wrap_span = number_of_beats * byte_increment`
- `wrap_base = floor(start_address / wrap_span) * wrap_span`
- `next_address = wrap_base + ((current_address - wrap_base + byte_increment) mod wrap_span)`

The start address must align to `byte_increment`, but it does not have to equal `wrap_base`—that is what permits a critical-word-first sequence.

**Example:** A `WRAP4` burst where `HSIZE` is Word (4 bytes).
- Total bytes = 4 * 4 = 16 bytes.
- Therefore, the wrap boundary is aligned to 16 bytes (`0x10`).
- The 16-byte aligned regions are: `0x00 - 0x0F`, `0x10 - 0x1F`, `0x20 - 0x2F`, `0x30 - 0x3F`.

If the start address is `0x38`, we are inside the `0x30 - 0x3F` region. The next-beat calculation advances `0x38 -> 0x3C`; the following calculated address reaches the upper limit `0x40`, so modulo progression produces `0x30`. The transfer does not increment byte-by-byte until `0x3F`. The whole wrapping burst must also remain within one 1KB address region.
