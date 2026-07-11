---
id: "02_signal_thinking"
title: "Signal Thinking"
summary: "Learn how to read signals: clock edges, active-low conventions, sampling, setup/hold times, and valid windows."
protocol: "foundations"
tier: "0"
level: "beginner"
order: 2
tags: ["signals", "clocks", "sampling", "basics"]
visualIds: ["wf-signal-sampling"]
exerciseIds: ["ex-signal-thinking"]
glossaryTerms: ["Active-Low", "Valid Window"]
---

Once you understand what a bus is, you must understand how to look at its wires. Protocols are defined by exactly *when* signals change and *when* they are read.

## Clocks and Edges

Bus protocols are almost entirely **synchronous**. This means all actions are synchronized to a master clock signal (`CLK` or `ACLK`).
A clock toggles continuously between LOW (0) and HIGH (1). The moment it transitions from LOW to HIGH is the **Rising Edge**. Almost all modern protocols sample data exactly on the rising edge of the clock.

## Active-High vs Active-Low

By default, we assume a signal is **Active-High**: if the wire is HIGH (1), the signal is asserted (true). If it is LOW (0), the signal is de-asserted (false).

However, some signals (like Resets) are traditionally **[glossary:Active-Low]**. This means a LOW (0) voltage means "YES, RESET IS HAPPENING!" and a HIGH (1) voltage means "NO, DO NOT RESET."
Active-low signals are usually denoted with an `n` suffix (e.g., `RESETn` or `ARESETn`) or a `_b` suffix (e.g., `RST_B`).

## Sampling and the Valid Window

When a chip reads a wire on a clock edge, that wire must have a stable voltage. It cannot be halfway between 0 and 1! 

To guarantee this, the signal must be stable for a tiny amount of time *before* the clock edge (the **Setup Time**) and remain stable for a tiny amount of time *after* the clock edge (the **Hold Time**).

![wf-signal-sampling](visual:wf-signal-sampling)

The period during which the signal is stable and trusted is called the **[glossary:Valid Window]**. If a signal changes *during* the setup or hold time, the receiving register might capture garbage (a condition known as metastability). 

As a DV engineer, you must always look at the waveform *at the clock edge* to know what value the hardware actually saw. What the signal does in between clock edges generally does not matter to synchronous logic.
