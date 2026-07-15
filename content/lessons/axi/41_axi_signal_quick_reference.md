---
id: "41_axi_signal_quick_reference"
tier: "3"
level: "advanced"
protocol: "axi"
title: "AXI Signal Quick Reference"
section: "H"
order: 41
exerciseIds: []
summary: "A quick reference guide to AXI signals and their roles."
tags:
  - axi
  - signals
  - review
prerequisites: []
relatedLessons: []
visualIds: ["axi-signal-ref"]
glossaryTerms: []
checklistIds: []
---

# AXI Signal Quick Reference

This is your day-to-day AXI4 memory-mapped cheat sheet. It groups the global signals and all five channel payloads, including optional region and user-defined fields, and calls out AXI4-specific behavior where AXI3 differs.

![Interactive AXI4 memory-mapped signal reference grouped by channel with ownership, sampling, encodings, and DV watchpoints](visual:axi-signal-ref)

## Key Reminders
- **AW / AR Channels:** Send the address *once* per burst.
- **W Channel:** Send the data `AWLEN + 1` times. Assert `WLAST` on the final beat.
- **B Channel:** Receive one response per write burst. In AXI4, the subordinate can assert `BVALID` only after accepting the AW request and the final W transfer.
- **R Channel:** Receive data and a per-beat response `ARLEN + 1` times. The subordinate asserts `RLAST` on the final transfer.
