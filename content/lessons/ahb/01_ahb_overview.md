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
visualIds: []
exerciseIds: []
glossaryTerms: ["AHB", "AMBA", "APB", "AXI"]
checklistIds: []
---

## What is AHB?

**[glossary:AHB]** (Advanced High-performance Bus) is one of the most widely used on-chip bus protocols in the world. Originally introduced by ARM in 1999 as part of the **[glossary:AMBA]** (Advanced Microcontroller Bus Architecture) 2.0 specification, it was designed to connect high-performance processors (like early Cortex CPUs) to high-bandwidth memory systems.

Unlike older buses, AHB introduced concepts that are now standard in digital design:
- Separate address/control and data phases
- Pipelined transfers (the address phase of transfer $N+1$ overlaps with the data phase of transfer $N$)
- Burst transfers for efficient memory access

## Where does AHB fit?

The AMBA family consists of several protocols, each optimized for a specific use case. To understand AHB, you must understand what it is *not*:

1. **[glossary:APB] (Advanced Peripheral Bus):** APB is the "slow" bus. It is simple, unpipelined, and used to connect low-bandwidth peripherals like UARTs, timers, and simple control registers. It uses minimal power and minimal logic area.
2. **AHB (Advanced High-performance Bus):** AHB sits in the middle. It is pipelined and supports bursts, making it much faster than APB. It is typically used for the "main" system bus in a microcontroller (connecting the CPU to SRAM and Flash).
3. **[glossary:AXI] (Advanced eXtensible Interface):** AXI is the "heavyweight" bus. It features separate, independent channels for reads, writes, addresses, and responses. It supports multiple outstanding transactions and out-of-order completion. AXI is used in high-performance SoCs (connecting multi-core application processors to DDR memory controllers).

**Key Takeaway:** If you are building a simple, low-power microcontroller (like an IoT edge node), AHB is your primary system bus. If you are building a massive smartphone SoC, AXI is the backbone, and AHB is used for smaller subsystems.

## The Mental Model

AHB is fundamentally a **shared bus** (though it is often implemented via a switched matrix today). Its defining characteristic is its tight **pipeline**. Every transfer consists of two distinct parts:
1. An **Address Phase** (lasting exactly one clock cycle, unless the bus is stalled).
2. A **Data Phase** (lasting one or more clock cycles).

Because it is pipelined, the bus can be sending the *data* for Transfer 1 at the exact same time it is sending the *address* for Transfer 2. This overlap is the key to AHB's performance, but also the source of its most common verification bugs!
