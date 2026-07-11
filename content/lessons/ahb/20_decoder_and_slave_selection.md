---
id: "20_decoder_and_slave_selection"
title: "Decoder and Slave Selection"
summary: "How a centralized decoder routes transactions to the correct slave."
protocol: "ahb"
tier: "1"
level: "intermediate"
order: 20
tags: ["ahb", "architecture", "decoder"]
relatedLessons: []
prerequisites: ["19_arbiter_behavior"]
visualIds: ["topo-ahb-multi-master"]
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

While the Arbiter decides *who* gets to talk, the **Address Decoder** decides *who they are talking to*.

## The Memory Map

In an SoC (System on Chip), every slave is assigned a specific chunk of the overall address space. For example:
- `0x0000_0000` to `0x00FF_FFFF`: Boot ROM (Slave 1)
- `0x2000_0000` to `0x2007_FFFF`: Internal SRAM (Slave 2)
- `0x4000_0000` to `0x4FFF_FFFF`: APB Peripherals (Slave 3)

## The Decoder's Job

The Address Decoder is a central piece of combinatorial logic that looks at the top bits of the active `HADDR` bus.
- It determines which slave's memory region the address falls into.
- It asserts a dedicated **`HSELx`** (Select) signal to that specific slave.

![topo-ahb-multi-master](visual:topo-ahb-multi-master)

## Slave Behavior

A slave must strictly monitor its `HSELx` signal.
- The slave should only sample `HADDR`, `HTRANS`, and other control signals on the clock edge where `HSELx` is `1` and `HREADY` is `1`.
- This ensures the slave only wakes up and begins a transfer when it is the intended target of the Address Phase.

## The Default Slave

What happens if a master requests an address that is *not* mapped to any slave? (e.g., `0x3000_0000` in our example).
- The decoder asserts `HSEL` for a special, dummy slave called the **Default Slave**.
- The Default Slave's only job is to immediately provide a two-cycle `ERROR` response on `HRESP` and `HREADY`, cleanly terminating the invalid transaction so the bus doesn't hang.
