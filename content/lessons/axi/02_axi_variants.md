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
visualIds: ["sig-axi-variants"]
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
*   **Key Upgrade:** AXI4 expands `INCR` bursts from a maximum of 16 beats to 256 beats. `FIXED` remains 1–16 beats, while `WRAP` is legal only at exactly 2, 4, 8, or 16 beats.
*   **Key Simplification:** AXI4 removes the `WID` (Write Data ID) signal. In AXI3, write data could be interleaved beat-by-beat from different transactions. This proved too complex and expensive to route in silicon. AXI4 requires write data to follow write-address order and does not support write-data interleaving.

### AXI4-Lite (AMBA 4.0)
AXI4-Lite is a stripped-down version of AXI4 designed for simple, low-throughput control registers. 
*   **Simplifications:** It removes all burst capabilities (all transactions are strictly 1 beat). It also removes exclusive accesses and many sideband signaling attributes.
*   **Use Case:** If you are building a simple SPI controller or a timer, you do not need the complexity of full AXI4. You use AXI4-Lite to connect to the CPU's control bus. It serves the same purpose as APB in the AHB ecosystem, but uses the AXI handshake protocol.

### AXI-Stream (AMBA 4.0)
AXI-Stream (often abbreviated as AXI4-Stream) is entirely different from the others. It is **not memory-mapped**. There is no address channel. 
*   **Purpose:** It is designed purely for moving continuous streams of data from a source to a destination (e.g., video pixels from a camera, audio samples, or network packets). 
*   **Structure:** It operates like a very fast, unidirectional FIFO, using only the AXI Ready/Valid handshake to stream data infinitely without worrying about memory addresses.

In this curriculum, when we say "AXI," we generally mean AXI4 unless specifically noted. We will dive deeper into AXI4-Lite and AXI-Stream in Section E.

Open each family member below and compare the handshake model, burst limits, IDs, ordering, and typical use without treating the four interfaces as interchangeable.

![Expandable comparison of AXI3, AXI4, AXI4-Lite, and AXI4-Stream capabilities](visual:sig-axi-variants)

## The AXI Family Reference

Choosing the right AXI variant for a specific IP block is critical for balancing performance against area and complexity. Here is a high-value reference table summarizing the key differences.

| Feature | AXI3 | AXI4 (Full) | AXI4-Lite | AXI-Stream |
| :--- | :--- | :--- | :--- | :--- |
| **Addressing** | Memory Mapped | Memory Mapped | Memory Mapped | None (Point-to-point) |
| **Channels** | 5 (AW, W, B, AR, R) | 5 (AW, W, B, AR, R) | 5 (AW, W, B, AR, R) | 1 (T) |
| **Burst Length** | 1–16; WRAP exactly 2/4/8/16 | INCR: 1–256; FIXED: 1–16; WRAP: exactly 2/4/8/16 | Exactly 1 (no bursts) | N/A (continuous stream) |
| **Write Interleaving** | Yes (`WID` exists) | No (`WID` removed) | No | N/A |
| **Outstanding / Response Order**| Multiple outstanding; ID-scoped order | Multiple outstanding; ID-scoped order | Multiple outstanding permitted; no IDs and responses remain ordered | N/A (ordered stream transfers) |
| **Exclusive Access** | Yes | Yes | No | N/A |
| **QoS / Region Support** | No | Yes | No | N/A |
| **Typical Use Case** | Legacy ARM CPUs | High-performance memory (DDR), DMA | Simple control/status registers (UART, GPIO) | Video processing, DSP, Networking (Ethernet) |

## Quick Decision Guide

AXI features are capabilities, not performance requirements. A legal endpoint can expose a smaller documented outstanding depth and can return different-ID responses in request order.

AXI4-Lite uses a fixed 32- or 64-bit data width and every transfer is the full interface width, while `WSTRB` still qualifies which write bytes update. It permits multiple outstanding transactions even though it omits IDs; an endpoint can restrict accepted depth using its handshake signals.

*   **Building a memory controller?** AXI4 provides long INCR bursts and optional concurrency/reordering that a memory controller can use when its architecture benefits.
*   **Building a math accelerator?** Use AXI-Stream for the raw data input/output, and an AXI4-Lite interface for the configuration registers (to set the math mode or read the status flags).
*   **Integrating an old third-party IP block?** You might be forced to use AXI3, but modern interconnects will easily bridge it to an AXI4 system.
