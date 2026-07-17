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
visualIds: ["sig-ahb-evolution"]
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

This comparison uses original AHB in IHI 0011A and AHB5 Issue B.b in IHI 0033B.b. If you are reading code or another specification issue, select its declared interface properties before enabling revision-specific stimulus and checking.

The overarching theme of AHB's evolution has been **simplification of each interface**, with multi-master routing and arbitration handled by system interconnects, followed by optional AHB5 capabilities for modern memory, security, and exclusives.

## Key Differences

| Feature | Original AMBA 2 AHB | AHB-Lite | AHB5 |
| :--- | :--- | :--- | :--- |
| **Masters per interface** | Multiple masters can share one bus | Exactly one | Exactly one |
| **Arbitration signals** | `HBUSREQx`, `HGRANTx`, `HLOCKx` | Not part of the interface | Not part of the interface |
| **Responses** | `OKAY`, `ERROR`, `RETRY`, `SPLIT` on `HRESP[1:0]` | `OKAY`, `ERROR` on one-bit `HRESP` | `OKAY`, `ERROR` on one-bit `HRESP` |
| **Locked sequences** | `HLOCKx` request and bus-level `HMASTLOCK` | `HMASTLOCK` remains defined | `HMASTLOCK` remains defined |
| **Exclusive accesses** | Not defined | Not defined | Optional `HEXCL`, `HMASTER`, `HEXOKAY` capability |
| **Security** | No `HNONSEC` capability | No `HNONSEC` capability | Optional `HNONSEC` capability |
| **Master identity** | Arbiter-generated base `HMASTER[3:0]` for shared-bus functions | No base-interface master ID | With optional exclusives, the B.b signal table lists manager-side `HMASTER[3:0]`; §8.3 generalizes `HMASTER[m:0]` as implementation-defined and requires the interconnect to combine manager/thread and route identity for uniqueness |
| **Burst boundary** | Must not cross 1 KB | Must not cross 1 KB | Must not cross 1 KB |

Open each comparison topic to see which behaviors genuinely changed and which were retained or made optional.

![Interactive AHB evolution guide comparing interface topology, responses, locking, exclusives, security, identity, and burst boundaries](visual:sig-ahb-evolution)

## The Death of SPLIT and RETRY

In AHB2, if a slave (like a slow DRAM controller) needed a long time to fetch data, holding `HREADY` low for 50 cycles would stall the entire shared bus, freezing all masters. 

Original AHB has two different restart mechanisms:

- **RETRY:** the current transfer ends with RETRY and the manager must re-arbitrate and reattempt it. RETRY does not use `HSPLITx` to restore eligibility.
- **SPLIT:** the SPLIT response causes the arbiter to remove that manager from eligibility; the subordinate later asserts the manager's bit on **`HSPLITx`** when it can be considered again.

This made Slave and Arbiter design nightmare-ishly complex. 

AHB-Lite and AHB5 remove shared-bus arbitration from the interface. In a multi-layer or matrix implementation, a stalled target can be isolated to the requesting path while independent master/target paths continue, depending on the interconnect topology. This made the legacy shared-bus `SPLIT` and `RETRY` mechanisms unnecessary and substantially simplified slave and arbitration logic.

The 1KB boundary restriction is unchanged in scope: **every AHB burst**—fixed, undefined-length, incrementing, or wrapping—must remain within one 1KB region.
