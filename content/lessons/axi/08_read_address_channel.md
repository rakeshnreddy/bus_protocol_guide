---
id: "08_read_address_channel"
title: "The Read Address Channel (AR)"
summary: "The signals used to initiate a read transaction."
protocol: "axi"
tier: "1"
level: "intermediate"
order: 8
tags: ["axi", "signals", "read"]
relatedLessons: ["05_write_address_channel"]
prerequisites: ["04_five_channel_model"]
visualIds: []
exerciseIds: []
glossaryTerms: ["ARADDR", "ARLEN", "ARSIZE", "ARBURST", "ARLOCK", "ARCACHE", "ARPROT", "ARQOS", "ARREGION", "ARID", "ARVALID", "ARREADY"]
checklistIds: []
---

The Read Address (AR) channel is how an AXI master initiates a read transaction. 

Structurally, the AR channel is a perfect mirror of the AW (Write Address) channel. The signals have the exact same widths, encodings, and purposes; the only difference is the `AR` prefix instead of `AW`.

## Handshake Signals

*   **`ARVALID`** (Master -> Slave): HIGH when a valid read address and control signals are on the bus.
*   **`ARREADY`** (Slave -> Master): HIGH when the slave is ready to accept a new read address.

## Core Address Signals

*   **`ARADDR`** (Read Address): The starting memory address for the read burst.
*   **`ARLEN`** (Read Burst Length): Number of beats in the burst - 1 (up to 256 beats in AXI4).
*   **`ARSIZE`** (Read Burst Size): Number of bytes transferred in each data beat.
*   **`ARBURST`** (Read Burst Type): FIXED, INCR, or WRAP.
*   **`ARID`** (Read Address ID): The identification tag for the read transaction.

## Sideband and Attribute Signals

Just like the write side, the AR channel carries sidebands: `ARLOCK`, `ARCACHE`, `ARPROT`, `ARQOS`, and `ARREGION`.

**Why the symmetry?** 
Because reads and writes have completely independent physical channels, a master can issue a read to Address X while simultaneously issuing a write to Address Y. The interconnect requires identical control information to route and authorize both transactions independently.
