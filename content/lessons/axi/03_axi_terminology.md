---
id: "03_axi_terminology"
title: "AXI Terminology Primer"
summary: "Essential vocabulary for the AXI protocol."
protocol: "axi"
tier: "1"
level: "beginner"
order: 3
tags: ["axi", "intro", "terminology"]
relatedLessons: []
prerequisites: ["02_axi_variants"]
visualIds: []
exerciseIds: []
glossaryTerms: ["Transaction", "Burst", "Beat", "Handshake", "Outstanding Transaction", "ACLK", "ARESETn"]
checklistIds: []
---

Before we dive into the signaling, we must align on terminology. AXI relies heavily on specific terms that describe the flow of data.

*   **Transaction:** A complete read or write operation, encompassing the initial address phase, the transfer of data, and the final response. A single transaction may move multiple pieces of data.
*   **Burst:** The payload of a transaction. If a master requests to read 64 bytes of data starting at address 0x1000, that entire 64-byte payload is the "burst."
*   **Beat:** A single data transfer within a burst. If the data bus is 4 bytes wide, the 64-byte burst mentioned above will take 16 "beats" to complete. 
*   **Handshake:** The fundamental mechanism of AXI. Every single piece of information—whether it is an address, a data beat, or a response—is transferred using a two-way `VALID` and `READY` handshake.
*   **Outstanding Transaction:** A transaction where the master has issued the address, but has not yet received all the data (for a read) or the final response (for a write). AXI's high performance comes from allowing multiple *outstanding* transactions simultaneously.

### The Prefix Rule
As you look at AXI signals, you will notice a strict naming convention. Signals are prefixed based on the channel they belong to:
*   `AW...` (Address Write)
*   `W...` (Write Data)
*   `B...` (Write Response / Buffer)
*   `AR...` (Address Read)
*   `R...` (Read Data)

For example, `AWADDR` is the Write Address, and `RDATA` is the Read Data.

Next, we will look at how these five prefixes form the core architectural model of AXI.
