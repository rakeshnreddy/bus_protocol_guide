---
id: "36_ahb_signal_reference"
title: "AHB Signal Quick Reference"
summary: "A dense, version-aware reference for the core AHB signals used throughout this curriculum."
protocol: "ahb"
tier: "1"
level: "expert"
order: 36
tags: ["ahb", "review", "signals"]
relatedLessons: []
prerequisites: ["35_ahb_expert_checklist"]
visualIds: ["sig-ahb-full"]
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

Use this interactive reference to recall the source, timing phase, revision scope, and DV watchpoint for the core and version-specific AHB signals covered in this track.

If you need a refresher on a specific signal, click the glossary expansion icon or revisit the early foundation lessons.

![Version-aware AHB signal explorer covering core master/slave signals, original arbitration, and optional AHB5 capabilities](visual:sig-ahb-full)

## Exact Core Encodings

- `HTRANS[1:0]`: `00 IDLE`, `01 BUSY`, `10 NONSEQ`, `11 SEQ`.
- `HBURST[2:0]`: `000 SINGLE`, `001 INCR`, `010 WRAP4`, `011 INCR4`, `100 WRAP8`, `101 INCR8`, `110 WRAP16`, `111 INCR16`.
- `HSIZE[2:0]`: `000` through `111` encode 1, 2, 4, 8, 16, 32, 64, and 128 bytes; an encoding is legal only when it does not exceed the implemented data width.
- Base `HPROT[3:0]`: bit 0 is `1 data / 0 instruction`, bit 1 is `1 privileged / 0 unprivileged`, bit 2 is `1 bufferable / 0 non-bufferable`, and Issue B bit 3 is `1 modifiable / 0 non-modifiable` (the earlier base name was cacheable). With `Extended_Memory_Types`, bits 4, 5, and 6 are Lookup, Allocate, and Shareable.

## Response, Selection, and Identity Timing

An AHB-Lite/AHB5 ERROR has ERROR1 (`HRESP=ERROR`, owning subordinate `HREADYOUT=LOW`) and ERROR2 (`HRESP=ERROR`, `HREADYOUT=HIGH`). Completion occurs only in ERROR2 through global `HREADY`; ERROR1 has not completed the transfer. A combinational `HSEL` decoder is a common implementation pattern, not a universal requirement. Valid subordinate acceptance is `HSEL && HREADY && HTRANS[1]`, and the response mux follows the saved data-phase owner.

Original AHB uses arbiter-generated `HMASTER[3:0]`. With the optional AHB5 exclusive property, the B.b signal table lists manager-side `HMASTER[3:0]`, while §8.3 defines configured `HMASTER[m:0]`, manager/thread identity, and interconnect-added identity for uniqueness.

## Exclusive Restrictions

An exclusive transfer is a single data transfer, uses `SINGLE` or `INCR`, contains no BUSY, is size-aligned, and uses attributes that keep the monitor in the path. Matching read/write members use the same `HADDR`, `HSIZE`, `HPROT`, `HBURST`, `HMASTER`, and `HNONSEC` when present. A manager cannot have two exclusive transfers with the same `HMASTER` outstanding at once. `HEXOKAY` is asserted only with `HREADY` and never with `HRESP=ERROR`; a failed exclusive write does not update memory.
