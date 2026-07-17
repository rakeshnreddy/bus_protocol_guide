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
visualIds: ["topo-ahb-terminology-map"]
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

*Contrast this with AXI's channel-specific prefixes: `AW`, `W`, `B`, `AR`, and `R`. Only the address-channel names begin with `A`; examples include `AWADDR`, `WDATA`, `BRESP`, `ARADDR`, and `RDATA`.*

## Master vs Slave vs Arbiter vs Decoder

An AHB system can contain these conceptual roles, but its physical blocks depend on topology:

1. **Master:** The initiator. A master starts a transfer by providing address and control information. (Examples: CPU, DMA controller).
2. **Slave:** The responder. A slave waits for a master to talk to it, and then either accepts written data or provides read data. (Examples: SRAM, Flash memory, peripheral registers).
3. **Arbiter:** Original shared-bus AHB exposes arbitration at the protocol interface. An AHB-Lite/AHB5 matrix can arbitrate internally when routes contend; a point-to-point interface needs no standalone arbiter.
4. **Decoder:** Address-map decode selects the routed subordinate for a valid transfer. The decode can be distributed or integrated rather than one central block. A mapped transfer normally selects one intended subordinate; an unmapped transfer must route to a defined default/error subordinate or equivalent error path, not disappear.

The concept map connects these roles to the transaction words used throughout the course. Follow the highlighted path, then inspect **Beat**, **Burst**, **Wait State**, and **Response** to see how they relate.

![AHB concept map linking roles, transfers, beats, bursts, phases, waits, and responses](visual:topo-ahb-terminology-map)

## Naming Conventions in Modern Systems

In modern SoC design, masters and slaves are connected via a **Bus Matrix** (a crossbar switch). 

When you look at one project or vendor's Bus Matrix, you might see signal names appended with `M` or `S`, or specific indices:
- `HADDR_M0`: The address bus coming *from* Master 0 into the matrix.
- `HADDR_S1`: The address bus going *out* to Slave 1 from the matrix.

These suffixes are RTL naming conventions, not AHB protocol signal names. Confirm the local convention before using `_M0` or `_S1` to infer direction. A bug might exist on the manager-to-matrix link, inside the matrix, or on the matrix-to-subordinate link.
