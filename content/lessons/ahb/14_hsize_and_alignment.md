---
id: "14_hsize_and_alignment"
title: "HSIZE and Alignment"
summary: "Why transfers must be aligned, and how narrower transfers ride on a wider data bus."
protocol: "ahb"
tier: "1"
level: "intermediate"
order: 14
tags: ["ahb", "semantics", "size", "alignment"]
relatedLessons: []
prerequisites: ["07_burst_and_size"]
visualIds: ["wf-ahb-hsize-byte-lanes"]
exerciseIds: []
glossaryTerms: ["HSIZE"]
checklistIds: []
---

In AHB, the size of a transfer (`HSIZE`) and the physical width of the data bus are distinct concepts. A system might have a 32-bit physical `HWDATA` bus, but a master can still issue an 8-bit (`HSIZE` = Byte) transfer. 

## The Golden Rule of Alignment

**All transfers must be aligned to the address boundary of the transfer size.**

- If `HSIZE` is Byte (1 byte), any address is valid.
- If `HSIZE` is Halfword (2 bytes), the address must end in `0x0`, `0x2`, `0x4`, `0x6`, `0x8`, `0xA`, `0xC`, or `0xE`.
- If `HSIZE` is Word (4 bytes), the address must end in `0x0`, `0x4`, `0x8`, or `0xC`.
- If `HSIZE` is Doubleword (8 bytes), the address must end in `0x0` or `0x8`.

## Driving the Right Byte Lanes

When an 8-bit master writes a byte to a 32-bit slave, which of the 32 wires on `HWDATA` actually carry the byte? The AHB protocol dictates that data must be driven on the **natural byte lanes** dictated by the address.

For a 32-bit (4-byte) bus in a little-endian system:
- A Byte write to `0x00` is driven on `HWDATA[7:0]`
- A Byte write to `0x01` is driven on `HWDATA[15:8]`
- A Byte write to `0x02` is driven on `HWDATA[23:16]`
- A Byte write to `0x03` is driven on `HWDATA[31:24]`

For a Halfword (2-byte) write:
- A Halfword write to `0x00` is driven on `HWDATA[15:0]`
- A Halfword write to `0x02` is driven on `HWDATA[31:16]`

A smart master will often just replicate its 8-bit payload across *all* byte lanes (e.g., if writing `0xFF`, it drives `0xFFFFFFFF` on the 32-bit bus). The slave is responsible for looking at `HADDR[1:0]` and `HSIZE` to decide which specific bytes to sample and write into memory.

The waveform below keeps address and data ownership separate: each `HWDATA` value belongs to the address accepted one cycle earlier. Select the examples to connect alignment, lane selection, and the misaligned halfword violation.

![Aligned byte, halfword, and word transfers mapped onto natural lanes of a 32-bit AHB write-data bus](visual:wf-ahb-hsize-byte-lanes)
