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
visualIds: []
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

Address alignment rules in AXI are crucial for ensuring that data is placed onto the correct byte lanes of the data bus.

## Size vs. Bus Width

First, it is important to distinguish between the physical width of the data bus and the size of the transfer.
*   The physical bus width (e.g., a 64-bit `WDATA` bus) is fixed in hardware.
*   The transfer size (`AxSIZE`) is determined dynamically by the master for each transaction (e.g., 1 byte, 2 bytes, 4 bytes, up to the maximum bus width).

## The Aligned Address Rule

In AXI, it is strongly recommended that the starting address of a burst is aligned to the size of the transfer (`AxSIZE`).
*   If `AxSIZE` is 4 bytes (32-bit), the address should be a multiple of 4 (e.g., 0x0, 0x4, 0x8, 0xC).
*   If `AxSIZE` is 8 bytes (64-bit), the address should be a multiple of 8 (e.g., 0x0, 0x8, 0x10, 0x18).

For WRAP bursts, alignment to `AxSIZE` is strictly mandatory.

## Unaligned Transfers

AXI *does* support unaligned start addresses for INCR and FIXED bursts.

If a master requests a 4-byte transfer starting at address `0x1` (which is unaligned), the master is responsible for placing the data on the correct byte lanes of the data bus as if the address *were* aligned, but using the `WSTRB` (Write Strobe) signals to mask out the invalid bytes.

For example, on a 32-bit bus:
*   An aligned write to `0x0` with 4 bytes: `WSTRB = 0b1111` (all 4 bytes valid).
*   An unaligned write to `0x1` with 3 bytes (to stay within the 32-bit word): `WSTRB = 0b1110` (bytes 1, 2, and 3 valid; byte 0 invalid).

In an unaligned INCR burst, only the *first* beat is unaligned. The AXI slave will automatically adjust the address for the *second* beat so that it is perfectly aligned to the `AxSIZE` boundary, and all subsequent beats in the burst will be aligned.

Because unaligned transfers require complex byte-lane shifting and strobe management in both the master and slave, many simple AXI peripherals do not support them and will return an error (`SLVERR`) if they receive an unaligned address. It is best practice to always issue aligned addresses when possible.
