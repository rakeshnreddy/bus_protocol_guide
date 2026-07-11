---
id: "10_sideband_signals"
title: "Sideband Signals and Attributes"
summary: "Understanding CACHE, PROT, QOS, and REGION signals."
protocol: "axi"
tier: "1"
level: "intermediate"
order: 10
tags: ["axi", "signals", "sideband"]
relatedLessons: []
prerequisites: ["05_write_address_channel", "08_read_address_channel"]
visualIds: []
exerciseIds: []
glossaryTerms: ["AxCACHE", "AxPROT", "AxQOS", "AxREGION"]
checklistIds: []
---

We've mentioned that the AW and AR channels carry "sideband" or attribute signals. Often written generically as `Ax...` (meaning both `AW...` and `AR...`), these signals do not define the *address* of the transaction, but rather the *nature* of the transaction.

In complex SoCs, these signals are just as important as the address itself.

## 1. AxPROT (Protection Type)
A 3-bit signal that defines the privilege and security level of the transaction.
*   **Bit 0 (Privilege):** Unprivileged vs. Privileged access. Useful for preventing user-mode applications from accessing OS-level hardware registers.
*   **Bit 1 (Security):** Secure vs. Non-secure access. This is the foundation of ARM TrustZone. A non-secure transaction trying to access a secure memory region will be blocked by the interconnect and receive a `DECERR`.
*   **Bit 2 (Instruction/Data):** Indicates if the access is an instruction fetch or a data access.

## 2. AxCACHE (Memory Type)
A complex 4-bit signal that tells the system interconnect and downstream caches how to handle the transaction.
*   It defines whether the transaction is **Bufferable** (can the interconnect send an early `BRESP` before the data reaches the final memory?).
*   It defines whether the transaction is **Cacheable** (should this data be allocated in the L2/L3 cache?).
*   *Note: Despite the name, `AxCACHE` is used for much more than just caches. It defines the fundamental ordering rules for the transaction.*

## 3. AxQOS (Quality of Service)
(Introduced in AXI4). A 4-bit signal used to prioritize traffic.
*   In a system where a GPU, a CPU, and a Display Controller are all fighting for DDR memory bandwidth, the Display Controller might assert a high `AxQOS` value. The interconnect will prioritize these transactions to prevent the screen from tearing or dropping frames.

## 4. AxREGION (Region Identifier)
(Introduced in AXI4). A 4-bit signal that provides a high-level decode region.
*   If a single slave interface manages multiple distinct logical regions of memory, the interconnect can pass `AxREGION` to tell the slave exactly which region is being targeted, saving the slave from having to do complex, deep decoding of the full `AxADDR`.
