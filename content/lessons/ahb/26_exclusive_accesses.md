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

1. **Exclusive Read:** Master 1 reads the [glossary:Semaphore] address with `HTRANS=NONSEQ`, driving **`HEXCL = 1`**.
   - The Exclusive Monitor records the master identity, address, and matching transfer attributes.
2. **Intermission:** Master 1 does local math (e.g., adding 1 to the read value). 
   - **Crucially, the bus is NOT locked!** Other masters are free to use the bus during this time.
3. **Exclusive Write:** Master 1 attempts to write the new value back to the address, again driving **`HEXCL = 1`**.
4. **The Verdict (`HEXOKAY`):**
   - If no other master wrote to that address during the intermission, the Monitor approves the write. The slave asserts **`HEXOKAY = 1`**, and the write succeeds. Master 1 has the semaphore!
   - If Master 2 *did* write to that address during the intermission, the Monitor rejects Master 1's write. The slave asserts **`HEXOKAY = 0`**. The write is discarded, and Master 1 must start the entire process over from step 1.

Compare the success path with an attempt invalidated by an intervening write. In both cases the bus remains available to other masters.

![Timeline comparing successful and failed AHB5 exclusive writes with HEXOKAY results](visual:tl-ahb-exclusive)

## Why is this better?

Exclusive accesses use an optimistic concurrency model. When interference is uncommon, the write succeeds without a global bus lock. If contention does occur, `HEXOKAY=0` reports that memory was not updated and software can retry. This conditional failure is separate from an `HRESP=ERROR` response.
