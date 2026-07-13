---
id: "31_ahb_functional_coverage"
title: "AHB Functional Coverage"
summary: "Defining the coverage model to prove you have tested every AHB feature."
protocol: "ahb"
tier: "1"
level: "expert"
order: 31
tags: ["ahb", "verification", "coverage"]
relatedLessons: []
prerequisites: ["30_ahb_assertions"]
visualIds: ["cm-ahb-burst-resp"]
exerciseIds: ["ex-ahb-coverage-holes"]
glossaryTerms: ["AHB-Lite", "AHB5"]
checklistIds: []
---

Code coverage (line, toggle, FSM) only tells you what code was executed. **Functional Coverage** tells you what protocol features were actually tested. 

If your constrained-random testbench runs for 10 hours, how do you prove it actually generated a WRAP16 burst that experienced an ERROR response on its 15th beat? You build a coverage model.

## Core Coverage Dimensions

To claim an AHB master or slave is fully verified, your coverage model (typically written in SystemVerilog Covergroups) must cross the following dimensions:

### 1. Transfer Attributes (Cross Coverage)
You must observe every legal combination of:
- **`HBURST`** (SINGLE, INCR, WRAP4, INCR4, WRAP8, INCR8, WRAP16, INCR16)
- **`HSIZE`** (8-bit, 16-bit, 32-bit, 64-bit...)
- **`HWRITE`** (Read, Write)

*Example cross:* A 32-bit WRAP8 Read.

### 2. Wait State Injection
For every burst type, you must cover:
- Zero wait states for the entire burst.
- Wait states on the first beat only.
- Wait states on the last beat only.
- Heavy random wait states across the entire burst.

### 3. Error Injection
Errors must be injected and handled cleanly across:
- A `SINGLE` transfer.
- The first beat of a burst.
- A middle beat of a burst.
- The last beat of a burst.

### 4. Back-to-Back Sequences
The transition between transactions is where pipelines break. You must cover:
- Back-to-back Read → Write with correct address/data phase ownership.
- Back-to-back Write → Read.
- Write → Write to the same address.
- A new burst starting immediately on the very next cycle after a previous burst ends.

## The Coverage Map Concept

In a professional DV environment, these dimensions are mapped into a Coverage Map. Closure means every planned legal bin is hit or reviewed, illegal bins are excluded for the implemented AHB revision, and the associated checkers passed. A raw percentage alone is not a signoff decision.

The grid below shows a typical 2D cross-coverage space interactively—crossing `HBURST` with `HRESP`. Hover over any cell to see its status. Notice how coverage holes (red) easily stand out, indicating tests that still need to be written, and how structural impossibilities (grey) are excluded from the metric.

![Interactive coverage grid crossing AHB burst types with OKAY, ERROR, and version-specific illegal response bins](visual:cm-ahb-burst-resp)

*Caption: A 2D coverage map slicing Burst Types against Responses. Notice that SPLIT and RETRY are structurally illegal in modern AHB versions.*

Use the exercise below to turn the visible zero-hit legal bins into targeted tests.
