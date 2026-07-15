---
id: "05_write_address_channel"
title: "The Write Address Channel (AW)"
summary: "The signals used to initiate a write transaction."
protocol: "axi"
tier: "1"
level: "intermediate"
order: 5
tags: ["axi", "signals", "write"]
relatedLessons: ["08_read_address_channel"]
prerequisites: ["04_five_channel_model"]
visualIds: ["sig-axi-address-channels"]
exerciseIds: []
glossaryTerms: ["AWADDR", "AWLEN", "AWSIZE", "AWBURST", "AWLOCK", "AWCACHE", "AWPROT", "AWQOS", "AWREGION", "AWID", "AWVALID", "AWREADY"]
checklistIds: []
---

The Write Address (AW) channel is how an AXI master initiates a write transaction. The master drives all the control signals that define *what* it wants to write and *how* it wants to write it. The slave simply accepts the request.

All signals on this channel begin with the prefix `AW`.

## Handshake Signals

Like every AXI channel, the AW channel is governed by a two-way handshake:
*   **`AWVALID`** (Master -> Slave): The master drives this HIGH when it has placed a valid address and valid control signals on the bus. It must remain HIGH until the slave accepts it.
*   **`AWREADY`** (Slave -> Master): The slave drives this HIGH when it is ready to accept a new write address. 

The transaction is officially initiated on the rising clock edge where *both* `AWVALID` and `AWREADY` are HIGH.

## Core Address Signals

*   **`AWADDR`** (Write Address): The starting physical memory address for the write burst. 
*   **`AWLEN`** (Write Burst Length): Defines how many data beats are in the burst. In AXI4, this is an 8-bit signal allowing 1–256 beats for `INCR`; `FIXED` and `WRAP` remain limited to 16 (`AWLEN` = Number of beats - 1. So `AWLEN=0` means 1 beat).
*   **`AWSIZE`** (Write Burst Size): Defines the number of bytes transferred in *each* data beat. Encoded as a power of 2 (e.g., 0b010 = 4 bytes, 0b011 = 8 bytes).
*   **`AWBURST`** (Write Burst Type): Defines how the address advances during the burst (FIXED, INCR, or WRAP).
*   **`AWID`** (Write Address ID): An identification tag for the transaction. This is crucial for out-of-order execution, which we will cover deeply later.

Use the address-channel explorer to inspect the AW handshake and every core transaction-definition signal. Each entry includes its accepting edge and a verification failure pattern; the AR equivalents are included for direct comparison.

![Interactive AXI4 AW and AR address-channel signal reference with sampling and DV checks](visual:sig-axi-address-channels)

## Sideband and Attribute Signals

The AW channel carries several sideband signals that provide extra context to the interconnect and the slave. We will dedicate an entire lesson to these later, but here is a brief overview:

*   **`AWLOCK`**: Marks an exclusive access in AXI4. AXI3 also encoded locked accesses, which AXI4 removed.
*   **`AWCACHE`**: Defines memory type (cacheable, bufferable, etc.). Crucial for system-level caches.
*   **`AWPROT`**: Defines access permissions (secure/non-secure, privileged, instruction/data).
*   **`AWQOS`**: (AXI4 only) Quality of Service identifier that can inform an implementation-defined traffic policy.
*   **`AWREGION`**: (AXI4 only) Optional logical region identifier for multiple regions behind one slave interface.

**Senior DV Tip:** When verifying the AW channel, ensure that `AWVALID` does not glitch (it cannot fall once asserted until `AWREADY` is seen). Also, ensure that none of the control signals (`AWADDR`, `AWLEN`, etc.) change their value while waiting for `AWREADY`.
