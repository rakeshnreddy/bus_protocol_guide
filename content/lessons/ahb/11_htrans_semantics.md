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
- **Subordinate behavior:** Uses the `HADDR` driven by the manager when the valid address phase is accepted; a predicted next address is checker or optimization state, not a replacement for the protocol input.
- **When to use:** The first beat of any burst, or any single transfer. 

## 3. SEQ (0b11)
- **Meaning:** "I am continuing the burst I already started."
- **Subordinate behavior:** Accepts the manager-driven `HADDR`; a monitor can independently calculate the expected next address from the previous accepted beat, `HSIZE`, and `HBURST` and compare it.
- **When to use:** Every accepted beat after the initial `NONSEQ`, with permitted `BUSY` cycles between those beats.
- **Illegal:** You can NEVER transition directly from `IDLE` to `SEQ`. `SEQ` implies a sequence is ongoing.

## 4. BUSY (0b01)
- **Meaning:** "I am in the middle of a burst, but I'm not ready to provide the next address yet."
- **Slave behavior:** Must provide a zero-wait-state `OKAY` response and ignore `HADDR`, just like `IDLE`. However, unlike `IDLE`, the slave knows the burst is *paused*, not finished.
- **When to use:** In the middle of an `INCR` or `WRAP` burst.
- **Illegal:** You can NEVER use `BUSY` for the very first beat of a burst. The first beat must be `NONSEQ`.
- **SINGLE rule:** `HBURST=SINGLE` cannot continue with `BUSY`, because the one accepted beat already defines the whole burst.

## Bug Gallery: Illegal HTRANS Transitions

A very common verification failure occurs when a master tries to change its mind while a slave is holding `HREADY` low. 

**The valid-pending rule:** Once a manager presents `NONSEQ` or `SEQ` and global `HREADY` is LOW, it retains the complete address/control payload until an accepting edge. Do not turn this into a blanket “nothing can change” rule: IDLE can change to NONSEQ while waited, BUSY has fixed- versus undefined-length transition rules, and the first cycle of the defined ERROR response permits the pending transfer to be cancelled.

An undefined-length `INCR` can legally pause with `BUSY` and then terminate with `IDLE` or start unrelated work with `NONSEQ`. A fixed-length burst must resume from a permitted BUSY with `SEQ` and finish its declared accepted-beat count.

Look at the waveform below. Can you spot the exact cycle the master violates the golden rule?

Inspect the highlighted violation cycle and compare it with the preceding stalled cycle. The failure is the change itself—not merely the value chosen after the change.

![Illegal AHB address and HTRANS change while HREADY holds the pipeline stalled](visual:wf-ahb-illegal-htrans)
