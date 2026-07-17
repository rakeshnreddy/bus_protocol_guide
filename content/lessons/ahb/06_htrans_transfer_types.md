---
id: "06_htrans_transfer_types"
title: "Transfer Types (HTRANS)"
summary: "The heartbeat of AHB. HTRANS dictates exactly what the master is doing at any given cycle."
protocol: "ahb"
tier: "1"
level: "beginner"
order: 6
tags: ["ahb", "signals", "htrans"]
relatedLessons: ["07_burst_and_size", "08_data_and_response"]
prerequisites: ["05_address_and_control"]
visualIds: ["wf-ahb-htrans-sequences", "wf-ahb-simple-transfer"]
exerciseIds: ["ex-ahb-htrans-sequence"]
glossaryTerms: ["HTRANS", "IDLE", "BUSY", "NONSEQ", "SEQ"]
checklistIds: []
---

If there is one signal you must understand perfectly to debug AHB, it is **[glossary:HTRANS]**. 
`HTRANS` is a 2-bit signal driven by the manager. It describes the **currently visible address phase**. The simultaneous data/response phase belongs to an address accepted earlier.

## The Four States of HTRANS

### 00: [glossary:IDLE]
The master does not want to transfer any data. 
- **Rule:** Slaves must ignore `HADDR`, `HWRITE`, and `HSIZE` when `HTRANS` is `IDLE`. The slave must simply respond with a zero-wait-state `OKAY` (meaning it must respond immediately without delaying the bus—we will cover wait states fully in Section D).
- **DV Check:** Masters must drive `HTRANS` to `IDLE` coming out of reset.

### 01: [glossary:BUSY]
The master is in the middle of a burst, but it needs a pause to prepare the next data item.
- **Rule:** It causes no data transfer but preserves the manager's burst context so a later `SEQ` can continue. `BUSY` does not itself guarantee arbitration ownership; original-AHB ownership follows its arbitration and lock rules.
- **Usage:** Rarely used in modern designs because it blocks the bus without doing useful work. Many modern AHB-Lite masters never generate `BUSY` cycles.

### 10: [glossary:NONSEQ] (Non-Sequential)
The master is starting a brand new transfer, or the first beat of a new burst.
- **Meaning:** The address on `HADDR` has no guaranteed relationship to the previous address. The slave must treat this as a completely fresh request.

### 11: [glossary:SEQ] (Sequential)
The master is continuing an existing burst.
- **Meaning:** The address on `HADDR` follows the burst progression from the previous accepted beat: the byte increment is `1 << HSIZE`, with the wrap formula applied for a wrapping burst.
- **Optimization:** Slaves love `SEQ` cycles because they can predict the address and pre-fetch data from memory, making the transfer incredibly fast.

Compare the legal and buggy sequences below. The key question is whether a `SEQ` beat still has an active burst context: `BUSY` preserves that context, while `IDLE` ends it.

![Legal HTRANS burst with BUSY compared with an illegal SEQ restart after IDLE](visual:wf-ahb-htrans-sequences)

## A Simple Transfer Sequence

Let's look at a waveform showing the most basic transaction: a single `NONSEQ` read, followed by the bus returning to `IDLE`.

![Single NONSEQ read followed by an IDLE address phase and returning read data](visual:wf-ahb-simple-transfer)

Notice that the master asserts `HTRANS = NONSEQ` along with a valid address. Once the slave acknowledges it, the master immediately returns `HTRANS` to `IDLE` on the next clock cycle, while the slave provides the requested data. (We will discuss this pipelining effect more deeply in the Data and Response lesson).

## Acceptance and Burst Termination

Only `NONSEQ` or `SEQ` with global `HREADY` HIGH on a rising edge accepts a beat. Visible wait cycles and `BUSY` cycles do not increment the accepted-beat count. A fixed-length burst must complete its declared accepted beats, with any permitted `BUSY` pause followed by `SEQ`. An undefined-length `INCR` can end with `IDLE` or begin unrelated work with `NONSEQ`; it must end and restart before a 1KB boundary.
