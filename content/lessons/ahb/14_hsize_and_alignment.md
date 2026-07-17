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

All encodings are defined: `000` 1 byte, `001` 2 bytes, `010` 4 bytes, `011` 8 bytes, `100` 16 bytes, `101` 32 bytes, `110` 64 bytes, and `111` 128 bytes. An encoding is legal on an interface only when that transfer size does not exceed the configured data-bus width.

## The Golden Rule of Alignment

**All transfers must be aligned to the address boundary of the transfer size.**

- If `HSIZE` is Byte (1 byte), any address is valid.
- If `HSIZE` is Halfword (2 bytes), the address must end in `0x0`, `0x2`, `0x4`, `0x6`, `0x8`, `0xA`, `0xC`, or `0xE`.
- If `HSIZE` is Word (4 bytes), the address must end in `0x0`, `0x4`, `0x8`, or `0xC`.
- If `HSIZE` is Doubleword (8 bytes), the address must end in `0x0` or `0x8`.

## Driving the Right Byte Lanes

When a manager issues a byte-sized transfer on a wider interface, which `HWDATA` lanes carry the byte? The active lanes follow the address, transfer size, data width, and endianness.

For a 32-bit (4-byte) bus in a little-endian system:
- A Byte write to `0x00` is driven on `HWDATA[7:0]`
- A Byte write to `0x01` is driven on `HWDATA[15:8]`
- A Byte write to `0x02` is driven on `HWDATA[23:16]`
- A Byte write to `0x03` is driven on `HWDATA[31:24]`

For a Halfword (2-byte) write:
- A Halfword write to `0x00` is driven on `HWDATA[15:0]`
- A Halfword write to `0x02` is driven on `HWDATA[31:16]`

The mappings above are specifically a **32-bit little-endian example**. Only the active byte lanes are meaningful for the transfer; inactive lanes are not part of the payload. Replicating a byte across inactive lanes can be an implementation choice, but AHB does not require it. The subordinate uses the accepted address/size context for the current data phase to select the active lanes.

The waveform below keeps address and data ownership separate: each `HWDATA` value belongs to the address accepted one cycle earlier. Select the examples to connect alignment, lane selection, and the misaligned halfword violation.

![Aligned byte, halfword, and word transfers mapped onto natural lanes of a 32-bit AHB write-data bus](visual:wf-ahb-hsize-byte-lanes)

A misaligned or over-width transfer is deliberate invalid stimulus. A checker should flag the first accepting edge. The selected protocol does not define a universal “BLOCK the data phase” recovery sequence for such illegal manager behavior; downstream behavior is outside the legal protocol contract and must be handled by the verification plan rather than invented as a protocol rule.
