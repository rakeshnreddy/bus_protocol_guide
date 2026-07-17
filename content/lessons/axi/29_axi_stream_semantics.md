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
*   **No memory-mapped response channel:** There is no B or R response channel. This does **not** mean a destination silently drops a beat: when `TREADY` is LOW, the source holds `TVALID` and the payload stable until transfer.
*   **One Channel Only:** AXI-Stream consists of a single, unidirectional channel going from a Master (the source) to a Slave (the destination).

## The Core Signals

AXI-Stream relies entirely on the universal `VALID`/`READY` handshake you already know.

*   **`TVALID`:** Master has data.
*   **`TREADY`:** Slave can accept data.
*   **`TDATA`:** The payload (e.g., the video pixel or the network packet payload).
*   **`TLAST`:** Indicates the boundary of a packet or frame.
*   **`TKEEP` (optional):** Marks which byte positions must be transported, especially on a partial final beat.
*   **`TSTRB` (optional):** Distinguishes data bytes from position bytes within the byte positions enabled by `TKEEP`.

For each byte lane, `TKEEP=1, TSTRB=1` identifies a data byte, while `TKEEP=1, TSTRB=0` identifies a position byte whose location is meaningful but whose data value is not. `TKEEP=0, TSTRB=0` identifies a null byte; `TKEEP=0, TSTRB=1` is reserved. If `TSTRB` is absent, it defaults to the value of `TKEEP`. If both signals are absent, both default HIGH so every lane carries a data byte.

![Three-beat AXI4-Stream packet holding TDATA, TKEEP, TSTRB, TLAST, TID, and TDEST stable during backpressure, with a position byte on the final beat](visual:wf-axi-stream)

## Sidebands and Packets

Because there are no addresses, AXI-Stream uses unique sideband signals to route and organize data:
*   **`TDEST` (Destination):** A routing ID to tell an interconnect where this packet should go (e.g., "Route this video frame to the display controller").
*   **`TID` (Stream ID):** Identifies interleaved streams (e.g., "This pixel is from Camera 1, the next pixel is from Camera 2").
*   **`TUSER`:** A catch-all signal for custom user data (e.g., "This bit marks the start of a new video frame").

AXI-Stream is the backbone of almost all high-speed DSP, video, and networking designs on modern FPGAs and SoCs.
