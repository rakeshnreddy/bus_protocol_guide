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
visualIds: ["tp-axi-crossbar", "tl-abstract-transaction"]
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

The Advanced eXtensible Interface (AXI) is the flagship high-performance protocol in the AMBA family. If AHB is a fast city road, AXI is a multi-lane, access-controlled superhighway.

While AHB is excellent for mid-tier peripherals and subsystems, modern SoCs (System-on-Chip) require massive data throughput—often moving gigabytes of data per second between multi-core CPUs, GPUs, hardware accelerators, and DDR memory controllers. AXI was designed specifically to handle these extreme bandwidth requirements.

## AXI vs. AHB: The Big Shift

If you have completed the AHB track, you already understand how a shared bus works: a master requests the bus, gets an address phase, and then gets a data phase. Transfers share one pipelined path, so a stalled data phase prevents later addresses from being accepted.

AXI replaces that shared transfer pipeline with interface channels that an interconnect can route independently. Two fundamental concepts define its architecture:

1. **Independently handshaken channels:** AXI splits the interface into five unidirectional channels. Read addresses, read data, write addresses, write data, and write responses each have dedicated payload and flow-control signals. Their handshakes can progress separately, subject to explicit cross-channel dependencies and ordering rules.
2. **Multiple outstanding transactions and ID-based reordering:** An implementation can accept multiple read and write requests without waiting for earlier responses. A capable slave or interconnect can return responses for different IDs *out of request order*, while still obeying AXI's ID- and destination-scoped ordering rules.

The system view below shows where those interfaces live: initiators connect through an AXI fabric that decodes destinations, arbitrates only where routes contend, and returns each response to the correct source.

![CPU and DMA initiators using concurrent AXI crossbar routes to memory targets](visual:tp-axi-crossbar)

### Why the Change?

AHB's pipelining (an Address Phase overlapping the previous Data Phase) is efficient, but a single AHB path accepts and completes transfers in pipeline order. If Address A produces a wait state, an overlapping Address B can be visible but cannot be accepted until that path becomes ready.

In AXI, the master can issue Address A and Address B on an address channel. If they use different IDs and the target supports the required concurrency, the target can fetch B immediately, return B's response first, and then return A later. Multiple outstanding work and legal reordering are major sources of AXI throughput, particularly when talking to complex DDR memory controllers.

## Key Features of AXI

Beyond independent channels and out-of-order execution, AXI introduces several other performance features:

*   **Burst-based transactions with only the start address issued:** A master only sends one address, and the slave calculates the subsequent addresses for the rest of the burst.
*   **Unaligned data transfers:** AXI permits unaligned starts for INCR and FIXED transfers when the address and byte-lane information agree; WRAP starts must be transfer-size aligned.
*   **Separate read and write data channels:** This allows simultaneous, full-duplex reads and writes.

## Abstract Transaction Flow

AXI reads and writes each have a logical lifetime, but their independent channel windows can overlap significantly:

All five memory-mapped channels are synchronous to `ACLK`. “Independent” describes their handshakes, not separate clocks or the absence of relationships: accepted AR precedes its R data, and in AXI4 an accepted AW plus the accepted final W beat precede `BVALID`.

![AXI4 read and write transaction lifetimes showing overlapping address, data, and response channels](visual:tl-abstract-transaction)

In the next lesson, we will look at how AXI has evolved over the years into different variants.
