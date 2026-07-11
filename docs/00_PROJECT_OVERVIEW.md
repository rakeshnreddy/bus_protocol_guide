# Bus Protocol DV Academy – Project Overview

## Goal

Build a local, single-user, comprehensive training web app that turns an experienced design verification engineer into an expert on a chosen bus protocol, starting with AMBA AHB and AXI, across use cases ranging from simple microcontroller systems to complex multi-core SoCs and coherent fabrics.

Expert-level capability means the guide enables the user to:
- Read and accurately interpret the protocol specification.
- Understand every signal, acronym, timing rule, transaction type, and corner case.
- Reason about system-level behavior such as interconnects, bridges, ordering, QoS, coherency, contention, and backpressure.
- Build or review verification strategy using simulation, assertions, coverage, and formal methods.
- Recognize common and subtle protocol bugs in RTL, interconnect, and verification environments.

## Constraints

- Fully local in Phase 1.
- No authentication, accounts, sync, or multi-user features.
- Single-user workflow for now.
- Specification-faithful but written in original words; no copying of copyrighted spec text.
- Assume the reader knows VLSI and Verilog basics, but may not have deep protocol intuition.

## Phase 1 Protocol Scope

Primary protocols:
- AMBA AHB
- AHB-Lite
- AHB5
- AXI3
- AXI4
- AXI4-Lite
- AXI-Stream

Adjacent context included where necessary:
- APB as contrast and bridge target
- Interconnects and protocol bridges
- Verification methodology patterns relevant to bus protocols

## Product Vision

The site should function like an expert protocol academy rather than a documentation dump.
Each topic should combine:
- Deep conceptual explanation
- Interactive visuals
- Cycle-accurate examples
- Bug-pattern analysis
- Simulation verification guidance
- Formal verification reasoning
- Checklists and review aids for retention

At the end of a protocol track, the learner should be able to use the protocol confidently in day-to-day senior DV work.

## Learning Principles

1. Foundations first: teach signals, edges, cycles, transactions, bursts, ordering, and protocol thinking before protocol-specific details.
2. Visual-first explanation: every non-trivial concept should have a visual or interactive representation.
3. Senior-DV framing: each topic explains what matters in real projects, what bugs appear in real RTL, and what gets missed in weak verification plans.
4. Full coverage: each protocol gets an explicit completeness checklist so nothing important is omitted.
5. Acronym clarity: spell out every acronym at first use and maintain a glossary.
6. Revision-friendly: provide compact summary aids, cheat sheets, and review visuals in addition to deep lessons.

## Deliverables in Phase 1

- Local React + TypeScript web app
- Content-driven curriculum engine
- Interactive visual components for waveforms, timelines, and topologies
- Foundations curriculum
- Comprehensive AHB curriculum
- Comprehensive AXI curriculum
- Verification-oriented examples and checklists
- Local progress tracking only if it does not complicate the architecture
