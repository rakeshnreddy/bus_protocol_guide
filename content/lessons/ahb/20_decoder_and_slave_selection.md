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
visualIds: ["topo-ahb-multi-master", "model-ahb-system-checker"]
exerciseIds: ["lab-ahb-decoder-response-owner"]
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

Address-map decode can be centralized, distributed, hierarchical, combinational, or registered if the interface timing remains legal. It can inspect any address bits and attributes required by the configured map.
- It determines which subordinate route owns the mapped address.
- It asserts a dedicated **`HSELx`** (Select) signal to that specific slave.

Follow the highlighted request into SRAM, then inspect the default-slave route to see how an unmapped access still receives a defined response.

![AHB decoder topology showing one selected slave, the return mux, and the default error slave](visual:topo-ahb-multi-master)

## Slave Behavior

A slave must strictly monitor its `HSELx` signal.
- A valid subordinate transfer is accepted only on an edge satisfying `HSELx && HREADY && HTRANS[1]`. `HTRANS[1]` excludes IDLE and BUSY from valid-transfer state allocation.
- This ensures the slave only wakes up and begins a transfer when it is the intended target of the Address Phase.

## The Default Slave

What happens if a master requests an address that is *not* mapped to any slave? (e.g., `0x3000_0000` in our example).
- The decoder asserts `HSEL` for a special, dummy slave called the **Default Slave**.
- For a valid `NONSEQ` or `SEQ` transfer, the Default Slave provides the required two-cycle `ERROR` response on `HRESP` and `HREADY`, cleanly terminating the invalid transaction so the bus doesn't hang.
- `IDLE` or `BUSY` transfers to an unmapped location receive a zero-wait `OKAY` response because they do not represent a valid data transfer.

The response mux is retimed from the **accepted target selection** so `HRDATA`, `HRESP`, and `HREADYOUT` come from the subordinate owning the current data phase. Using the target decoded for the next visible address can return a different subordinate's response during a pipeline overlap.

## Execute the system-state checker

The system model saves the accepted manager, decoded target, response owner, bridge accounting state, and configured optional features as separate fields. Execute a retimed return, bridge-stall, and mechanism-separation scenario. Arbitration policy, security attribution, locking, and exclusive monitor state remain independent inputs; none is inferred merely from the manager or subordinate currently returning a response.

![Executable AHB system checker for accepted target, response routing, bridge conservation, lock, exclusive, and security state](visual:model-ahb-system-checker)
