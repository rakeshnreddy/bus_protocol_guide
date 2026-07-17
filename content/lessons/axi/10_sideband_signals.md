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
visualIds: ["sig-axi-sideband-attributes"]
exerciseIds: []
glossaryTerms: ["AxCACHE", "AxPROT", "AxQOS", "AxREGION"]
checklistIds: []
---

We've mentioned that the AW and AR channels carry "sideband" or attribute signals. Often written generically as `Ax...` (meaning both `AW...` and `AR...`), these signals do not define the *address* of the transaction, but rather the *nature* of the transaction.

In complex SoCs, these signals are just as important as the address itself.

## 1. AxPROT (Protection Type)
A 3-bit signal that defines the privilege and security level of the transaction.
*   **Bit 0 (Privilege):** Unprivileged vs. Privileged access. Useful for preventing user-mode applications from accessing OS-level hardware registers.
*   **Bit 1 (Security):** Secure vs. Non-secure access (`0` means Secure, `1` means Non-secure). This is a foundation of Arm TrustZone. The system security policy decides whether an access is permitted and which component returns an error when it is denied.
*   **Bit 2 (Instruction/Data):** Indicates if the access is an instruction fetch or a data access.

## 2. AxCACHE (Memory Type)
A complex 4-bit signal that tells the system interconnect and downstream caches how to handle the transaction.
*   It defines whether the transaction is **Bufferable** (can the interconnect send an early `BRESP` before the data reaches the final memory?).
*   In AXI4, bit 1 is the **Modifiable** attribute; the upper bits carry read/write allocation hints. Treating the field as one “cacheable” flag loses important ordering and transformation rules.
*   *Note: Despite the name, `AxCACHE` is used for much more than just caches. It defines the fundamental ordering rules for the transaction.*

## 3. AxQOS (Quality of Service)
(Introduced in AXI4). A 4-bit signal used to prioritize traffic.
*   In a system where a GPU, a CPU, and a Display Controller are all fighting for DDR memory bandwidth, the Display Controller might assert a high `AxQOS` value. AXI recommends interpreting a higher value as higher priority, but the exact arbitration and starvation policy is implementation-defined.

## 4. AxREGION (Region Identifier)
(Introduced in AXI4). A 4-bit signal that provides a high-level decode region.
*   If a single slave interface represents multiple logical regions, the interconnect can pass `AxREGION` to distinguish up to 16 regions, even when addresses overlap. The system still defines the region mapping and address decode.

## 5. AxLOCK and AxUSER

*   **`AxLOCK`:** In AXI4, selects Normal or Exclusive access. Exclusives use protocol-defined monitoring and response behavior; they do not turn a request into a mandatory global lock.
*   **`AxUSER`:** Optional user-defined metadata can appear on request, data, and response channels. Its meaning is a system contract, but when present it is part of the channel payload and must remain stable during backpressure.

`AxCACHE[0]` indicates Bufferable, `AxCACHE[1]` indicates Modifiable, and the upper bits are allocation hints. “Bufferable” can permit a response before the transaction reaches its final destination, but it never removes the AXI4 prerequisite that this interface must first accept AW and the final W transfer. Cache, QoS, region, protection, and user-field interpretation beyond the protocol encodings is configured system policy.

Open each attribute below to separate the protocol-defined bits from system-level policy. Every attribute travels with AW or AR and must remain stable while that address channel is stalled.

![Interactive AXI4 AxPROT, AxCACHE, AxQOS, and AxREGION guide with policy boundaries](visual:sig-axi-sideband-attributes)
