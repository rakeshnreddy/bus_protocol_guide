---
id: "04_clock_and_reset"
title: "Clock and Reset (HCLK, HRESETn)"
summary: "The foundational timing and initialization signals for any AHB system."
protocol: "ahb"
tier: "1"
level: "beginner"
order: 4
tags: ["ahb", "signals", "clock", "reset"]
relatedLessons: []
prerequisites: ["02_signal_thinking"]
visualIds: ["wf-ahb-reset"]
exerciseIds: []
glossaryTerms: ["HCLK", "HRESETn"]
checklistIds: []
---

Before any data can be transferred, the bus must be properly powered, clocked, and initialized. AHB handles this with two universal signals.

## HCLK (The Bus Clock)

**[glossary:HCLK]** is the master clock for the entire AHB system. 
- **Driver:** The system clock generator.
- **Rule:** Every single signal in the AHB protocol (except HRESETn) is strictly synchronous to the **rising edge** of HCLK.
- **DV Check:** If you see any AHB signal changing exactly *on* the falling edge of HCLK, or changing asynchronously in the middle of a cycle, the RTL violates the protocol.

## HRESETn (The Reset Signal)

**[glossary:HRESETn]** is the system reset.
- **Driver:** The system reset controller.
- **Rule 1 (Active Low):** The `n` at the end of the name means it is active-low. When HRESETn is `0`, the system is in reset. When it is `1`, the system is running normally.
- **Rule 2 (Asynchronous Assertion):** The reset can be asserted (driven to 0) asynchronously, meaning it does not have to wait for a clock edge.
- **Rule 3 (Synchronous De-assertion):** The reset *must* be de-asserted (driven to 1) synchronously to the rising edge of HCLK. This ensures all flip-flops in the design come out of reset cleanly at the exact same time.

## The Reset Sequence

When HRESETn is asserted, all masters and slaves must immediately drive their control signals to benign default values (usually 0, except for specific signals like `HTRANS` which must be driven to `IDLE`).

![wf-ahb-reset](visual:wf-ahb-reset)

*Notice how HRESETn can drop to 0 at any time, but it only rises back to 1 aligned with the rising edge of HCLK. Notice also how the master is forced to drive HTRANS to IDLE while in reset.*
