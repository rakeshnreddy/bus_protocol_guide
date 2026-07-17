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
- **Rule:** Components sample AHB inputs on the rising edge of `HCLK`; output changes occur after a rising edge. Protocol stability is evaluated between sampled rising-edge values during an extended transfer.
- **Between edges:** IHI 0033B.b makes glitch-free behavior implementation-defined unless the interface declares `Stable_Between_Clock=True`. A falling-edge or mid-cycle transition is therefore not automatically an AHB protocol violation. It is still a timing, CDC, latch/clock-gate, or integration concern if downstream logic consumes it unsafely.

## HRESETn (The Reset Signal)

**[glossary:HRESETn]** is the system reset.
- **Driver:** The system reset controller.
- **Rule 1 (Active Low):** The `n` at the end of the name means it is active-low. When HRESETn is `0`, the system is in reset. When it is `1`, the system is running normally.
- **Rule 2 (Asynchronous Assertion):** The reset can be asserted (driven to 0) asynchronously, meaning it does not have to wait for a clock edge.
- **Rule 3 (Synchronous De-assertion):** `HRESETn` is deasserted synchronously after a rising edge of `HCLK`.

## The Reset Sequence

Each component defines the minimum number of asserted reset cycles needed to initialize its interface. During reset, managers keep address/control at valid levels with `HTRANS=IDLE`; subordinates drive `HREADYOUT` HIGH. Other signals follow their signal-specific reset requirements or implementation contract—there is no universal “drive every output to zero” rule.

![AHB reset assertion, safe IDLE state, synchronous release, and first legal transfer](visual:wf-ahb-reset)

The waveform illustrates one conservative restart. The protocol does not require every implementation to insert a complete extra IDLE cycle after release. Judge the first post-reset transfer at legal `HCLK` sampling edges after the component's reset-duration and release requirements are satisfied.
