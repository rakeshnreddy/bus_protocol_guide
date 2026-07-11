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
visualIds: []
exerciseIds: []
glossaryTerms: ["HADDR", "HWRITE", "HPROT"]
checklistIds: []
---

When an AHB master initiates a transfer, it must broadcast its intent during the **Address Phase**. The three fundamental signals that describe *where* and *how* the data is being moved are `HADDR`, `HWRITE`, and `HPROT`.

## HADDR (Address Bus)

**[glossary:HADDR]** specifies the target physical address in memory.
- **Driver:** Master.
- **Width:** Typically 32 bits, but can be 64 bits in modern systems.
- **Rule:** The address must be aligned to the size of the transfer (which we will cover in the `HSIZE` lesson). For example, if you are reading 4 bytes, `HADDR` must be a multiple of 4.

## HWRITE (Transfer Direction)

**[glossary:HWRITE]** determines if the master is pushing data to the slave (Write) or pulling data from the slave (Read).
- **Driver:** Master.
- **Values:** 
  - `1`: Write Transfer. The master will provide data on `HWDATA`.
  - `0`: Read Transfer. The slave must provide data on `HRDATA`.
- **DV Check:** A common bug is a master changing `HWRITE` in the middle of a burst. `HWRITE` must remain constant for all beats of a single burst!

## HPROT (Protection Control)

**[glossary:HPROT]** provides additional context about the *privilege level* and *nature* of the transaction. It is 4 bits wide in AHB-Lite, and expanded to 7 bits in AHB5.
- **Driver:** Master.
- **Bits (AHB-Lite):**
  - `HPROT[0]`: Opcode fetch vs Data access
  - `HPROT[1]`: Privileged vs User access
  - `HPROT[2]`: Bufferable vs Non-bufferable
  - `HPROT[3]`: Cacheable vs Non-cacheable
- **Usage:** Slaves (especially Memory Protection Units) use `HPROT` to block unauthorized accesses. For example, if a User-mode application tries to write to a Privileged-only configuration register, the slave will see `HPROT[1] == 0` and reject the transaction with an ERROR response.

In the next lesson, we'll look at the most important control signal of them all: `HTRANS`.
