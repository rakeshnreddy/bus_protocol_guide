---
id: "01_what_is_axi"
title: "What is AXI?"
summary: "An introduction to the Advanced eXtensible Interface (AXI) protocol and how it differs from AHB."
protocol: "axi"
tier: "1"
level: "beginner"
order: 1
tags: ["axi", "intro", "architecture"]
relatedLessons: ["01_ahb_overview"]
prerequisites: ["01_bus_mental_models"]
visualIds: ["tl-abstract-transaction"]
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

The Advanced eXtensible Interface (AXI) is the flagship high-performance protocol in the AMBA family. If AHB is a fast city road, AXI is an multi-lane, access-controlled superhighway.

While AHB is excellent for mid-tier peripherals and subsystems, modern SoCs (System-on-Chip) require massive data throughput—often moving gigabytes of data per second between multi-core CPUs, GPUs, hardware accelerators, and DDR memory controllers. AXI was designed specifically to handle these extreme bandwidth requirements.

## AXI vs. AHB: The Big Shift

If you have completed the AHB track, you already understand how a shared bus works: a master requests the bus, gets an address phase, and then gets a data phase. The entire bus is locked into that sequence.

AXI abandons the shared bus model entirely. Instead, AXI introduces two fundamental concepts that define its architecture:

1. **Independent Channels:** AXI splits the bus into five completely independent, unidirectional channels. Read addresses, read data, write addresses, write data, and write responses all travel on their own dedicated wires. They do not share a single "data bus" or "address bus."
2. **True Out-of-Order Execution:** Because the channels are independent, an AXI master can fire off multiple read and write requests without waiting for the data to come back. The slave can return the data whenever it is ready, and it can even return data for different requests *out of order* if it helps optimize memory access.

### Why the Change?

AHB's pipelining (Address Phase overlapping with the previous Data Phase) is efficient, but it forces transactions to complete in the exact order they were issued. If an AHB master asks for Address A (which is slow to fetch) and then Address B (which is fast to fetch), Address B is stuck waiting behind A.

In AXI, the master can issue Address A and Address B on the Address Channel. The slave can fetch B immediately, return B's data on the Data Channel, and then return A's data later. This out-of-order capability is the secret to AXI's massive throughput, particularly when talking to complex DDR memory controllers.

## Key Features of AXI

Beyond independent channels and out-of-order execution, AXI introduces several other performance features:

*   **Burst-based transactions with only the start address issued:** A master only sends one address, and the slave calculates the subsequent addresses for the rest of the burst.
*   **Unaligned data transfers:** AXI natively supports transfers that do not align to the data bus width.
*   **Separate read and write data channels:** This allows simultaneous, full-duplex reads and writes.

## Abstract Transaction Flow

Regardless of the protocol, transactions generally follow a logical timeline of phases. AXI allows these phases to overlap significantly:

![The sequence of phases in a bus transaction. Try hovering over the phases!](visual:tl-abstract-transaction)

In the next lesson, we will look at how AXI has evolved over the years into different variants.
