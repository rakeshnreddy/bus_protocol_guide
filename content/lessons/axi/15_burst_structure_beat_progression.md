---
id: "15_burst_structure_beat_progression"
title: "Burst Structure and Beat Progression"
summary: "How a single address spawns a sequence of data transfers."
protocol: "axi"
tier: "1"
level: "intermediate"
order: 15
tags: ["axi", "burst", "data"]
relatedLessons: ["16_wlast_and_rlast_meaning"]
prerequisites: ["05_write_address_channel"]
visualIds: []
exerciseIds: []
glossaryTerms: ["Burst", "Beat"]
checklistIds: []
---

In AXI, you do not provide an address for every piece of data you want to read or write. You provide a *start* address on the AW/AR channel, and you tell the slave exactly how many pieces of data will follow (using `AWLEN`/`ARLEN`), how big each piece is (`AWSIZE`/`ARSIZE`), and how the address should increment internally (`AWBURST`/`ARBURST`).

The slave is then responsible for calculating the physical memory address for each individual beat of the burst internally.

## The Burst Control Signals

1.  **Length (`AxLEN`):** Specifies the number of data transfers (beats). 
    *   In AXI3, `AxLEN` is 4 bits (1 to 16 beats).
    *   In AXI4, `AxLEN` is 8 bits (1 to 256 beats for INCR bursts; WRAP bursts are still limited to 16).
    *   *Formula: Exact number of beats = AxLEN + 1.* So a value of 0 means 1 beat.

2.  **Size (`AxSIZE`):** Specifies the maximum number of bytes transferred in *each* beat.
    *   Encoded as a power of 2. `0b000` = 1 byte, `0b001` = 2 bytes, `0b010` = 4 bytes, `0b011` = 8 bytes, etc.
    *   The `AxSIZE` cannot exceed the physical width of the data bus.

3.  **Type (`AxBURST`):** Defines the address sequence.
    *   **FIXED (0b00):** Every beat in the burst targets the exact same address. Used for loading/emptying FIFOs.
    *   **INCR (0b01):** The address increments by `AxSIZE` bytes for each beat. Used for normal sequential memory access.
    *   **WRAP (0b10):** Similar to INCR, but if the address reaches an upper boundary, it wraps back around to a lower boundary. Used primarily by processors fetching cache lines.

### Example: A 4-Beat INCR Burst

Suppose a master initiates a write to a 32-bit (4 byte) memory region:
*   `AWADDR` = 0x1000
*   `AWLEN` = 3 (meaning 4 total beats)
*   `AWSIZE` = 0b010 (meaning 4 bytes per beat)
*   `AWBURST` = INCR

The master sends this address on the AW channel *once*. Then, on the W channel, it sends 4 beats of data. The slave calculates the target addresses internally as follows:
*   Beat 1: Written to 0x1000
*   Beat 2: Written to 0x1004 (0x1000 + 4 bytes)
*   Beat 3: Written to 0x1008
*   Beat 4: Written to 0x100C
