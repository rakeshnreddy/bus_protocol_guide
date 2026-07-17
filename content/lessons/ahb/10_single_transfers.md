---
id: "10_single_transfers"
title: "Single Transfers"
summary: "The simplest form of communication on AHB: moving one piece of data at a time."
protocol: "ahb"
tier: "1"
level: "beginner"
order: 10
tags: ["ahb", "semantics", "transfer"]
relatedLessons: []
prerequisites: ["06_htrans_transfer_types", "07_burst_and_size", "08_data_and_response"]
visualIds: ["wf-ahb-simple-transfer"]
exerciseIds: []
glossaryTerms: ["SINGLE"]
checklistIds: []
---

Before we get to complex bursts, let's look at how a master moves exactly one piece of data.

A **Single Transfer** (where `HBURST = SINGLE`) consists of two sequential phases for that transfer:

1. **Address Phase:** The master drives `HADDR`, `HWRITE`, `HSIZE`, and sets `HBURST` to `SINGLE`. Most importantly, it drives `HTRANS` to `NONSEQ` to indicate this is a valid, isolated transfer.
2. **Data Phase:** The subordinate returns or samples data and provides response/completion. It may extend this phase with any number of implementation-required wait states; AHB specifies no universal one-cycle completion.

The phases of one transfer do not overlap each other. Pipelining means the **next** transfer's address phase can overlap the current transfer's data phase.

Use the cycle selector below to answer two questions: which address owns the current data, and why does the second independent transfer start with `NONSEQ` again?

![Back-to-back AHB SINGLE read and write transfers with overlapping address and data phases](visual:wf-ahb-simple-transfer)

If a master wants to do *another* single transfer immediately after the first one, it simply drives `HTRANS` to `NONSEQ` again in the very next cycle. 

Multiple `NONSEQ` transfers can be presented back-to-back and are independent SINGLE bursts. Only original shared-bus AHB exposes an arbiter that can transfer ownership between them; on AHB-Lite/AHB5 there is one manager per interface, though a surrounding matrix can arbitrate contending routes internally.
