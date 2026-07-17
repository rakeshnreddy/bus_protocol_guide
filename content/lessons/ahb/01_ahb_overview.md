---
id: "01_ahb_overview"
title: "AHB Overview"
summary: "What AHB is, its history in the AMBA family, and where it fits relative to APB and AXI."
protocol: "ahb"
tier: "1"
level: "beginner"
order: 1
tags: ["ahb", "basics", "amba"]
relatedLessons: ["02_ahb_variants", "03_ahb_terminology"]
prerequisites: ["01_bus_mental_models"]
visualIds: ["tp-basic-ahb"]
exerciseIds: []
glossaryTerms: ["AHB", "AMBA", "APB", "AXI"]
checklistIds: []
---

## What is AHB?

**[glossary:AHB]** (Advanced High-performance Bus) is an on-chip transfer protocol in the **[glossary:AMBA]** (Advanced Microcontroller Bus Architecture) family. The original shared-bus protocol is specified by AMBA 2 AHB (IHI 0011A). The modern single-manager interface model taught by AMBA 5 AHB (IHI 0033B.b) retains AHB's coupled address/data pipeline and is commonly connected through a multilayer matrix.

Unlike older buses, AHB introduced concepts that are now standard in digital design:
- Separate address/control and data phases
- Pipelined transfers (the address phase of transfer $N+1$ overlaps with the data phase of transfer $N$)
- Burst transfers for efficient memory access

## Where does AHB fit?

The AMBA family consists of several protocols, each optimized for a specific use case. To understand AHB, you must understand what it is *not*:

1. **[glossary:APB] (Advanced Peripheral Bus):** APB is the "slow" bus. It is simple, unpipelined, and used to connect low-bandwidth peripherals like UARTs, timers, and simple control registers. It uses minimal power and minimal logic area.
2. **AHB (Advanced High-performance Bus):** AHB sits in the middle. It is pipelined and supports bursts, making it much faster than APB. It is typically used for the "main" system bus in a microcontroller (connecting the CPU to SRAM and Flash).
3. **[glossary:AXI] (Advanced eXtensible Interface):** AXI uses five independently handshaken channels and can support multiple outstanding transactions. Response completion is constrained by IDs, per-burst ordering, transaction attributes, and the ordering rules; it is not arbitrarily out of order.

Use the topology below to trace one selected SRAM access. Focus on which information leaves the master, how `HADDR` selects a slave, and which signals return to complete the transfer.

![AHB master, interconnect, decoder, and selected slave data paths](visual:tp-basic-ahb)

**Key Takeaway:** Protocol choice is a product decision. AHB's coupled pipeline is useful for many low-latency subsystem interfaces; AXI's separate channels and ID-based outstanding model fit systems that need more concurrency. Neither topology or product category is mandated by the protocol.

## The Mental Model

Original AMBA 2 AHB defines multiple managers arbitrating for a shared bus. AHB-Lite/AHB5 instead defines one manager per interface; systems obtain multi-manager connectivity through a matrix or other interconnect that performs its own routing and arbitration. Both use a tightly coupled two-phase transfer:
1. An **address/control phase**, presented by the manager.
2. A following **data/response phase**, which can take one or more cycles.

A wait state extends the current data/response phase. While it is extended, the next valid address/control phase can remain visible but is not accepted, so pipeline advancement is blocked. It is misleading to say that the accepted transfer's address phase itself simply becomes multi-cycle.

Because it is pipelined, transfer 1 can own the data/response phase while transfer 2 is visible in the address/control lane. A monitor must retain those two owners separately and create the transfer-2 record only on a rising edge where `HREADY` is HIGH.
