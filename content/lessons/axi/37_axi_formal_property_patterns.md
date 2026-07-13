---
id: "37_axi_formal_property_patterns"
tier: "3"
level: "advanced"
protocol: "axi"
title: "AXI Formal Property Patterns"
section: "G"
order: 37
exerciseIds: ["ex-axi-wlast-exact"]
glossaryTerms: ["WLAST"]
summary: "Formal property patterns for proving AXI protocol compliance."
tags:
  - axi
  - formal
  - verification
  - sva
prerequisites: []
relatedLessons: []
visualIds: ["fp-axi-wlast-exact"]
checklistIds: []
---

# AXI Formal Property Patterns

Simulation is great for finding normal bugs, but AXI's concurrency makes it vulnerable to edge-case bugs that are mathematically difficult to hit with random stimulus (e.g., a specific buffer fills up at the exact clock cycle a specific ID returns out of order). Formal verification uses mathematical proofs to guarantee these bugs do not exist.

## Safety Properties ("Bad things never happen")

Safety properties ensure the protocol rules are never broken, regardless of the traffic pattern.

1. **Response Correlation:** "If a `BVALID` is asserted with `BID=X`, there must have been an accepted `AWVALID` with `AWID=X` that has not yet received a response."
2. **Burst Legality:** "If `AxBURST` is `WRAP`, then `AxLEN` is mathematically proven to only ever evaluate to 1, 3, 7, or 15 (representing lengths 2, 4, 8, 16)."
3. **Write Interleaving (AXI4):** "The `WDATA` stream must correspond to exactly one `AWADDR` request at a time until `WLAST` is seen. Interleaved write data beats are mathematically impossible."
4. **WLAST Exact Match:** "WLAST must be asserted on the exact last beat of a burst (when WVALID and WREADY are high), and nowhere else. This checks a 4-beat burst: `assert property (@(posedge ACLK) (WVALID && WREADY && (beat_count == AWLEN)) |-> WLAST);`"

![AXI Safety: WLAST Exact Match](visual:fp-axi-wlast-exact)
Try it yourself — toggle **WLAST** below to appear early or miss the last beat entirely, and see whether the property holds or breaks, and why.

## Liveness Properties ("Good things eventually happen")

Liveness properties ensure the system continues to make progress and does not deadlock.

1. **No Deadlock Under Backpressure:** "If `AWVALID` is asserted, then `AWREADY` will eventually be asserted, assuming the slave is not permanently stalled." 
2. **Response Delivery:** "If a write data burst completes (`WVALID && WREADY && WLAST`), the slave will eventually return a `BVALID`."
3. **No Circular Dependency:** "The assertion of `BVALID` is never mathematically dependent on the assertion of `BREADY`." (This proves the master and slave haven't created a circular wait condition).

Writing these properties in SystemVerilog Assertions (SVA) and running them through a formal tool guarantees your AXI interface is bulletproof.
