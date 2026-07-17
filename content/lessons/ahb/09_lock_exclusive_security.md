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
visualIds: ["sig-ahb-access-attributes", "tl-ahb-exclusive"]
exerciseIds: []
glossaryTerms: ["HMASTLOCK", "HEXCL", "HNONSEC", "HEXOKAY"]
checklistIds: []
---

Locking exists in original AHB and remains represented by bus-level `HMASTLOCK` on the single-manager interface. AHB5 separately defines optional exclusive-transfer and security properties. These mechanisms are not interchangeable.

These mechanisms solve different problems. Open each signal before continuing: locking controls bus ownership, exclusives report conditional atomic success, and HNONSEC carries a security attribute.

![Interactive distinction between AHB locking, exclusive access, and security signals](visual:sig-ahb-access-attributes)

## HMASTLOCK (Locked Transfers)

**[glossary:HMASTLOCK]** indicates that the active transfer belongs to a locked sequence. In original shared AHB, per-manager `HLOCKx` requests feed arbitration and the arbiter produces bus-level `HMASTLOCK`; a single-manager AHB-Lite/AHB5 interface carries `HMASTLOCK` directly.
- **Usage:** A master can mark a read-modify-write sequence as locked when it must retain ownership of the applicable original-AHB arbitration path between transfers. This is bus-ownership control, not an address reservation: it does not by itself prevent access through an independent or aliased route.
- **System Impact:** An arbiter must not transfer active ownership of the applicable arbitration path while the locked sequence is in progress. The lock does not automatically protect every aliased address or independent system route.
- **Performance context:** A lock can serialize the protected arbitration path, so a product may prefer exclusives when conditional-update semantics are sufficient. That is a system recommendation, not a replacement of the protocol's lock mechanism.

## Exclusive Accesses (HEXCL and HEXOKAY)

When the interface declares the AHB5 `Exclusive_Transfers` property, **[glossary:HEXCL]** and **[glossary:HEXOKAY]** support monitored conditional updates without retaining bus ownership.

1. **The Exclusive Read:** The manager reads with `HEXCL` and `HMASTER`; a successful exclusive-read response uses `HEXOKAY=1` to report that monitor state was established for the monitored location/granule and required attributes.
2. **The Intermission:** The bus is free! Other masters can use it.
3. **The Exclusive Write:** The same manager identity writes with `HEXCL`, matching address/granule, size and the attributes required by the selected specification issue.
4. **The Response:** 
   - If no other master wrote to that address in the meantime, the slave responds with **`HEXOKAY = 1`** and `HRESP = OKAY`. The write succeeds.
   - If another master *did* write to that address, the slave responds with **`HEXOKAY = 0`** and `HRESP = OKAY`. The write fails, and the master knows it must try the whole process again.

The timeline shows why an exclusive sequence does not lock the bus: other masters remain free during the intermission while the monitor protects only the address-specific success condition.

![AHB exclusive read, free intermission, exclusive write, and HEXOKAY result](visual:tl-ahb-exclusive)

## Security (HNONSEC)

In systems with ARM TrustZone, memory and peripherals are partitioned into "Secure" and "Non-Secure" regions.
When the AHB5 security property is declared, **[glossary:HNONSEC]** is driven by the manager to indicate the security attribute of the transfer.
- `0`: Secure access.
- `1`: Non-Secure access.
- **Usage:** The configured enforcement point can be a source firewall, interconnect, controller, or subordinate. System policy must prevent an unauthorized read from leaking secure data and an unauthorized write from changing secure state, then return the system-defined failure response; AHB does not mandate that every target perform this policy check locally.
