---
id: "28_axi4_lite_simplifications"
title: "AXI4-Lite Simplifications"
summary: "The stripped-down version of AXI for simple control registers."
protocol: "axi"
tier: "1"
level: "beginner"
order: 28
tags: ["axi", "axi-lite", "registers"]
relatedLessons: ["27_axi3_vs_axi4_differences", "02_axi_variants"]
prerequisites: ["04_five_channel_model"]
visualIds: ["sig-axi4-lite-interface"]
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

Not every peripheral needs the massive throughput of full AXI. If you are designing a simple UART, a timer, or a block of configuration registers, adding support for 256-beat bursts, out-of-order completion, and exclusive accesses is a huge waste of silicon area.

For these use cases, ARM created **AXI4-Lite**. 

AXI4-Lite retains the five-channel `VALID`/`READY` architecture of AXI4, but strips away all the complexity.

## The Rules of AXI4-Lite

1.  **No Bursts:** All transactions must be exactly 1 beat long.
    *   There is no `AxLEN`, `AxBURST`, or `AxSIZE`.
    *   Since every transaction is 1 beat, there is no `WLAST` or `RLAST` signal.
2.  **No ID-based reordering:**
    *   AXI4-Lite does not support AXI IDs as ordering domains, so transactions complete in order.
    *   Optional ID reflection can be added for direct interoperability with a full AXI connection, but it does not turn the Lite slave into an out-of-order endpoint.
3.  **Data Width:** The data bus must be exactly 32-bits or 64-bits wide.
4.  **No Exclusive Accesses:** No `AxLOCK` signal.
5.  **Fixed cache behavior, retained protection:** `AxCACHE` is absent and every access is defined as Non-modifiable and Non-bufferable. `AWPROT` and `ARPROT` remain in the AXI4-Lite signal set.

The explorer below answers: **which signals actually remain on each Lite channel, and which full-AXI controls are fixed or omitted?**

![Interactive AXI4-Lite five-channel signal surface with retained and omitted controls](visual:sig-axi4-lite-interface)

## Why use AXI4-Lite?

AXI4-Lite has a substantially smaller state and checking surface than full AXI4, while retaining independent channel handshakes and backpressure behavior.

In a typical System-on-Chip (SoC), the high-speed CPU and DDR controllers talk using full AXI4 while control peripherals expose AXI4-Lite. A direct connection is possible when the requester emits only the Lite subset; otherwise an adapter must convert, protect against, or detect unsupported full-AXI transactions.
