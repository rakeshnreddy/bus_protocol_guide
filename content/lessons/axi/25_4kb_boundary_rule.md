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
visualIds: ["wf-axi-4kb-boundary"]
exerciseIds: ["ex-axi-4kb-calc"]
glossaryTerms: ["4KB Boundary Rule"]
checklistIds: []
---

If you ask an experienced DV engineer to name one rule from the AXI specification, they will almost certainly name this one:

> **A burst must not cross a 4KB address boundary.**

## What does this mean?

A 4KB (4096 byte) boundary occurs at any address where the lower 12 bits are zero (e.g., `0x0000`, `0x1000`, `0x2000`, `0x3000`).

If a master initiates a burst, the starting address and the total length of the burst must be calculated such that the burst finishes *before* or *exactly on* the byte just prior to the next 4KB boundary (e.g., `0x0FFF`, `0x1FFF`).

![wf-axi-4kb-boundary](visual:wf-axi-4kb-boundary)

In the visual above, the first burst attempts to write 16 bytes (4 beats of 4 bytes) starting at `0x0FF8`.
*   Beat 1: `0x0FF8`
*   Beat 2: `0x0FFC`
*   Beat 3: `0x1000` <-- **VIOLATION!**

This burst crosses the `0x1000` boundary and is strictly illegal. The master must instead break this into two separate bursts: one burst of 2 beats (ending at `0x0FFC`), and a completely new transaction starting at `0x1000`.

## Why does this rule exist?

This rule exists to simplify the design of memory controllers and interconnects.

1.  **Memory Paging:** In modern operating systems and memory controllers (like DDR), memory is often managed in 4KB pages. Crossing a 4KB boundary might mean jumping from one physical memory page to a completely different, non-contiguous physical page, or hitting a page fault.
2.  **Slave Boundaries:** In an interconnect, a 4KB region is often the smallest granularity for decoding slaves. Addresses `0x0000` to `0x0FFF` might belong to Slave A, while `0x1000` to `0x1FFF` might belong to Slave B. 

If AXI allowed a single burst to cross a 4KB boundary, a single transaction might start in Slave A and finish in Slave B. The interconnect would have to magically split the transaction in half on the fly, manage two separate handshakes, and re-assemble the responses. By forcing the master to break the burst at the 4KB boundary, the interconnect design remains incredibly simple and fast.
