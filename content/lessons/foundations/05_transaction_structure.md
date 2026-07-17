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

Transactions can be much more complex than “read one word from address X,” and their channel/phase structure is protocol-specific.

## Single vs Burst Transfers

If a CPU wants to read an entire 64-byte cache line from memory, a **[glossary:Burst]** can group multiple beats. In AHB, every burst beat has an address/control phase (`NONSEQ` first, then accepted `SEQ` beats) and a following data/response phase. In AXI, an AR handshake declares a read burst and the R channel returns its beats; an AXI write uses independent AW and W handshakes followed by one B response. Generated addresses still must obey the selected protocol's size, alignment, wrap, and boundary rules.

## Out-of-Order Completion

In a highly pipelined, switched interconnect, you might have a fast CPU talking to both a fast SRAM and a very slow external DDR memory at the same time.

If the CPU issues a read to the slow DDR (Transaction A), and then a read to the fast SRAM (Transaction B), what happens?
On one AHB interface path, accepted transfers complete in its coupled pipeline order. A multilayer matrix can still make progress on an independent manager-to-target path.

AXI permits **[glossary:Out-of-Order] response completion** between ordering domains where the ID and ordering rules allow it and the implementation supports it. Same-ID response order and each burst's own beat order still apply.

![tl-burst-transfer](visual:tl-burst-transfer)

AXI IDs identify ordering and correlation streams; they are not required to be globally unique transaction numbers. The same ID can be reused, creating a per-ID issue-order queue, and an interconnect can widen or remap IDs while preserving and restoring the source context.

## Atomic and Exclusive Accesses

Sometimes a master needs to read a value, modify it, and write it back *without any other master interfering*. This is critical for software locks and semaphores (e.g., a multi-core CPU trying to grab a lock).
Protocols provide different atomicity mechanisms. A **locked** sequence retains ownership of an applicable arbitration resource. An **exclusive** sequence does not reserve the address: a monitor records the exclusive read, detects relevant interference, and reports whether the later exclusive write succeeded. Exclusive failure is not automatically a bus error.

## Error Responses

Not all transactions succeed. What if a master tries to read from an address that doesn't exist? Or write to a read-only memory region?
Responses are also protocol-specific. AHB-Lite/AHB5 returns `HRESP=OKAY` or the defined two-cycle `ERROR` response. AXI uses `OKAY`, `EXOKAY`, `SLVERR`, or `DECERR` on its response channels, with EXOKAY reserved for successful exclusive context. A monitor and scoreboard must retire work only at the protocol-defined completion handshake.

## Scoreboard Structures and Boundary Tests

An AHB scoreboard uses accepted phase records in FIFO order and assigns later data/response to the saved owner. An AXI scoreboard keeps per-ID read and write queues, associates AXI4 W bursts in AW order (or AXI3 W data using WID), and retires reads only on an accepted RLAST beat and writes only on an accepted B response.

Stimulus and checking must include configured outstanding limits, same-ID and different-ID completion orders, exclusive success/failure and interference, legal and illegal burst encodings, alignment, and protocol boundary rules. Exceeding a configured resource limit belongs in an intentional negative or backpressure test, not the default legal generator.
