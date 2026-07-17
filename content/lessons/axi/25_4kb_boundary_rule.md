---
id: "25_4kb_boundary_rule"
title: "The 4KB Boundary Rule"
summary: "The most famous constraint in the AXI specification and why it exists."
protocol: "axi"
tier: "1"
level: "expert"
order: 25
tags: ["axi", "rules", "memory"]
relatedLessons: ["26_legal_illegal_patterns"]
prerequisites: ["24_address_alignment"]
visualIds: ["wf-axi-4kb-boundary", "model-axi-burst-checker"]
exerciseIds: ["lab-axi-4kb-request-check", "ex-axi-4kb-calc"]
glossaryTerms: ["4KB Boundary Rule"]
checklistIds: []
---

If you ask an experienced DV engineer to name one rule from the AXI specification, they will almost certainly name this one:

> **A burst must not cross a 4KB address boundary.**

## What does this mean?

A 4KB (4096 byte) boundary occurs at any address where the lower 12 bits are zero (e.g., `0x0000`, `0x1000`, `0x2000`, `0x3000`).

If a master initiates a burst, the starting address and the total length of the burst must be calculated such that the burst finishes *before* or *exactly on* the byte just prior to the next 4KB boundary (e.g., `0x0FFF`, `0x1FFF`).

![Illegal four-beat AXI4 burst crossing 0x1000 compared with two legal split transactions](visual:wf-axi-4kb-boundary)

In the visual above, the first burst attempts to write 16 bytes (4 beats of 4 bytes) starting at `0x0FF8`.
*   Beat 1: `0x0FF8`
*   Beat 2: `0x0FFC`
*   Beat 3: `0x1000` <-- **VIOLATION!**

This burst crosses the `0x1000` boundary and is strictly illegal. The master must instead break this into two separate bursts: one burst of 2 beats (ending at `0x0FFC`), and a completely new transaction starting at `0x1000`.

For an aligned INCR example, `bytesPerBeat=2^AxSIZE`, `beats=AxLEN+1`, and `endExclusive=start+beats×bytesPerBeat`; legality requires `floor(start/4096) = floor((endExclusive-1)/4096)`. Here `endExclusive=0x0FF8+16=0x1008`, so the final transferred byte is `0x1007` and the burst is illegal. A general checker should derive every beat's active byte range so unaligned, FIXED, and WRAP cases use the bytes actually accessed rather than an over-simple total-span shortcut.

## Why does this rule exist?

This rule exists to simplify the design of memory controllers and interconnects.

1.  **Bounded address generation:** The rule limits the number of address increments a target must support. Operating-system virtual-memory page faults are not an AXI response mechanism and are not the protocol rationale.
2.  **Slave Boundaries:** The protocol rule prevents one burst from crossing a possible decode boundary. Addresses `0x0000` to `0x0FFF` might belong to Slave A, while `0x1000` to `0x1FFF` might belong to Slave B.

If a burst crossed a 4KB boundary, one transaction could require two decode destinations. AXI forbids that case, so the requester must issue separate legal transactions and each accepted burst retains one destination and one response context.

## Execute the burst, lane, and boundary checker

The burst model calculates FIXED, INCR, and WRAP beat addresses, active byte lanes for narrow and unaligned transfers, legal `WSTRB` subsets, accepted-beat `LAST`, and every active byte touched by the 4 KB rule. Compare a legal WRAP example with an illegal crossing and inspect the exact legal split. The checker deliberately avoids using an aligned-span shortcut for cases where the active byte lanes tell the more precise story.

![Executable AXI burst checker for address formulas, byte lanes, WSTRB, LAST, and exact 4 KB split calculations](visual:model-axi-burst-checker)
