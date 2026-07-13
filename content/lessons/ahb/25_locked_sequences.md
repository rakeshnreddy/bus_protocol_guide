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
visualIds: ["tl-ahb-locked-sequence", "sig-ahb-access-attributes"]
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

To solve this, AHB provides locked-sequence signaling.

In an original AMBA 2 multi-master system:
1. The master asserts its `HBUSREQx` and per-master **`HLOCKx`** request.
2. The Arbiter grants the master and drives bus-level **`HMASTLOCK`** with the address/control phase of the locked sequence.
3. The master performs the Read.
4. The master performs the Write.
5. The locked sequence ends and arbitration can move to another requester. An `IDLE` transfer after the sequence is recommended to create a clean handover opportunity.

When the Arbiter sees `HMASTLOCK = 1`, it **guarantees** it will not grant the bus to any other master until the locked sequence finishes, even if a higher priority master requests the bus.

Follow the CPU lock request, the arbiter's bus-level indication, and the DMA request that must wait.

![Timeline showing HLOCKx, HMASTLOCK, locked read and write phases, and a blocked DMA requester](visual:tl-ahb-locked-sequence)

## The Downside

Locking serializes access through the protected path. If a master holds a locked sequence for 10 cycles, other masters needing that shared resource can be delayed for those 10 cycles.

AHB5 still defines `HMASTLOCK`; Exclusive Access is an additional, more scalable conditional-atomic mechanism rather than a protocol deletion of locking. Inspect the signals below before moving to the exclusive sequence.

![Interactive signal comparison distinguishing locked ownership, exclusive success, and security attribution](visual:sig-ahb-access-attributes)
