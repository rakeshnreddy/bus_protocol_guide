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
visualIds: []
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

In AHB, you learned about a variety of burst types (`INCR4`, `WRAP8`, `INCR16`, etc.) driven by the `HBURST` signal. AXI simplifies this approach by separating the *length* of the burst (`AxLEN`) from the *type* of the burst (`AxBURST`).

There are only three burst types in AXI, encoded in the 2-bit `AWBURST` and `ARBURST` signals:

## 1. FIXED (0b00)

In a FIXED burst, the address remains exactly the same for every beat of the transfer.

**Use Case:** This is almost exclusively used for reading from or writing to a FIFO. If a peripheral has a single 32-bit data register that acts as a portal to a deep FIFO, you want to blast 16 beats of data into that exact same address without incrementing it.

## 2. INCR (0b01)

In an INCR (Incrementing) burst, the address for each beat is calculated by adding the byte size of the transfer (`AxSIZE`) to the previous address.

**Use Case:** This is the standard burst type for normal memory access. If you want to copy a 64-byte chunk of data into RAM, you use an INCR burst. Unlike AHB, where you had to choose between 4, 8, or 16 beat increments, AXI allows an INCR burst to be any length from 1 to 256 beats (in AXI4).

## 3. WRAP (0b10)

A WRAP burst behaves like an INCR burst, but with a critical twist: if the incrementing address reaches a specific upper boundary, it "wraps around" to a lower address and continues incrementing from there.

**The Rules of WRAP:**
*   The start address must be aligned to the size of the transfer.
*   The burst length must be exactly 2, 4, 8, or 16 beats.
*   The total size of the block being accessed is `(AxSIZE bytes) * (AxLEN + 1)`.
*   The lower wrap boundary is the start address rounded down to the nearest multiple of the total block size.
*   The upper wrap boundary is the lower wrap boundary plus the total block size.

**Use Case:** Cache line fills. When a CPU experiences a cache miss, it needs to fetch a full cache line (e.g., 32 bytes) from main memory. However, the CPU wants the *specific word it missed on* to be returned first, so it can resume execution immediately (Critical Word First). It issues a WRAP burst starting at the missed address. The memory controller returns the critical word, increments to the end of the cache line boundary, wraps back to the beginning of the cache line boundary, and fills in the rest.
