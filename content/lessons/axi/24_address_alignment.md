---
id: "24_address_alignment"
title: "Address Alignment"
summary: "Rules for aligning addresses to transfer sizes and data bus widths."
protocol: "axi"
tier: "1"
level: "intermediate"
order: 24
tags: ["axi", "rules", "alignment"]
relatedLessons: ["25_4kb_boundary_rule"]
prerequisites: ["23_burst_types"]
visualIds: ["wf-axi-alignment-byte-lanes"]
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

Address alignment rules in AXI are crucial for ensuring that data is placed onto the correct byte lanes of the data bus.

## Size vs. Bus Width

First, it is important to distinguish between the physical width of the data bus and the size of the transfer.
*   The physical bus width (e.g., a 64-bit `WDATA` bus) is fixed in hardware.
*   The transfer size (`AxSIZE`) is determined dynamically by the master for each transaction (e.g., 1 byte, 2 bytes, 4 bytes, up to the maximum bus width).

## Aligned Addresses

Transfer-size alignment is the simplest and most common case: the starting byte address is a multiple of `2^AxSIZE`.
*   If `AxSIZE` is 4 bytes (32-bit), the address should be a multiple of 4 (e.g., 0x0, 0x4, 0x8, 0xC).
*   If `AxSIZE` is 8 bytes (64-bit), the address should be a multiple of 8 (e.g., 0x0, 0x8, 0x10, 0x18).

For WRAP bursts, alignment to `AxSIZE` is strictly mandatory.

## Unaligned Transfers

AXI *does* support unaligned start addresses. WRAP is the important exception: its start address must be aligned to the size of each transfer.

For an unaligned transfer, a master can use the low address bits to signal the unaligned start, or present an aligned address and use byte-lane strobes. The address information and write strobes must describe a consistent byte selection.

For example, on a 32-bit bus:
*   An aligned write to `0x0` with 4 bytes: `WSTRB = 0b1111` (all 4 bytes valid).
*   The first transfer of an unaligned 4-byte INCR burst starting at `0x1`: `WSTRB = 0b1110` on that 32-bit word (bytes 1, 2, and 3 valid; byte 0 invalid).

Use the snapshots below to answer: **which byte lanes belong to the unaligned first transfer, and why does the next INCR beat start at an aligned address?**

![Aligned and unaligned AXI4 writes showing derived beat addresses and active WSTRB byte lanes](visual:wf-axi-alignment-byte-lanes)

In an unaligned INCR burst, only the *first* transfer uses the unaligned start. The subsequent transfer address is derived from the aligned address plus `2^AxSIZE`; the slave computes these beat addresses from the accepted burst controls because AXI transmits only the start address.

For each write beat, asserted `WSTRB` bits must stay within the legal byte-lane mask derived from `AxADDR`, `AxSIZE`, the bus width, and the burst progression. Sparse subsets—including all-zero strobes—can be legal, but a strobe outside that beat's lane mask is not. Reads have no `RSTRB`; the receiver scores only the requested lanes and treats inactive lanes as outside the transfer.

Unaligned transfers add byte-lane and strobe cases to design and verification. A component can document a narrower supported transaction subset and use handshaking, conversion, or error behavior as specified by its interface contract; AXI legality does not require every endpoint to implement every optional capability. A monitor must distinguish protocol-illegal stimulus from a legal request that the configured target does not support.
