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
visualIds: ["tl-axi-burst-address-progression"]
exerciseIds: []
glossaryTerms: ["Burst", "Beat"]
checklistIds: []
---

In AXI, you do not provide an address for every piece of data you want to read or write. You provide a *start* address on the AW/AR channel, and you tell the slave exactly how many pieces of data will follow (using `AWLEN`/`ARLEN`), how big each piece is (`AWSIZE`/`ARSIZE`), and how the address should increment internally (`AWBURST`/`ARBURST`).

Components receiving or routing the burst derive the transfer address for each beat from that single address/control request.

## The Burst Control Signals

1.  **Length (`AxLEN`):** Specifies the number of data transfers (beats). 
    *   In AXI3, `AxLEN` is 4 bits (1 to 16 beats).
    *   In AXI4, `AxLEN` is 8 bits (1 to 256 beats for INCR bursts; FIXED is 1–16; WRAP is exactly 2, 4, 8, or 16).
    *   *Formula: Exact number of beats = AxLEN + 1.* So a value of 0 means 1 beat.

2.  **Size (`AxSIZE`):** Specifies the maximum number of bytes transferred in *each* beat.
    *   Encoded as a power of 2. `0b000` = 1 byte, `0b001` = 2 bytes, `0b010` = 4 bytes, `0b011` = 8 bytes, etc.
    *   The `AxSIZE` cannot exceed the physical width of the data bus.

3.  **Type (`AxBURST`):** Defines the address sequence.
    *   **FIXED (0b00):** Every beat in the burst targets the exact same address. Used for loading/emptying FIFOs.
    *   **INCR (0b01):** The address increments by `AxSIZE` bytes for each beat. Used for normal sequential memory access.
    *   **WRAP (0b10):** Similar to INCR, but if the address reaches an upper boundary, it wraps back around to a lower boundary. Used primarily by processors fetching cache lines.
    *   **Reserved (0b11):** Illegal for AXI bursts.

Inspect the three four-beat lanes below. They use the same `AxLEN` and `AxSIZE`, so only `AxBURST` changes the generated address sequence.

![FIXED, INCR, and WRAP four-beat AXI4 address sequences using four bytes per beat](visual:tl-axi-burst-address-progression)

### Example: A 4-Beat INCR Burst

Suppose a master initiates a write to a 32-bit (4 byte) memory region:
*   `AWADDR` = 0x1000
*   `AWLEN` = 3 (meaning 4 total beats)
*   `AWSIZE` = 0b010 (meaning 4 bytes per beat)
*   `AWBURST` = INCR

The master sends this address on the AW channel *once*. Then, on the W channel, it sends 4 beats of data. The receiving components derive the transfer addresses as follows:
*   Beat 1: Written to 0x1000
*   Beat 2: Written to 0x1004 (0x1000 + 4 bytes)
*   Beat 3: Written to 0x1008
*   Beat 4: Written to 0x100C

Let `N = AxLEN + 1` and `B = 2^AxSIZE`. FIXED uses the same byte address for every beat. INCR derives later addresses from `floor(start/B)×B + n×B` after the unaligned first transfer. WRAP uses `wrapBytes=N×B`, `lower=floor(start/wrapBytes)×wrapBytes`, and wraps each increment within `[lower, lower+wrapBytes)`. WRAP starts must be B-byte aligned. Every AXI burst must remain within one 4 KB region.
