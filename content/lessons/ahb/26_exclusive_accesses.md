---
id: "26_exclusive_accesses"
title: "Exclusive Accesses (AHB5)"
summary: "How modern AHB systems handle atomic operations without locking the entire bus."
protocol: "ahb"
tier: "1"
level: "advanced"
order: 26
tags: ["ahb", "advanced", "exclusive", "ahb5"]
relatedLessons: []
prerequisites: ["25_locked_sequences"]
visualIds: ["tl-ahb-exclusive"]
exerciseIds: []
glossaryTerms: ["Exclusive Access", "Semaphore"]
checklistIds: []
---

Because `HMASTLOCK` destroys system performance by hogging the bus, AHB5 introduced **[glossary:Exclusive Access]** mechanisms using the `HEXCL` and `HEXOKAY` signals. This aligns AHB closely with AXI's exclusive access model.

## The Exclusive Monitor

Exclusive accesses rely on a piece of hardware called an **Exclusive Monitor**, usually sitting inside the slave or the interconnect. 
Instead of locking the bus, the system simply "watches" the target address.

## The Sequence

To perform a Read-Modify-Write using exclusive accesses:

1. **Exclusive Read:** Master 1 reads the [glossary:Semaphore] address, driving **`HEXCL = 1`**. 
   - The Exclusive Monitor logs Master 1's ID and the address being read.
2. **Intermission:** Master 1 does local math (e.g., adding 1 to the read value). 
   - **Crucially, the bus is NOT locked!** Other masters are free to use the bus during this time.
3. **Exclusive Write:** Master 1 attempts to write the new value back to the address, again driving **`HEXCL = 1`**.
4. **The Verdict (`HEXOKAY`):**
   - If no other master wrote to that address during the intermission, the Monitor approves the write. The slave asserts **`HEXOKAY = 1`**, and the write succeeds. Master 1 has the semaphore!
   - If Master 2 *did* write to that address during the intermission, the Monitor rejects Master 1's write. The slave asserts **`HEXOKAY = 0`**. The write is discarded, and Master 1 must start the entire process over from step 1.

![tl-ahb-exclusive](visual:tl-ahb-exclusive)

## Why is this better?

Exclusive accesses use an optimistic concurrency model. 99% of the time, no other master interferes, the write succeeds, and the bus was never locked, allowing massive throughput gains. If contention does occur, the master simply retries.
