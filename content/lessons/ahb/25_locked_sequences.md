---
id: "25_locked_sequences"
title: "Locked Sequences (HMASTLOCK)"
summary: "How to guarantee atomic operations in older multi-master systems."
protocol: "ahb"
tier: "1"
level: "advanced"
order: 25
tags: ["ahb", "advanced", "lock"]
relatedLessons: []
prerequisites: ["21_multi_master_systems"]
visualIds: []
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

In a multi-master system, a CPU might need to perform an "Atomic Read-Modify-Write". 
For example, reading a hardware semaphore to see if it's `0`, and if so, writing a `1` to claim it.

## The Problem

If Master 1 (CPU) reads the semaphore and gets a `0`, it wants to write a `1`. 
But what if the Arbiter grants the bus to Master 2 (DMA) immediately after the read? Master 2 might read the same `0`, and write a `1`. When Master 1 gets the bus back and writes its `1`, both masters think they own the semaphore!

## The HMASTLOCK Solution

To solve this, AHB provides the **`HMASTLOCK`** signal.

When a master needs an atomic sequence:
1. It asserts its `HBUSREQ`.
2. Once granted, it asserts `HMASTLOCK = 1` simultaneously with `HADDR` and `HTRANS`.
3. It performs the Read.
4. It performs the Write.
5. It de-asserts `HMASTLOCK = 0`.

When the Arbiter sees `HMASTLOCK = 1`, it **guarantees** it will not grant the bus to any other master until the locked sequence finishes, even if a higher priority master requests the bus.

## The Downside

Locking the bus is a brute-force approach. It absolutely destroys system latency. If a master locks the bus for 10 cycles, all other masters (and potentially critical real-time interrupts) are stalled.

For this reason, `HMASTLOCK` is heavily discouraged in modern SoC design, having been replaced by the much more elegant **Exclusive Access** mechanism (introduced in AHB5).
