---
id: "01_bus_mental_models"
title: "Bus Mental Models"
summary: "Understand what a bus is, why protocols exist, and the difference between shared, point-to-point, and switched architectures."
protocol: "foundations"
tier: "0"
level: "beginner"
order: 1
tags: ["basics", "architecture", "topology"]
visualIds: ["tp-bus-architectures"]
exerciseIds: ["ex-bus-architectures"]
glossaryTerms: ["Bus", "Protocol", "Interconnect", "Point-to-Point", "Transaction", "Beat", "Burst"]
---

Welcome to the Foundations curriculum! Before we dive into specific acronyms like AHB or AXI, we need to understand the fundamental building blocks of digital communication.

## What is a Bus?

In a digital system (like an SoC or ASIC), different functional blocks (CPU, Memory, Peripherals) need to talk to each other. A [glossary:Bus] is simply a shared communication link consisting of a set of wires. Because these wires are shared, we need a set of rules to prevent chaos—this set of rules is called a [glossary:Protocol].

## Bus Architectures

How do we actually connect these blocks together? The routing logic that makes these connections is called the [glossary:Interconnect]. There are three primary ways to build an interconnect topology:

![tp-bus-architectures](visual:tp-bus-architectures)

1. **Shared Bus:** Multiple masters and slaves sit on the exact same physical wires. An arbiter decides who gets to speak. *Pros:* Low area. *Cons:* Low throughput (only one transfer at a time).
2. **Point-to-Point:** A direct, dedicated link between exactly one master and one slave. *Pros:* High speed, no arbitration. *Cons:* Doesn't scale if you have many masters and slaves.
3. **Switched Interconnect (Crossbar):** A complex routing network that allows multiple parallel connections simultaneously. If Master 1 talks to Slave 1, Master 2 can still talk to Slave 2 at the exact same time. Modern protocols like AXI rely heavily on this.

## The Anatomy of a Transfer

When a master wants to read or write data, it performs a **[glossary:Transaction]**. 
A transaction is broken down into smaller pieces:
- The **Command Phase** (or Address Phase): The master says *where* and *how* it wants to access data.
- The **Data Phase**: The actual payload is transferred.

A single unit of data transfer is called a **[glossary:Beat]**. If a master wants to transfer a large block of data efficiently, it can issue a **[glossary:Burst]**—a single address phase followed by multiple data beats. This is much faster than issuing a new address for every single piece of data!

## Information Types

Every protocol separates its wires into three logical groups:
1. **Command/Address:** Information about the destination and the type of request (Read vs Write, size of transfer).
2. **Data:** The actual 1s and 0s being read or written.
3. **Sideband/Control:** Signals that manage the flow of the transfer (clocks, resets, ready/valid handshakes, error flags).

In the next lesson, we'll zoom in on how to think about these individual signals.
