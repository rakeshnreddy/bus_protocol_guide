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

Simulation is great for finding normal bugs, but AXI's concurrency creates edge cases that are difficult to hit with random stimulus (for example, a buffer becoming full on the exact cycle a different ID returns). Formal verification can prove a stated property over the modeled state space under explicit assumptions.

## Safety Properties ("Bad things never happen")

Safety properties prove that a specified bad event is unreachable for every traffic pattern admitted by the formal model and its assumptions.

1. **Response Correlation:** "If a `BVALID` is asserted with `BID=X`, there must be an outstanding accepted write-address transaction for ID X, and AXI4 must also have accepted that transaction's final W transfer."
2. **Burst Legality:** "If `AxBURST` is `WRAP`, then `AxLEN` is mathematically proven to only ever evaluate to 1, 3, 7, or 15 (representing lengths 2, 4, 8, 16)."
3. **Write Interleaving (AXI4):** "Write-data bursts follow write-address issue order; AXI4 has no WID with which to interleave beats from different write transactions. The checker must still allow W data to appear before its AW handshake."
4. **WLAST Exact Match:** "On every accepted W transfer, WLAST must equal whether the accepted-beat index has reached AWLEN. This checks both early assertion and a missing final indication: `assert property (@(posedge ACLK) (WVALID && WREADY) |-> (WLAST == (beat_index == AWLEN)));`"

![AXI Safety: WLAST Exact Match](visual:fp-axi-wlast-exact)
Try it yourself — toggle **WLAST** below to appear early or miss the last beat entirely, and see whether the property holds or breaks, and why.

## Liveness Properties ("Good things eventually happen")

Liveness properties ensure the system continues to make progress and does not deadlock.

1. **Bounded Address Acceptance:** "If `AWVALID` is asserted, then `AWREADY` is asserted within the configured service bound," under documented destination and arbitration assumptions.
2. **Bounded Response Delivery:** "After AXI4 accepts both the write address and final W transfer, `BVALID` is asserted within the configured response bound," under a legal, non-reset environment.
3. **No Circular Wait:** Prove that the implementation's channel and resource dependency graph cannot enter a state in which every pending action waits on another. The base protocol's source-side VALID rules help prevent deadlock, but they do not supply one universal response-time bound.

Formal results are only as strong as the property, abstraction, reset model, and assumptions. Review for vacuity, prove that assumptions are legal and reachable in the real integration, and combine protocol safety proofs with an independent scoreboard, coverage, and configured liveness contracts.
