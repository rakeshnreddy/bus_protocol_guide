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
visualIds: []
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
2.  **No IDs (Effectively):** 
    *   All transactions must complete in order. 
    *   The specification allows `AxID` signals to exist, but the slave is not allowed to use them to reorder traffic. Most AXI4-Lite interfaces just drop the ID signals entirely.
3.  **Data Width:** The data bus must be exactly 32-bits or 64-bits wide.
4.  **No Exclusive Accesses:** No `AxLOCK` signal.
5.  **No Cache/Protection:** Often strips away `AxCACHE` and `AxPROT`, though some implementations keep them for basic security checking.

## Why use AXI4-Lite?

AXI4-Lite is incredibly easy to implement. A basic AXI4-Lite slave state machine can be written in a few dozen lines of Verilog. 

In a typical System-on-Chip (SoC), the high-speed CPU and DDR controllers talk to each other using full AXI4. A bridge then converts full AXI4 down to AXI4-Lite to talk to the slow, simple peripherals (like GPIO or UART) on the edge of the chip.
