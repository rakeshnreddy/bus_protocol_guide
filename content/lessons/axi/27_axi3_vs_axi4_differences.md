---
id: "27_axi3_vs_axi4_differences"
title: "AXI3 vs AXI4 Differences"
summary: "How and why the protocol evolved to remove write interleaving."
protocol: "axi"
tier: "1"
level: "intermediate"
order: 27
tags: ["axi", "axi3", "axi4", "history"]
relatedLessons: ["28_axi4_lite_simplifications"]
prerequisites: ["04_five_channel_model"]
visualIds: ["tl-axi3-axi4-write-order"]
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

The original AXI protocol (now referred to as AXI3) was extremely complex, designed to squeeze every ounce of performance out of early 2000s silicon. When ARM released AXI4, they actually *removed* features. 

Why? Because they realized that some of AXI3's theoretical performance features were so difficult to implement that the routing congestion and logic overhead outweighed the benefits.

## 1. The Removal of Write Interleaving (and WID)

This is the biggest difference between AXI3 and AXI4.

**In AXI3:** The Write Data (W) channel had a `WID` signal. This meant a master could interleave the data beats of different write transactions. 
*   Cycle 1: Beat 1 of Write A (`WID = 0`)
*   Cycle 2: Beat 1 of Write B (`WID = 1`)
*   Cycle 3: Beat 2 of Write A (`WID = 0`)

**In AXI4:** The `WID` signal was removed. A master must issue write data in the same order as its write addresses, and an interconnect combining writes from different masters must forward the write data in address order. Beats from Transaction B therefore cannot be inserted into the W stream before Transaction A finishes.

The side-by-side timeline answers: **how could AXI3 identify an interleaved beat, and what replaces that association in AXI4?**

![AXI3 WID-based interleaving compared with AXI4 write data completing in accepted address order](visual:tl-axi3-axi4-write-order)

*Why remove it?* Eliminating per-beat WID routing and interleaving reduces write-data association and buffering complexity. That engineering motivation is distinct from the normative AXI4 ordering rule shown above.

## 2. Expanded Burst Lengths

**In AXI3:** The `AxLEN` signal was 4 bits wide. The maximum burst length was 16 beats.
**In AXI4:** The `AxLEN` signal was expanded to 8 bits. INCR bursts permit 1–256 beats, FIXED bursts permit 1–16 beats, and WRAP bursts permit exactly 2, 4, 8, or 16 beats.
*Why?* To support highly efficient bulk data transfers (like DMA engines moving large blocks of video memory).

## 3. Removal of Locked Accesses

**In AXI3:** Supported both Locked and Exclusive accesses (via the `AxLOCK` signal).
**In AXI4:** Locked accesses were removed. `AxLOCK` was reduced to a single bit that only supports Exclusive accesses.
*Why?* A locked sequence can exclude competing accesses along the affected path and complicate shared-fabric progress. Exclusive accesses use monitors and a success/failure response instead of treating exclusivity as locked bus ownership.

## 4. QoS and Region Identifiers Added

**In AXI4:** Added `AxQOS` (Quality of Service, 4 bits) to allow masters to tag high-priority traffic. Added `AxREGION` (4 bits) to help slaves decode multiple logical interfaces without eating up address space.
