---
id: "36_axi_functional_coverage"
tier: "3"
level: "advanced"
protocol: "axi"
title: "AXI Functional Coverage Model"
section: "G"
order: 36
visualIds: ["cm-axi-burst-resp"]
exerciseIds: ["ex-axi-coverage-holes"]
glossaryTerms: ["EXOKAY"]
checklistIds: []
summary: "Designing a functional coverage model for AXI verification."
tags:
  - axi
  - coverage
  - verification
prerequisites: []
relatedLessons: []
---

# AXI Functional Coverage Model

In verification, you don't just want to know that your tests passed; you want to know *what* you tested. A functional coverage model proves that you have stressed the AXI interface in all the ways it can legally behave.

## The Coverage Dimensions

Your AXI coverage model should cross multiple dimensions. A single transaction hitting a specific burst type is not enough; you need to see that burst type with various lengths, sizes, and responses.

### 1. Burst Attributes Cross
Your verification plan should cover the supported cross-product of:
* **Burst Type:** `FIXED`, `INCR`, `WRAP`
* **Burst Size:** 1 byte up to the maximum bus width (e.g., 128 bytes)
* **Burst Length:** 1 beat up to 256 beats (for INCR) or 16 beats (for WRAP)

*Why?* To ensure your address calculation logic (or the slave's memory pointer logic) works for all legal shapes.

### 2. Response Cross
You should cover responses in the context where each response is meaningful:
* **Response Type:** `OKAY`, `EXOKAY`, `SLVERR`, `DECERR`
* **Transaction Phase:** For reads, does the response occur on the first, middle, or last R beat? For writes, the single BRESP qualifies the complete burst.

*Why?* Error handling logic often works for single transfers but fails during a long read burst or while a write burst is draining. `EXOKAY` is conditional: it is legal only for a successful exclusive access, and its legality depends on `AxLOCK` plus the complete exclusive alignment, span, attribute, and matching read/write restrictions. Burst type alone is not enough to mark the bin legal or illegal.

The grid below shows one slice of the cross-coverage space. Focus, hover, or select a cell to inspect its status. Notice how holes for `WRAP` bursts or `DECERR` responses stand out, while `EXOKAY` cells explicitly require additional exclusive-access dimensions before they can be judged.

![Interactive AXI burst-type and response coverage map with conditional exclusive-response guidance](visual:cm-axi-burst-resp)

Use the exercise below to decide which zero-hit cells are actionable holes and which require a more precise cross or exclusion rationale.

### 3. Outstanding Depth and IDs
Your coverage model should measure the concurrent state of the interface:
* **Outstanding Transactions:** 0, 1, 2, ..., Max Capacity.
* **ID Utilization:** Single ID in flight vs. Multiple different IDs in flight.

*Why?* Bugs in out-of-order processing only appear when the interconnect's tracking FIFOs are full and multiple IDs are resolving simultaneously.
