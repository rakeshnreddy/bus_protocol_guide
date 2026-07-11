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
visualIds: []
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

**In AXI4:** Write interleaving is strictly forbidden, and the `WID` signal was entirely removed from the W channel. 
If a master starts sending write data for Transaction A, it **must** finish all beats of Transaction A before it can send any data for Transaction B. 
*Why?* Because write interleaving required massive, complex reorder buffers inside every slave and interconnect, eating up silicon area and increasing power consumption.

## 2. Expanded Burst Lengths

**In AXI3:** The `AxLEN` signal was 4 bits wide. The maximum burst length was 16 beats.
**In AXI4:** The `AxLEN` signal was expanded to 8 bits. The maximum burst length for INCR bursts is now 256 beats. (WRAP bursts are still limited to 16 beats).
*Why?* To support highly efficient bulk data transfers (like DMA engines moving large blocks of video memory).

## 3. Removal of Locked Accesses

**In AXI3:** Supported both Locked and Exclusive accesses (via the `AxLOCK` signal).
**In AXI4:** Locked accesses were removed. `AxLOCK` was reduced to a single bit that only supports Exclusive accesses.
*Why?* Locked accesses freeze the entire interconnect to guarantee atomicity, destroying system performance. Exclusive accesses (which use monitors instead of physical locks) achieve atomicity without halting other traffic.

## 4. QoS and Region Identifiers Added

**In AXI4:** Added `AxQOS` (Quality of Service, 4 bits) to allow masters to tag high-priority traffic. Added `AxREGION` (4 bits) to help slaves decode multiple logical interfaces without eating up address space.
