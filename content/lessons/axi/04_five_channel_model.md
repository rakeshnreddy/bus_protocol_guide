---
id: "04_five_channel_model"
title: "The Five-Channel Mental Model"
summary: "The single most important conceptual shift from AHB: understanding AXI's independent channels."
protocol: "axi"
tier: "1"
level: "beginner"
order: 4
tags: ["axi", "intro", "architecture"]
relatedLessons: ["15_address_data_phase"]
prerequisites: ["03_axi_terminology"]
visualIds: ["topo-axi-five-channels", "wf-axi-write-channels", "wf-axi-read-channels"]
exerciseIds: []
glossaryTerms: ["Write Address Channel (AW)", "Write Data Channel (W)", "Write Response Channel (B)", "Read Address Channel (AR)", "Read Data Channel (R)", "Handshake"]
checklistIds: []
---

To master AXI, you must completely abandon the AHB "shared bus" mental model. 

On each AHB path, an address phase overlaps the previous transfer's data phase, and `HREADY` couples whether both phases advance. Original shared-bus AHB also adds arbitration; AHB-Lite and AHB5 interfaces need not expose that shared-bus arbitration model.

AXI is different. AXI is composed of **five independently handshaken, unidirectional channels**. Each channel has its own flow control, while explicit transaction dependencies and ordering rules still connect their accepted events.

## The Five Channels

1.  **Write Address Channel (AW):** Master -> Slave. The master uses this pipe to say, "I want to write data to address X."
2.  **Write Data Channel (W):** Master -> Slave. The master uses this pipe to send the actual data.
3.  **Write Response Channel (B):** Slave -> Master. The slave uses this pipe to return the write transaction's completion status.
4.  **Read Address Channel (AR):** Master -> Slave. The master uses this pipe to say, "I want to read data from address Y."
5.  **Read Data Channel (R):** Slave -> Master. The slave uses this pipe to return the requested data, along with a success/error status.

*Note: There is no "Read Response" channel. The read response status is sent backward alongside the read data on the R channel.*

This interface map makes ownership explicit. Select a lane to see who sources `VALID` and payload, who returns `READY`, and which transaction dependency applies.

![Five independent AXI4 channels with master and slave ownership and READY return directions](visual:topo-axi-five-channels)

## Concurrency and Independence

Because these are five distinct signal bundles with independent handshakes, they can be active concurrently when the required transaction dependencies, ordering rules, and destination resources permit.

A master can be issuing a new write address (AW channel) while simultaneously sending data for a *previous* write (W channel), while simultaneously receiving a response for an even *older* write (B channel). And it can be doing read operations on the AR and R channels concurrently with all of that.

### Visualizing the Write Channels

All five channels are synchronous to the interface `ACLK`, and transfers are sampled on its rising edge. Their handshake timing is decoupled: write data can transfer before, with, or after the write address when the destination chooses to accept it.

On each channel, the information source drives `VALID` and payload while the destination returns `READY`: the master sources AW, W, and AR; the slave sources B and R. Accepted AR precedes its R data. In AXI4, accepted AW and the accepted W transfer carrying `WLAST` both precede `BVALID`, and W data for transactions follows write-address order.

![Three-beat AXI4 write showing independent address, data, and response handshakes](visual:wf-axi-write-channels)

### Visualizing the Read Channels

The read transaction is simpler, but the independence remains. The Read Address is sent, and the slave eventually returns the data on the Read Data channel.

![Three-beat AXI4 read showing address acceptance, R-channel backpressure, and per-beat response](visual:wf-axi-read-channels)

This independent channel architecture allows for massive pipelining and out-of-order completion, which we will explore in depth in Section D. First, we need to learn the specific signals that live inside each of these five pipes.
