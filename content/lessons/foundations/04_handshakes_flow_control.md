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

## AXI Ready/Valid Transfer Acceptance

The most common handshake in modern protocols (like AXI) is the `VALID` and `READY` mechanism.
- `VALID`: Driven by the source (the sender). It means "The data on the wires right now is good, please take it."
- `READY`: Driven by the destination (the receiver). It means the destination can accept the offered payload on an edge where `VALID` is also HIGH.

A transfer *only* occurs when both `VALID` and `READY` are HIGH on the same rising clock edge.

## Backpressure and Stalls

What happens if a channel source sends `VALID`, but the destination keeps `READY` low?

This is AXI **[glossary:Backpressure]** on that channel. Once an AXI source asserts `VALID`, it must retain `VALID` and the complete channel payload until a rising edge where `VALID && READY` accepts the transfer. The source must not wait for `READY` before first asserting `VALID`; the destination is permitted to wait for `VALID` before asserting `READY`.

![wf-handshake-backpressure](visual:wf-handshake-backpressure)

In the waveform above, notice how the source holds `DATA` and `VALID` steady through the stalled cycles. After an accepting edge, it can keep `VALID` HIGH and present a new payload for the next cycle; `VALID` does not need to pulse LOW between back-to-back transfers.

The source and destination are channel-specific. A manager is the source on AW, W, and AR, but the subordinate is the source on B and R. AXI also prohibits combinational paths between interface inputs and outputs, preventing a direct READY/VALID feedback loop.

Legal timing includes READY-first, VALID-first, simultaneous assertion, and continuous back-to-back handshakes. Useful generic checks are VALID persistence, stalled-payload stability, known controls at acceptance, and a handshake counter sampled only when both signals are HIGH.

## AHB `HREADY` Pipeline Flow Control

AHB does not use VALID/READY on independent channels. A valid address phase is accepted on a rising `HCLK` edge when global `HREADY` is HIGH. When the current data phase is waited, a pending valid address/control phase normally remains stable and the pipeline cannot advance; stalled write data for the current data owner must also remain stable. `IDLE`, `BUSY`, and the first cycle of the defined two-cycle ERROR response require the precise protocol exceptions taught in the AHB curriculum.

## Request/Grant Handshakes

Original shared-bus AHB uses per-manager `HBUSREQx` and `HGRANTx` for **arbitration**. These signals select who may own the shared address bus at a legal handover boundary; they do not report whether a subordinate can complete the current transfer. `HREADY` is the AHB transfer-flow-control signal. AHB-Lite/AHB5 has one manager per interface and therefore does not expose original shared-bus request/grant on that interface, even when a matrix performs internal arbitration.

Verification must therefore classify a failure before choosing a property: AXI channel acceptance, AHB pipeline advancement, and original-AHB ownership are three different mechanisms. Coverage should include legal handshake order, consecutive transfers, stall buckets, AHB wait position, and arbitration latency separately.
