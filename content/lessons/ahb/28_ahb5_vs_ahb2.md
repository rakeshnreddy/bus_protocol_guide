---
id: "28_ahb5_vs_ahb2"
title: "AHB5 vs AHB2: What Changed?"
summary: "A quick reference guide comparing AMBA 2.0 AHB with modern AHB5."
protocol: "ahb"
tier: "1"
level: "advanced"
order: 28
tags: ["ahb", "advanced", "ahb5", "history"]
relatedLessons: []
prerequisites: ["22_ahb_lite_simplifications", "26_exclusive_accesses", "27_secure_vs_non_secure"]
visualIds: []
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

AMBA 2.0 (AHB2) was released in 1999. Decades later, AMBA 5 (AHB5) is the modern standard. If you are reading legacy code, older specifications, or transitioning from AXI, it is vital to understand what changed.

The overarching theme of AHB's evolution has been **simplification of the interface** by moving complex routing and arbitration logic out of the protocol and into the interconnect matrix.

## Key Differences

| Feature | AMBA 2.0 (AHB2) | AHB-Lite / AHB5 |
| :--- | :--- | :--- |
| **Masters per Bus** | Multiple (Shared Bus) | **Exactly One** (Point-to-point) |
| **Arbitration Signals** | `HBUSREQ`, `HGRANT` | **Removed** (Handled internally by matrix) |
| **Master ID** | `HMASTER` | **Removed** from interface (Matrix handles routing) |
| **Error Responses** | `OKAY`, `ERROR`, `RETRY`, `SPLIT` | **`OKAY`, `ERROR` only**. `RETRY`/`SPLIT` removed. |
| **Atomic Operations** | `HMASTLOCK` (Bus locking) | **`HEXCL`, `HEXOKAY`** (Exclusive Accesses) |
| **Security** | None | **`HNONSEC`** (TrustZone integration) |
| **Burst Rules** | Bursts can cross 1KB boundary | Bursts **must not** cross 1KB boundary |

## The Death of SPLIT and RETRY

In AHB2, if a slave (like a slow DRAM controller) needed a long time to fetch data, holding `HREADY` low for 50 cycles would stall the entire shared bus, freezing all masters. 

To fix this, AHB2 allowed the slave to respond with `SPLIT` or `RETRY`. This told the Arbiter: "I can't serve this master right now, kick him off the bus and let someone else use it, and I'll tell you when I'm ready."

This made Slave and Arbiter design nightmare-ishly complex. 

Because AHB-Lite and AHB5 mandate a single-master interface connected to a crossbar matrix, **a stalled slave no longer stalls the whole system.** It only stalls the specific master trying to talk to it. The rest of the matrix keeps running. Therefore, `SPLIT` and `RETRY` were completely removed, massively simplifying slave RTL.
