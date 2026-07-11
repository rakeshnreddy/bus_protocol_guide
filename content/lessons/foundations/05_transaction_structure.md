---
id: "05_transaction_structure"
title: "Transaction Structure"
summary: "Dive deep into bursts, atomic operations, out-of-order completion, and error handling."
protocol: "foundations"
tier: "0"
level: "beginner"
order: 5
tags: ["transactions", "bursts", "ordering"]
visualIds: ["tl-burst-transfer"]
exerciseIds: ["ex-transaction-structure"]
glossaryTerms: ["Burst", "Out-of-Order"]
---

We know that a transaction consists of an address phase followed by a data phase. But transactions can be much more complex than a simple "read one word from address X."

## Single vs Burst Transfers

If a CPU wants to read an entire 64-byte cache line from memory, doing 16 separate 4-byte transactions is incredibly inefficient. Instead, it issues a **[glossary:Burst]**.
In a burst, the master issues *one* address phase, specifying the starting address and the length of the burst. It then performs multiple back-to-back data beats. The slave is responsible for automatically incrementing the address internally for each beat.

## Out-of-Order Completion

In a highly pipelined, switched interconnect, you might have a fast CPU talking to both a fast SRAM and a very slow external DDR memory at the same time.

If the CPU issues a read to the slow DDR (Transaction A), and then a read to the fast SRAM (Transaction B), what happens?
In a strictly ordered protocol (like AHB), the bus stalls. Transaction B *cannot* finish until Transaction A finishes.

In an **[glossary:Out-of-Order]** protocol (like AXI), the interconnect allows the fast SRAM to return its data immediately, bypassing the slow DDR! 

![tl-burst-transfer](visual:tl-burst-transfer)

To make this work, every transaction is tagged with an **ID**. The master knows that the data coming back belongs to Transaction B because the interconnect tags the response with B's ID.

## Atomic and Exclusive Accesses

Sometimes a master needs to read a value, modify it, and write it back *without any other master interfering*. This is critical for software locks and semaphores (e.g., a multi-core CPU trying to grab a lock).
Protocols support this via **Exclusive** or **Locked** transactions. These special flags tell the arbiter and the slave, "Do not let anyone else touch this memory address until I am finished with my write."

## Error Responses

Not all transactions succeed. What if a master tries to read from an address that doesn't exist? Or write to a read-only memory region?
The slave must reply with an Error Response (e.g., `SLVERR` or `DECERR`). A robust protocol ensures that even if an error occurs, the handshake must still cleanly finish, otherwise the bus will hang forever!
