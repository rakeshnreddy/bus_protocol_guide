---
id: "04_handshakes_flow_control"
title: "Handshakes and Flow Control"
summary: "Master the Ready/Valid handshake, request/grant mechanisms, and how backpressure prevents data loss."
protocol: "foundations"
tier: "0"
level: "beginner"
order: 4
tags: ["handshake", "backpressure", "flow-control"]
visualIds: ["wf-handshake-backpressure"]
exerciseIds: ["ex-handshakes"]
glossaryTerms: ["Handshake", "Backpressure"]
---

Because masters and slaves often run at different speeds or process data at different rates, they need a way to say "I have data for you" and "I am ready to receive data." This coordination is called a **[glossary:Handshake]**.

## The Ready/Valid Handshake

The most common handshake in modern protocols (like AXI) is the `VALID` and `READY` mechanism.
- `VALID`: Driven by the source (the sender). It means "The data on the wires right now is good, please take it."
- `READY`: Driven by the destination (the receiver). It means "I have space in my buffers to accept data on the next clock edge."

A transfer *only* occurs when both `VALID` and `READY` are HIGH on the same rising clock edge.

## Backpressure and Stalls

What happens if the master sends `VALID`, but the slave is busy and keeps `READY` low?

This is called **[glossary:Backpressure]**. The slave is stalling the master. 
There is a strict, unbreakable rule in almost all protocols regarding backpressure: **Once a sender asserts `VALID`, it is NOT allowed to de-assert it until the receiver asserts `READY` and the transfer completes.**

![wf-handshake-backpressure](visual:wf-handshake-backpressure)

In the waveform above, notice how the master is forced to hold `DATA` and `VALID` completely steady during cycles 2 and 3. If the master were to change the data or drop `VALID` because it got impatient, data would be lost or corrupted.

## Request/Grant Handshakes

Older protocols (like AHB) use a different model for arbitration: `REQ` (Request) and `GNT` (Grant).
A master asserts `REQ` to the central arbiter when it wants to use the shared bus. The arbiter eventually asserts `GNT` to that specific master. Once granted, the master takes ownership of the bus. 

Whether it's Ready/Valid or Request/Grant, the core concept is the same: flow control prevents fast components from overwhelming slow components.
