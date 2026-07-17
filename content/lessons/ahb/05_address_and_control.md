---
id: "05_address_and_control"
title: "Address and Control (HADDR, HWRITE, HPROT)"
summary: "The signals a master uses to tell the system WHERE it wants to access data, and exactly WHAT kind of access it is performing."
protocol: "ahb"
tier: "1"
level: "beginner"
order: 5
tags: ["ahb", "signals", "address", "control"]
relatedLessons: ["06_htrans_transfer_types"]
prerequisites: ["05_transaction_structure"]
visualIds: ["sig-ahb-address-control"]
exerciseIds: []
glossaryTerms: ["HADDR", "HWRITE", "HPROT"]
checklistIds: []
---

When an AHB master initiates a transfer, it must broadcast its intent during the **Address Phase**. The three fundamental signals that describe *where* and *how* the data is being moved are `HADDR`, `HWRITE`, and `HPROT`.

Select each address-phase signal below to see who drives it, when it is sampled, and the verification failure most likely to expose a broken master.

![Interactive AHB address and control signal explorer with DV watchpoints](visual:sig-ahb-address-control)

## HADDR (Address Bus)

**[glossary:HADDR]** carries the byte address in the system address map.
- **Driver:** Master.
- **Width in scope:** Both IHI 0011A and IHI 0033B.b define the base `HADDR[31:0]` interface. Do not infer a wider address from an implementation extension without documenting that extension separately.
- **Rule:** The address must be aligned to the size of the transfer (which we will cover in the `HSIZE` lesson). For example, if you are reading 4 bytes, `HADDR` must be a multiple of 4.

## HWRITE (Transfer Direction)

**[glossary:HWRITE]** determines if the master is pushing data to the slave (Write) or pulling data from the slave (Read).
- **Driver:** Master.
- **Values:** 
  - `1`: Write Transfer. The master will provide data on `HWDATA`.
  - `0`: Read Transfer. The slave must provide data on `HRDATA`.
- **DV Check:** A common bug is a master changing `HWRITE` in the middle of a burst. `HWRITE` must remain constant for all beats of a single burst!

## HPROT (Protection Control)

**[glossary:HPROT]** provides protection and memory-type attributes. The base signal is `HPROT[3:0]`; AHB5 adds `HPROT[6:4]` only when the interface declares `Extended_Memory_Types`.
- **Driver:** Master.
- **Bits (AHB-Lite):**
  - `HPROT[0]`: `1` data access, `0` instruction fetch.
  - `HPROT[1]`: `1` privileged, `0` unprivileged.
  - `HPROT[2]`: `1` bufferable, `0` non-bufferable.
  - `HPROT[3]`: `1` cacheable in the original/base naming; Issue B calls the same bit **Modifiable**, with `1` permitting characteristic modification.
- **AHB5 extension:** `HPROT[4]` is Lookup, `HPROT[5]` Allocate, and `HPROT[6]` Shareable, with the detailed memory-type legality defined by the selected property and specification table.
- **Policy use:** `HPROT` supplies attributes; the protocol does not require every subordinate to enforce a privilege policy. A configured firewall, interconnect, controller, or subordinate can enforce the system address/security policy and return the defined failure behavior.

## Complete Address-Phase Context

`HADDR` is interpreted with `HTRANS`, `HWRITE`, `HSIZE`, `HBURST`, the base `HPROT`, `HMASTLOCK`, and any enabled AHB5 address attributes such as `HNONSEC`, extended `HPROT`, `HEXCL`, `HMASTER`, and exclusive size. These controls belong to the visible address phase and are accepted only on a rising edge where global `HREADY` is HIGH and `HTRANS` denotes a valid transfer. A monitor stores the accepted context for the following data/response phase.

In the next lesson, we'll look at the most important control signal of them all: `HTRANS`.
