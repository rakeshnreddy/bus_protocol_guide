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

## Interface, Protocol, Bus, and Interconnect

In a digital system (like an SoC or ASIC), different functional blocks (CPU, memory, peripherals) need to communicate. Four related terms describe different parts of that problem:

- An **interface** is the signal boundary exposed by one component.
- A [glossary:Protocol] is the set of rules that gives those signals meaning: who drives them, when they are sampled, which values are legal, and how work completes.
- A **shared [glossary:Bus]** is one topology in which multiple participants contend for a common transfer resource.
- An [glossary:Interconnect] is the routing and coordination logic between interfaces. It can be a shared bus, a point-to-point link, a matrix, or a switched fabric.

That distinction matters: AXI and modern AHB-Lite/AHB5 interfaces are often connected through switched or multilayer interconnects even though engineers still use “bus protocol” as a broad category name.

## Bus Architectures

How do we actually connect these blocks together? The routing logic that makes these connections is called the [glossary:Interconnect]. There are three primary ways to build an interconnect topology:

![tp-bus-architectures](visual:tp-bus-architectures)

1. **Shared Bus:** Multiple masters and slaves sit on the exact same physical wires. An arbiter decides who gets to speak. *Pros:* Low area. *Cons:* Low throughput (only one transfer at a time).
2. **Point-to-Point:** A direct, dedicated link between exactly one master and one slave. *Pros:* High speed, no arbitration. *Cons:* Doesn't scale if you have many masters and slaves.
3. **Switched Interconnect (Crossbar):** A routing network that can establish multiple paths simultaneously. Master 1 can reach Slave 1 while Master 2 reaches Slave 2 only when the selected routes, targets, and shared internal resources do not conflict. Requests for the same target still require arbitration, buffering, or backpressure.

## The Anatomy of a Transfer

When a source wants to read or write data, it performs a **[glossary:Transaction]**. A single accepted data transfer is often called a **[glossary:Beat]**, and a [glossary:Burst] groups multiple beats. The exact structure is protocol-specific:

- **AHB:** every accepted burst beat has its own address/control phase. The first valid beat uses `NONSEQ`; later accepted beats normally use `SEQ`, with the data/response phase following one phase behind.
- **AXI read:** one AR channel handshake declares the burst, followed by the declared number of R channel data-beat handshakes.
- **AXI write:** AW declares the burst, W carries its beats, and B returns one write response. AW and W are independently handshaken, so their visible activity can occur in either order.

This is why “one address followed by many data beats” is useful for AXI but is not a universal definition of a burst.

## Information Organization Is Protocol-Specific

Most interfaces carry address or command information, data, completion information, and attributes, but they do not divide the wires in one universal way. AHB overlaps an address/control phase with the previous transfer's data/response phase. AXI uses five separately handshaken address, data, and response channels. Clock and reset establish the interface timing domain and state; they are not transaction sidebands.

## Design Obligations and DV Obligations

An interconnect design must define address decoding, request arbitration, target selection, buffering, ordering, and the return-data/response route. It also needs a defined result for an unmapped address and must not activate overlapping targets unintentionally.

A verification plan should generate both distinct-target concurrency and same-target contention, long target stalls, decode misses, address-map overlaps, and arbitration handover. Check that each accepted request produces exactly one completion for the correct source, that target selection is one-hot or intentionally routed to a default target, and that no request is dropped or duplicated. Useful coverage crosses topology, active initiator count, same/different target, arbitration result, stall bucket, response type, and any configured fairness result.

In the next lesson, we'll zoom in on how to think about these individual signals.
