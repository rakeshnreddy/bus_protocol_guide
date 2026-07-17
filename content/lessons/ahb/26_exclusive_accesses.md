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
exerciseIds: ["lab-ahb-exclusive-monitor"]
glossaryTerms: ["Exclusive Access", "Semaphore"]
checklistIds: []
---

AHB5 defines **[glossary:Exclusive Access]** as the optional `Exclusive_Transfers` interface property, using `HEXCL`, `HMASTER`, and `HEXOKAY`. It provides conditional-update semantics without retaining arbitration ownership; it does not delete locking.

## The Exclusive Monitor

Exclusive accesses rely on a piece of hardware called an **Exclusive Monitor**, usually sitting inside the slave or the interconnect. 
Instead of locking the bus, the system simply "watches" the target address.

## The Sequence

To perform a Read-Modify-Write using exclusive accesses:

1. **Exclusive Read:** Manager 1 reads the [glossary:Semaphore] location with `HTRANS=NONSEQ`, **`HEXCL=1`**, and its configured **`HMASTER`** identity.
   - `HEXOKAY=1` on the exclusive-read completion reports that the monitor established state. The monitor records identity, monitored location or granule, transfer size, and the matching attributes required by IHI 0033B.b.
2. **Intermission:** Master 1 does local math (e.g., adding 1 to the read value). 
   - **Crucially, the bus is NOT locked!** Other masters are free to use the bus during this time.
3. **Exclusive Write:** The same `HMASTER` attempts a matching write with **`HEXCL=1`** and the required address or granule, size, and attributes.
4. **The Verdict (`HEXOKAY`):**
   - If no other master wrote to that address during the intermission, the Monitor approves the write. The slave asserts **`HEXOKAY = 1`**, and the write succeeds. Master 1 has the semaphore!
   - If monitor state is absent or invalidated by relevant interference to the monitored granule, the Monitor rejects the write. The write must not update memory and can complete with **`HRESP=OKAY`, `HEXOKAY=0`**; the manager retries the entire sequence if software policy requires it.

Compare the success path with an attempt invalidated by an intervening write. In both cases the bus remains available to other masters.

![Timeline comparing successful and failed AHB5 exclusive writes with HEXOKAY results](visual:tl-ahb-exclusive)

## Why is this better?

Exclusive accesses use an optimistic concurrency model. When interference is uncommon, the write succeeds without a global bus lock. If contention does occur, `HEXOKAY=0` reports that memory was not updated and software can retry. This conditional failure is separate from an `HRESP=ERROR` response.
