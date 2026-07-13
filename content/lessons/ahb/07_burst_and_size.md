---
id: "07_burst_and_size"
title: "Burst and Size (HBURST, HSIZE)"
summary: "How the master specifies the volume of data it wants to move, and how that data is grouped."
protocol: "ahb"
tier: "1"
level: "beginner"
order: 7
tags: ["ahb", "signals", "burst", "size"]
relatedLessons: []
prerequisites: ["06_htrans_transfer_types"]
visualIds: ["sig-ahb-burst-size", "wf-ahb-incr4-burst", "wf-ahb-wrap4-burst"]
exerciseIds: []
glossaryTerms: ["HBURST", "HSIZE"]
checklistIds: []
---

While `HTRANS` tells the slave what is happening *right now*, `HBURST` and `HSIZE` tell the slave about the *shape* of the overall transaction.

## HSIZE (Transfer Size)

**[glossary:HSIZE]** is a 3-bit signal that specifies the exact size of the data payload for the current beat.
- **Driver:** Master.
- **Values:**
  - `000`: Byte (8 bits)
  - `001`: Halfword (16 bits)
  - `010`: Word (32 bits)
  - `011`: Doubleword (64 bits)
- **Constraint:** The value of `HSIZE` must not exceed the physical width of the data bus. If you have a 32-bit `HWDATA` bus, you cannot issue an `HSIZE` of Doubleword!
- **Alignment Rule:** As mentioned in the Address lesson, the address on `HADDR` must be aligned to `HSIZE`. 
  - If `HSIZE` is Word (4 bytes), `HADDR` must end in `0x0`, `0x4`, `0x8`, or `0xC`.

## HBURST (Burst Type)

**[glossary:HBURST]** is a 3-bit signal that tells the slave how many beats are in the current sequence, and how their addresses relate to each other.
- **Driver:** Master.
- **Values:**
  - `000`: SINGLE (A single transfer)
  - `001`: INCR (Undefined length incrementing burst)
  - `010` / `011`: WRAP4 / INCR4 (4-beat bursts)
  - `100` / `101`: WRAP8 / INCR8 (8-beat bursts)
  - `110` / `111`: WRAP16 / INCR16 (16-beat bursts)

Use the explorer to connect every HBURST family to accepted beat count, HSIZE-based address increment, alignment, and the wrap-boundary calculation a checker must reproduce.

![Interactive HBURST and HSIZE relationship explorer](visual:sig-ahb-burst-size)

### Incrementing vs Wrapping

- **INCR (Incrementing):** The address simply increments by the `HSIZE` for each beat. If `HSIZE` is 4 bytes, the addresses go: `0x00 -> 0x04 -> 0x08 -> 0x0C`.
- **WRAP (Wrapping):** This is heavily used by CPU cache line fills. If a master requests a WRAP4 burst starting at address `0x04`, the addresses will wrap around at the boundary of the burst size: `0x04 -> 0x08 -> 0x0C -> 0x00`.

These two recovered waveforms use the same four-byte HSIZE but different HBURST rules. Step through the addresses and identify the beat where wrapping changes the otherwise sequential progression.

![Four-beat incrementing AHB burst with word-sized address progression](visual:wf-ahb-incr4-burst)

![Four-beat wrapping AHB burst returning to the start of its wrap boundary](visual:wf-ahb-wrap4-burst)

**DV Check:** Just like `HWRITE` and `HSIZE`, the `HBURST` signal must remain perfectly constant for every beat of a burst! Changing `HBURST` mid-burst is a critical protocol violation.
