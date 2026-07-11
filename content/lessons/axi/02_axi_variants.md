---
id: "02_axi_variants"
title: "AXI Variants and Evolution"
summary: "Understanding the differences between AXI3, AXI4, AXI4-Lite, and AXI-Stream."
protocol: "axi"
tier: "1"
level: "beginner"
order: 2
tags: ["axi", "intro", "variants"]
relatedLessons: ["01_what_is_axi"]
prerequisites: ["01_what_is_axi"]
visualIds: []
exerciseIds: ["ex-axi-variant-selection"]
glossaryTerms: ["AXI3", "AXI4", "AXI4-Lite", "AXI-Stream"]
checklistIds: []
---

Just as AHB evolved from AHB2 to AHB-Lite and AHB5, AXI has undergone several revisions. Understanding the family tree is crucial because modern SoCs often mix and match these variants depending on the performance needs of specific subsystems.

## The AXI Family Tree

### AXI3 (AMBA 3.0)
Introduced in 2003, AXI3 was the original high-performance multi-channel protocol. It introduced the five independent channels, out-of-order execution, and burst transfers up to 16 beats long. You will still find AXI3 heavily used in older IP cores and early generations of ARM Cortex-A processors.

### AXI4 (AMBA 4.0)
Introduced in 2010, AXI4 is the modern standard for memory-mapped, high-performance interfaces. It is an evolution of AXI3, designed to support even higher throughput and simpler integration.
*   **Key Upgrade:** AXI4 expands the maximum burst length from 16 beats to 256 beats, massively improving efficiency for sequential memory accesses.
*   **Key Simplification:** AXI4 removes the `WID` (Write Data ID) signal. In AXI3, write data could be interleaved beat-by-beat from different transactions. This proved too complex and expensive to route in silicon. AXI4 mandates that write data must be sent in order for a given transaction, simplifying interconnect logic.

### AXI4-Lite (AMBA 4.0)
AXI4-Lite is a stripped-down version of AXI4 designed for simple, low-throughput control registers. 
*   **Simplifications:** It removes all burst capabilities (all transactions are strictly 1 beat). It also removes exclusive accesses and many sideband signaling attributes.
*   **Use Case:** If you are building a simple SPI controller or a timer, you do not need the complexity of full AXI4. You use AXI4-Lite to connect to the CPU's control bus. It serves the same purpose as APB in the AHB ecosystem, but uses the AXI handshake protocol.

### AXI-Stream (AMBA 4.0)
AXI-Stream (often abbreviated as AXI4-Stream) is entirely different from the others. It is **not memory-mapped**. There is no address channel. 
*   **Purpose:** It is designed purely for moving continuous streams of data from a source to a destination (e.g., video pixels from a camera, audio samples, or network packets). 
*   **Structure:** It operates like a very fast, unidirectional FIFO, using only the AXI Ready/Valid handshake to stream data infinitely without worrying about memory addresses.

In this curriculum, when we say "AXI," we generally mean AXI4 unless specifically noted. We will dive deeper into AXI4-Lite and AXI-Stream in Section E.

## The AXI Family Reference

Choosing the right AXI variant for a specific IP block is critical for balancing performance against area and complexity. Here is a high-value reference table summarizing the key differences.

| Feature | AXI3 | AXI4 (Full) | AXI4-Lite | AXI-Stream |
| :--- | :--- | :--- | :--- | :--- |
| **Addressing** | Memory Mapped | Memory Mapped | Memory Mapped | None (Point-to-point) |
| **Channels** | 5 (AW, W, B, AR, R) | 5 (AW, W, B, AR, R) | 5 (AW, W, B, AR, R) | 1 (T) |
| **Max Burst Length** | 16 beats | 256 beats | 1 beat (No bursts) | Infinite |
| **Write Interleaving** | Yes (`WID` exists) | No (`WID` removed) | No | N/A |
| **Out-of-Order Completion**| Yes (via IDs) | Yes (via IDs) | No (Usually ID-less) | N/A (Strictly FIFO) |
| **Exclusive Access** | Yes | Yes | No | N/A |
| **QoS / Region Support** | No | Yes | No | N/A |
| **Typical Use Case** | Legacy ARM CPUs | High-performance memory (DDR), DMA | Simple control/status registers (UART, GPIO) | Video processing, DSP, Networking (Ethernet) |

## Quick Decision Guide

*   **Building a memory controller?** Use AXI4. You need the 256-beat bursts and out-of-order execution to maximize RAM efficiency.
*   **Building a math accelerator?** Use AXI-Stream for the raw data input/output, and an AXI4-Lite interface for the configuration registers (to set the math mode or read the status flags).
*   **Integrating an old third-party IP block?** You might be forced to use AXI3, but modern interconnects will easily bridge it to an AXI4 system.
