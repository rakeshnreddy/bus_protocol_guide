---
id: "23_burst_types"
title: "Burst Types: INCR, FIXED, and WRAP"
summary: "Understanding the three fundamental ways AXI calculates addresses during a burst."
protocol: "axi"
tier: "1"
level: "intermediate"
order: 23
tags: ["axi", "burst", "rules"]
relatedLessons: ["24_address_alignment"]
prerequisites: ["15_burst_structure_beat_progression"]
visualIds: ["tl-axi-burst-address-progression"]
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

In AHB, you learned about a variety of burst types (`INCR4`, `WRAP8`, `INCR16`, etc.) driven by the `HBURST` signal. AXI simplifies this approach by separating the *length* of the burst (`AxLEN`) from the *type* of the burst (`AxBURST`).

There are only three burst types in AXI, encoded in the 2-bit `AWBURST` and `ARBURST` signals:

## 1. FIXED (0b00)

In a FIXED burst, the address remains exactly the same for every beat of the transfer.

**Use Case:** A common use is reading from or writing to a FIFO. If a peripheral has a single 32-bit data register that acts as a portal to a deep FIFO, you can transfer multiple beats at that exact same address without incrementing it.

## 2. INCR (0b01)

In an INCR (Incrementing) burst, the address for each beat is calculated using the transfer size: the aligned progression advances by `2^AxSIZE` bytes.

**Use Case:** This is the standard burst type for normal memory access. If you want to copy a 64-byte chunk of data into RAM, you use an INCR burst. Unlike AHB, where you had to choose between 4, 8, or 16 beat increments, AXI4 allows an INCR burst to be any length from 1 to 256 beats. FIXED and WRAP bursts remain limited to 1–16 beats.

## 3. WRAP (0b10)

A WRAP burst behaves like an INCR burst, but with a critical twist: if the incrementing address reaches a specific upper boundary, it "wraps around" to a lower address and continues incrementing from there.

**The Rules of WRAP:**
*   The start address must be aligned to the size of the transfer.
*   The burst length must be exactly 2, 4, 8, or 16 beats.
*   The total size of the block being accessed is `(AxSIZE bytes) * (AxLEN + 1)`.
*   The lower wrap boundary is the start address rounded down to the nearest multiple of the total block size.
*   The upper wrap boundary is the lower wrap boundary plus the total block size.

The comparison below answers: **given the same `AxLEN` and `AxSIZE`, which address belongs to each beat for FIXED, INCR, and WRAP?**

![Four-beat AXI4 FIXED, INCR, and WRAP address sequences with an inspectable wrap point](visual:tl-axi-burst-address-progression)

**Use Case:** Cache line fills are a common application. When a CPU experiences a cache miss, it may need to fetch a full cache line (e.g., 32 bytes) from main memory. A design that implements *Critical Word First* can issue a WRAP burst starting at the missed transfer-size-aligned address. The sequence returns that word, increments to the end of the cache-line-sized wrap region, wraps to the beginning, and fills the rest.
