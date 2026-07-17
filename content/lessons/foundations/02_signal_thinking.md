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

The AMBA interfaces taught here are synchronous rising-edge interfaces within one interface clock domain: AHB uses `HCLK`, and memory-mapped AXI uses `ACLK`. A clock toggles between LOW (0) and HIGH (1); the LOW-to-HIGH transition is the **rising edge** at which protocol transfers are recognized. This is a statement about these interfaces, not a rule for every communication protocol.

## Active-High vs Active-Low

By default, we assume a signal is **Active-High**: if the wire is HIGH (1), the signal is asserted (true). If it is LOW (0), the signal is de-asserted (false).

However, some signals (like resets) are **[glossary:Active-Low]**. This means LOW (0) is the asserted state and HIGH (1) is the deasserted state. Active-low signals are often denoted with an `n` suffix, including AHB `HRESETn` and AXI `ARESETn`; project-local `_b` suffixes are also common conventions.

## Sampling and the Valid Window

When a receiving register samples a wire on a clock edge, that wire must satisfy the implementation's input timing constraints.

To guarantee this, the signal must be stable for a tiny amount of time *before* the clock edge (the **Setup Time**) and remain stable for a tiny amount of time *after* the clock edge (the **Hold Time**).

![wf-signal-sampling](visual:wf-signal-sampling)

The period during which the signal is stable and trusted is called the **[glossary:Valid Window]**. A setup or hold violation can drive the receiving register into physical **metastability**, an analog state whose resolution time and final value are uncertain. RTL simulation does not model that analog behavior faithfully: it might show a deterministic 0/1 or propagate an `X`, depending on the model. Treat an `X` as simulation evidence of unknown state, not as a picture of an analog voltage.

As a DV engineer, identify the protocol sampling edge, but do not ignore behavior between edges. Mid-cycle propagation determines the value that reaches the next edge; glitches can be consumed by unsafe latches or clock gates; combinational feedback can prevent timing closure; and a signal crossing into another clock domain needs a CDC structure rather than ordinary same-clock sampling assumptions.

## Four-State Simulation and Race-Free Sampling

RTL signals can hold `0`, `1`, unknown `X`, or high-impedance `Z`. Controls that participate in an accepted transfer should be known at the accepting edge, and reset-X propagation should be checked explicitly. A monitor should sample through a clocking block or an equivalent race-free observation region, after nonblocking assignments settle, rather than racing the DUT in the active event region.

For AXI, a useful parameterized safety template is `VALID && !READY |=> VALID && $stable(payload)`. A separate known-control check can use `!$isunknown({VALID, READY, payload_control})` at an accepting edge. Reset-release checks must be written for the selected interface and implementation contract; an active-low name alone does not define a universal release policy.
