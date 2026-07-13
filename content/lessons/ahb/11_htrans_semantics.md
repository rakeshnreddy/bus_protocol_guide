---
id: "11_htrans_semantics"
title: "HTRANS Semantics In-Depth"
summary: "The heartbeat of AHB: understanding IDLE, BUSY, NONSEQ, and SEQ transitions."
protocol: "ahb"
tier: "1"
level: "intermediate"
order: 11
tags: ["ahb", "semantics", "htrans"]
relatedLessons: []
prerequisites: ["06_htrans_transfer_types", "10_single_transfers"]
visualIds: ["wf-ahb-illegal-htrans"]
exerciseIds: ["ex-ahb-htrans-violation"]
glossaryTerms: ["HTRANS", "IDLE", "BUSY", "NONSEQ", "SEQ"]
checklistIds: []
---

`HTRANS` is the most strictly policed signal in the AHB protocol. Every cycle, a master must declare its intent via `HTRANS`. Let's look at the exact semantics and legal transitions.

## 1. IDLE (0b00)
- **Meaning:** "I have nothing to do right now."
- **Slave behavior:** Must immediately provide a zero-wait-state `OKAY` response (`HREADY=1`, `HRESP=0`). The slave must ignore the `HADDR` and `HWRITE` buses.
- **When to use:** When the master is inactive, or when a burst has finished and no new transfer is ready.

## 2. NONSEQ (0b10)
- **Meaning:** "I am starting a brand new transfer or a new burst."
- **Slave behavior:** Must latch `HADDR` and begin fetching/storing the data.
- **When to use:** The first beat of any burst, or any single transfer. 

## 3. SEQ (0b11)
- **Meaning:** "I am continuing the burst I already started."
- **Slave behavior:** Calculates the new address based on the previous address, the `HSIZE`, and the `HBURST` type, and fetches/stores the data.
- **When to use:** Every beat of a burst *after* the initial `NONSEQ`.
- **Illegal:** You can NEVER transition directly from `IDLE` to `SEQ`. `SEQ` implies a sequence is ongoing.

## 4. BUSY (0b01)
- **Meaning:** "I am in the middle of a burst, but I'm not ready to provide the next address yet."
- **Slave behavior:** Must provide a zero-wait-state `OKAY` response and ignore `HADDR`, just like `IDLE`. However, unlike `IDLE`, the slave knows the burst is *paused*, not finished.
- **When to use:** In the middle of an `INCR` or `WRAP` burst.
- **Illegal:** You can NEVER use `BUSY` for the very first beat of a burst. The first beat must be `NONSEQ`.

## Bug Gallery: Illegal HTRANS Transitions

A very common verification failure occurs when a master tries to change its mind while a slave is holding `HREADY` low. 

**The Golden Rule:** Once a master enters an Address Phase by driving `HTRANS` (to `NONSEQ` or `SEQ`), if the slave drives `HREADY=0`, the master **MUST NOT CHANGE** `HTRANS`, `HADDR`, or `HWRITE` until `HREADY=1`.

Look at the waveform below. Can you spot the exact cycle the master violates the golden rule?

Inspect the highlighted violation cycle and compare it with the preceding stalled cycle. The failure is the change itself—not merely the value chosen after the change.

![Illegal AHB address and HTRANS change while HREADY holds the pipeline stalled](visual:wf-ahb-illegal-htrans)
