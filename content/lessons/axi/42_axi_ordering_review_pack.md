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
visualIds: ["tl-axi-ordering-review"]
glossaryTerms: []
checklistIds: []
---

# AXI Ordering Review Pack

Ordering is the hardest part of AXI. Review these core rules until they are second nature.

## The 3 Golden Rules of AXI Ordering

1. **Different IDs permit response reordering.** Read responses using different IDs, and write responses using different IDs, can complete in another order when no additional memory, barrier, or system constraint applies.
2. **Same ID preserves response issue order.** Responses to reads sharing one ID and responses to writes sharing one ID must return in the order their requests were issued.
3. **Matching read/write ID values do not create cross-channel order.** `AWID=0` and `ARID=0` name separate read and write transaction streams. Memory type, address dependencies, barriers, or an extended ordering feature can still impose system-level ordering beyond this base ID rule.

The timeline makes the scoreboard decision concrete: **which response is at the head of each ID queue?** Focus or select any response to inspect why its position is legal or illegal.

![AXI ordering timeline comparing legal and illegal response sequences for two same-ID writes and one different-ID write](visual:tl-axi-ordering-review)

## Scenario Self-Test

Think through this scenario:
* Master issues Write A (`AWID=5`)
* Master issues Write B (`AWID=5`)
* Master issues Write C (`AWID=2`)

In what order is the slave allowed to send the `BVALID` responses?

**Answer:**
The subordinate *must* return Write A's response before Write B's response because they share `AWID=5`.
Write C's response can appear at any position relative to them when no other ordering constraint applies.
Legal response orders:
* A, B, C
* A, C, B
* C, A, B

Illegal response orders:
* B, A, C (Violates Same-ID rule)
* B, C, A (Violates Same-ID rule)
* C, B, A (Violates Same-ID rule)
