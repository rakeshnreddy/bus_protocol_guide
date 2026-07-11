---
id: "03_ahb_terminology"
title: "AHB Terminology Primer"
summary: "A quick reference for the naming conventions and signal prefixes used in the AHB protocol."
protocol: "ahb"
tier: "1"
level: "beginner"
order: 3
tags: ["ahb", "terminology"]
relatedLessons: []
prerequisites: ["01_ahb_overview"]
visualIds: []
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

## The "H" Prefix

When looking at an RTL design, it is usually very easy to spot AHB signals because almost all of them start with the letter **H** (for High-performance). 

For example:
- **`HCLK`**: The AHB Clock
- **`HADDR`**: The AHB Address bus
- **`HWDATA`**: The AHB Write Data bus

*Contrast this with APB (where signals start with `P`, like `PADDR`) and AXI (where signals start with `A`, like `AWADDR`).*

## Master vs Slave vs Arbiter vs Decoder

In any AHB system, there are four conceptual roles:

1. **Master:** The initiator. A master starts a transfer by providing address and control information. (Examples: CPU, DMA controller).
2. **Slave:** The responder. A slave waits for a master to talk to it, and then either accepts written data or provides read data. (Examples: SRAM, Flash memory, peripheral registers).
3. **Arbiter:** If multiple masters share the same wires (rare today, but conceptually important), the arbiter decides who gets to talk.
4. **Decoder:** Because the address bus is shared, the decoder looks at the `HADDR` driven by the master and uses a memory map to select exactly one slave. It asserts a signal called `HSELx` (Select) to tell that specific slave it is being addressed.

## Naming Conventions in Modern Systems

In modern SoC design, masters and slaves are connected via a **Bus Matrix** (a crossbar switch). 

When you look at the interface of a Bus Matrix, you will often see signal names appended with `M` or `S`, or specific indices:
- `HADDR_M0`: The address bus coming *from* Master 0 into the matrix.
- `HADDR_S1`: The address bus going *out* to Slave 1 from the matrix.

Understanding these naming conventions is critical for debugging, because a bug might exist on the Master-to-Matrix link, inside the Matrix itself, or on the Matrix-to-Slave link!
