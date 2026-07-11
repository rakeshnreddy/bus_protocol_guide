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
You must cover the cross-product of:
* **Burst Type:** `FIXED`, `INCR`, `WRAP`
* **Burst Size:** 1 byte up to the maximum bus width (e.g., 128 bytes)
* **Burst Length:** 1 beat up to 256 beats (for INCR) or 16 beats (for WRAP)

*Why?* To ensure your address calculation logic (or the slave's memory pointer logic) works for all legal shapes.

### 2. Response Cross
You must cover the cross-product of:
* **Response Type:** `OKAY`, `EXOKAY`, `SLVERR`, `DECERR`
* **Transaction Phase:** Does the error happen on the first beat of a read burst, the middle, or the last?

*Why?* Error handling logic often works fine for single transfers but fails when an error occurs in the middle of a long burst. Furthermore, crossing Response with Burst Type reveals structural impossibilities. For example, an `EXOKAY` response is illegal for a `FIXED` burst because exclusive accesses must not use FIXED bursts.

The grid below shows this cross-coverage space interactively—crossing AXI Burst Types against Responses. Hover over any cell to see its status. Notice how coverage holes for `WRAP` bursts or `DECERR` responses easily stand out, and how the `FIXED` + `EXOKAY` illegal bin is excluded from the metric.

```visual
cm-axi-burst-resp
```

*Caption: A 2D coverage map slicing AXI Burst Types against Responses.*

```exercise
ex-axi-coverage-holes
```

### 3. Outstanding Depth and IDs
You must measure the concurrent state of the interface:
* **Outstanding Transactions:** 0, 1, 2, ..., Max Capacity.
* **ID Utilization:** Single ID in flight vs. Multiple different IDs in flight.

*Why?* Bugs in out-of-order processing only appear when the interconnect's tracking FIFOs are full and multiple IDs are resolving simultaneously.
