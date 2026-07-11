---
id: "09_lock_exclusive_security"
title: "Lock, Exclusive, and Security (HMASTLOCK, HEXCL, HNONSEC)"
summary: "Advanced signals used in AHB5 for atomicity, semaphores, and TrustZone security."
protocol: "ahb"
tier: "1"
level: "intermediate"
order: 9
tags: ["ahb", "signals", "security", "exclusive"]
relatedLessons: []
prerequisites: ["05_address_and_control"]
visualIds: []
exerciseIds: []
glossaryTerms: ["HMASTLOCK", "HEXCL", "HNONSEC", "HEXOKAY"]
checklistIds: []
---

As systems evolved to support multi-core processors and hardware security (like ARM TrustZone), the basic read/write signals were no longer enough. AHB5 introduced and refined several signals to handle these advanced use cases.

## HMASTLOCK (Locked Transfers)

**[glossary:HMASTLOCK]** is driven by the master to indicate that the current sequence of transfers must not be interrupted.
- **Usage:** If a master needs to do a read-modify-write operation (like updating a page table) and absolutely cannot allow another master to access that memory in between the read and the write, it asserts `HMASTLOCK`.
- **System Impact:** The arbiter sees `HMASTLOCK` and refuses to grant the bus to any other master until the locked sequence completes. 
- **Modern Context:** Locked transfers destroy system performance by monopolizing the bus. Modern systems prefer *Exclusive Accesses* instead.

## Exclusive Accesses (HEXCL and HEXOKAY)

To replace the heavy-handed `HMASTLOCK`, AHB5 introduced **[glossary:HEXCL]** (from the master) and **[glossary:HEXOKAY]** (from the slave). These are used to implement semaphores and mutexes without locking the whole bus.

1. **The Exclusive Read:** The master reads a memory location and asserts `HEXCL`. The slave (an exclusive monitor) records the master's ID and the address.
2. **The Intermission:** The bus is free! Other masters can use it.
3. **The Exclusive Write:** The master tries to write the updated value back, again asserting `HEXCL`. 
4. **The Response:** 
   - If no other master wrote to that address in the meantime, the slave responds with **`HEXOKAY = 1`** and `HRESP = OKAY`. The write succeeds.
   - If another master *did* write to that address, the slave responds with **`HEXOKAY = 0`** and `HRESP = OKAY`. The write fails, and the master knows it must try the whole process again.

## Security (HNONSEC)

In systems with ARM TrustZone, memory and peripherals are partitioned into "Secure" and "Non-Secure" regions.
**[glossary:HNONSEC]** is driven by the master to indicate the security level of the transfer.
- `0`: Secure access.
- `1`: Non-Secure access.
- **Usage:** A slave will typically reject a Non-Secure write (`HNONSEC = 1`) to a Secure register, responding with an `ERROR` on `HRESP`.
