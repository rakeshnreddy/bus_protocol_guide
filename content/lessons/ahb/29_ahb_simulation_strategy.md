---
id: "29_ahb_simulation_strategy"
title: "AHB Simulation Strategy"
summary: "How to approach verifying an AHB system using simulation."
protocol: "ahb"
tier: "1"
level: "expert"
order: 29
tags: ["ahb", "verification", "strategy"]
relatedLessons: []
prerequisites: ["28_ahb5_vs_ahb2"]
visualIds: []
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

Now that you understand how AHB works, how do you verify it? Verification strategies depend heavily on whether you are verifying an AHB Master, an AHB Slave, or an entire SoC interconnect.

## BFM vs Full VIP

A **Bus Functional Model (BFM)** is a simple task-based module (e.g., `ahb_write(addr, data)`) that wiggles pins. It is useful for basic, directed testing (like initializing a register).

A **Verification IP (VIP)** is a complete UVM environment. It includes a smart driver that can generate complex constrained-random scenarios (like injecting wait states or errors), a monitor that observes the bus, and a protocol checker. For robust verification, always use a VIP, not a BFM.

## Verification Partitioning

- **Verifying a Master:** Connect a Slave VIP. The master drives `HTRANS` and `HADDR`. The Slave VIP must randomize `HREADY` (injecting zero to maximum wait states) and `HRESP` (injecting errors) to ensure the master handles backpressure and aborts correctly.
- **Verifying a Slave:** Connect a Master VIP. The Master VIP must randomize burst types, address alignments, and transfer sizes. It should stress the slave by sending back-to-back bursts with no idle cycles, and mixing read/write operations.
- **Verifying an Interconnect/System:** Use a Monitor VIP on every single AHB interface in the system. The monitors passively observe traffic. Connect them to a scoreboard to ensure that a transaction originating from Master 1 correctly emerges at Slave 2 without data corruption or address mangling.

## Directed vs Constrained-Random

- **Directed Tests:** Write these first to prove basic connectivity. Examples: "Write a word to Slave A and read it back," "Perform a WRAP4 burst."
- **Constrained-Random:** This is where bugs are found. Randomize burst lengths, alignments, and most importantly, the timing (`HREADY`). A classic AHB bug only appears when a master initiates a burst exactly on the same cycle another master receives a two-cycle error response while `HREADY` is toggling. Only constrained-random simulation can hit these edge cases.
