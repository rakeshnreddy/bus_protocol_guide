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
visualIds: ["topo-ahb-dv-environment"]
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

Now that you understand how AHB works, how do you verify it? Verification strategies depend heavily on whether you are verifying an AHB Master, an AHB Slave, or an entire SoC interconnect.

## BFM vs Full VIP

A **Bus Functional Model (BFM)** is a simple task-based module (e.g., `ahb_write(addr, data)`) that wiggles pins. It is useful for basic, directed testing (like initializing a register).

A **Verification IP (VIP)** is a more complete environment. It can include a driver that generates complex constrained-random scenarios, a monitor, coverage, and protocol checking. A BFM can be sufficient for smoke tests or a tightly scoped block; VIP is valuable when the verification plan requires reusable constrained stimulus and protocol services. Choose based on risk and required evidence rather than applying one rule to every project.

## Verification Partitioning

- **Verifying a Master:** Connect a Slave VIP. The master drives `HTRANS` and `HADDR`. The Slave VIP should vary `HREADY` from zero waits through the configured maximum and inject legal `HRESP` sequences so the master handles backpressure and follows its documented post-ERROR policy.
- **Verifying a Slave:** Connect a Master VIP. The Master VIP must randomize burst types, address alignments, and transfer sizes. It should stress the slave by sending back-to-back bursts with no idle cycles, and mixing read/write operations.
- **Verifying an Interconnect/System:** Use a Monitor VIP on every single AHB interface in the system. The monitors passively observe traffic. Connect them to a scoreboard to ensure that a transaction originating from Master 1 correctly emerges at Slave 2 without data corruption or address mangling.

Trace the highlighted evidence path, then inspect the assertion and coverage branches. The expected and actual streams must remain independent enough that one modeling bug cannot hide another.

![AHB verification environment showing stimulus, pin-level DUT interaction, passive monitoring, assertions, scoreboard, and coverage evidence](visual:topo-ahb-dv-environment)

## Directed vs Constrained-Random

- **Directed Tests:** Write these first to prove basic connectivity. Examples: "Write a word to Slave A and read it back," "Perform a WRAP4 burst."
- **Constrained-Random:** Randomize legal burst types, alignments, sizes, responses, and especially `HREADY` timing to explore combinations efficiently. Rare interactions can also be reached with targeted directed tests or formal analysis; constrained-random is one powerful path to them, not the only possible path.
