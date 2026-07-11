---
id: "42_axi_ordering_review_pack"
tier: "3"
level: "advanced"
protocol: "axi"
title: "AXI Ordering Review Pack"
section: "H"
order: 42
exerciseIds: ["ex-axi-ordering-scenario"]
summary: "A comprehensive review of AXI transaction ordering rules and models."
tags:
  - axi
  - ordering
  - review
prerequisites: []
relatedLessons: []
visualIds: []
glossaryTerms: []
checklistIds: []
---

# AXI Ordering Review Pack

Ordering is the hardest part of AXI. Review these core rules until they are second nature.

## The 3 Golden Rules of AXI Ordering

1. **Different IDs = No Ordering.** Transactions with different IDs (e.g., `AWID=0` and `AWID=1`) have no relationship. The slave can complete them in any order it wants.
2. **Same ID = Strict Ordering.** Transactions with the same ID (e.g., two requests with `AWID=0`) MUST be completed by the slave in the exact order they were issued.
3. **Reads vs. Writes = No Ordering.** An `AWID=0` and an `ARID=0` have no relationship. Write channels and Read channels are completely independent.

## Scenario Self-Test

Think through this scenario:
* Master issues Write A (`AWID=5`)
* Master issues Write B (`AWID=5`)
* Master issues Write C (`AWID=2`)

In what order is the slave allowed to send the `BVALID` responses?

**Answer:**
The slave *must* respond to Write A before Write B, because they share `AWID=5`.
The slave can respond to Write C at any time.
Legal response orders:
* A, B, C
* A, C, B
* C, A, B

Illegal response orders:
* B, A, C (Violates Same-ID rule)
* B, C, A (Violates Same-ID rule)
* C, B, A (Violates Same-ID rule)
