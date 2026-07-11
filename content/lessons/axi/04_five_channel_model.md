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
visualIds: ["wf-axi-write-channels", "wf-axi-read-channels"]
exerciseIds: []
glossaryTerms: ["Write Address Channel (AW)", "Write Data Channel (W)", "Write Response Channel (B)", "Read Address Channel (AR)", "Read Data Channel (R)", "Handshake"]
checklistIds: []
---

To master AXI, you must completely abandon the AHB "shared bus" mental model. 

In AHB, you request the bus, put an address on the wires, wait a cycle, and put data on the wires. It is a strictly sequential process happening on a shared set of physical wires.

AXI is different. AXI is composed of **five independent, unidirectional channels**. Think of them as five completely separate pipes connecting the master to the slave. Each pipe only flows in one direction, and each pipe has its own flow control.

## The Five Channels

1.  **Write Address Channel (AW):** Master -> Slave. The master uses this pipe to say, "I want to write data to address X."
2.  **Write Data Channel (W):** Master -> Slave. The master uses this pipe to send the actual data.
3.  **Write Response Channel (B):** Slave -> Master. The slave uses this pipe to say, "I successfully received and stored the write data."
4.  **Read Address Channel (AR):** Master -> Slave. The master uses this pipe to say, "I want to read data from address Y."
5.  **Read Data Channel (R):** Slave -> Master. The slave uses this pipe to return the requested data, along with a success/error status.

*Note: There is no "Read Response" channel. The read response status is sent backward alongside the read data on the R channel.*

## Concurrency and Independence

Because these are five physical, separate pipes, they can all be active at the exact same time.

A master can be issuing a new write address (AW channel) while simultaneously sending data for a *previous* write (W channel), while simultaneously receiving a response for an even *older* write (B channel). And it can be doing read operations on the AR and R channels concurrently with all of that.

### Visualizing the Write Channels

Look at this timeline of a write transaction. Notice how the Address, Data, and Response channels operate asynchronously relative to each other. The data can even start transferring in the exact same cycle the address is accepted!

![wf-axi-write-channels](visual:wf-axi-write-channels)

### Visualizing the Read Channels

The read transaction is simpler, but the independence remains. The Read Address is sent, and the slave eventually returns the data on the Read Data channel.

![wf-axi-read-channels](visual:wf-axi-read-channels)

This independent channel architecture allows for massive pipelining and out-of-order completion, which we will explore in depth in Section D. First, we need to learn the specific signals that live inside each of these five pipes.
