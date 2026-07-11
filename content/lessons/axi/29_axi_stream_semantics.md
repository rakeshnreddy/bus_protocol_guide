---
id: "29_axi_stream_semantics"
title: "AXI-Stream Packet Semantics"
summary: "A radically different protocol for raw, address-less data."
protocol: "axi"
tier: "1"
level: "intermediate"
order: 29
tags: ["axi", "axi-stream", "video", "networking"]
relatedLessons:
  - 02_axi_variants
prerequisites: ["04_five_channel_model"]
visualIds: ["wf-axi-stream"]
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

Full AXI and AXI4-Lite are *memory-mapped* protocols. This means every piece of data has an address. You write data *to* an address, or read data *from* an address.

But what if you are building a video processing pipeline? A camera sensor is just blasting out a continuous stream of pixels. The pixels don't have "addresses"; they are just a flow of data. Routing this data through an address-based protocol is terribly inefficient.

Enter **AXI-Stream (AXI4-Stream)**.

## Structural Differences

AXI-Stream is fundamentally different from memory-mapped AXI. 
*   **No Addresses:** There is no AW or AR channel.
*   **No Responses:** There is no B channel. (If a pixel gets dropped, you don't stall the pipeline to return an error; you just move on).
*   **One Channel Only:** AXI-Stream consists of a single, unidirectional channel going from a Master (the source) to a Slave (the destination).

## The Core Signals

AXI-Stream relies entirely on the universal `VALID`/`READY` handshake you already know.

*   **`TVALID`:** Master has data.
*   **`TREADY`:** Slave can accept data.
*   **`TDATA`:** The payload (e.g., the video pixel or the network packet payload).
*   **`TLAST`:** Indicates the boundary of a packet or frame. 

![wf-axi-stream](visual:wf-axi-stream)

## Sidebands and Packets

Because there are no addresses, AXI-Stream uses unique sideband signals to route and organize data:
*   **`TDEST` (Destination):** A routing ID to tell an interconnect where this packet should go (e.g., "Route this video frame to the display controller").
*   **`TID` (Stream ID):** Identifies interleaved streams (e.g., "This pixel is from Camera 1, the next pixel is from Camera 2").
*   **`TUSER`:** A catch-all signal for custom user data (e.g., "This bit marks the start of a new video frame").

AXI-Stream is the backbone of almost all high-speed DSP, video, and networking designs on modern FPGAs and SoCs.
