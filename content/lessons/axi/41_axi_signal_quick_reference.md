---
id: "41_axi_signal_quick_reference"
tier: "3"
level: "advanced"
protocol: "axi"
title: "AXI Signal Quick Reference"
section: "H"
order: 41
exerciseIds: []
---

# AXI Signal Quick Reference

This is your day-to-day cheat sheet for the AXI interface. It lists every primary signal across all five channels.

<img src="visual:axi-signal-ref" alt="Interactive signal reference table" />

## Key Reminders
- **AW / AR Channels:** Send the address *once* per burst.
- **W Channel:** Send the data `AWLEN + 1` times. Assert `WLAST` on the final beat.
- **B Channel:** Receive the response *once* per write burst (after all data is sent).
- **R Channel:** Receive the data and response `ARLEN + 1` times. Assert `RLAST` on the final beat.
