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
visualIds: ["topo-axi-terminology-map"]
exerciseIds: []
glossaryTerms: ["Transaction", "Burst", "Beat", "Handshake", "Outstanding Transaction", "ACLK", "ARESETn"]
checklistIds: []
---

Before we dive into the signaling, we must align on terminology. AXI relies heavily on specific terms that describe the flow of data.

*   **Transaction:** A complete read or write operation. For interface scoreboarding, a read runs from its accepted AR request through the accepted final R beat; a write allocates on an accepted AW request and retires on its accepted B response. AXI also permits W beats to be accepted before AW; those beats require separate pre-address buffering/association state until an AW request is available.
*   **Burst:** The ordered sequence of data transfers within a transaction. If a master requests to read 64 bytes of data starting at address 0x1000, that entire 64-byte sequence is the "burst."
*   **Beat:** A single accepted data-channel transfer. Its maximum byte count is `2^AxSIZE`, not automatically the physical data-bus width. On a 4-byte bus, a 64-byte full-width burst takes 16 beats; a narrow transfer uses fewer active byte lanes per beat.
*   **Handshake:** The fundamental mechanism of AXI. Every single piece of information—whether it is an address, a data beat, or a response—is transferred using a two-way `VALID` and `READY` handshake.
*   **Outstanding Transaction:** An accepted address request whose final read data or write response has not yet been accepted. Supported outstanding depth is an implementation capability. Accepted pre-AW W data is tracked separately until it can be associated.
*   **Transaction ID:** A tag that selects an ordering/correlation stream at one interface. It is not a globally unique transaction number: an ID can be reused for multiple queued requests while the required per-ID order is preserved.

Select the terms in this map to connect the structural vocabulary (transaction, burst, and beat) with channel handshakes, outstanding lifetime, and response-ID correlation.

![Concept map linking an AXI transaction, burst beats, handshakes, outstanding state, IDs, and completion](visual:topo-axi-terminology-map)

### The Prefix Rule
As you look at AXI signals, you will notice a strict naming convention. Signals are prefixed based on the channel they belong to:
*   `AW...` (Address Write)
*   `W...` (Write Data)
*   `B...` (Write Response)
*   `AR...` (Address Read)
*   `R...` (Read Data)

For example, `AWADDR` is the Write Address, and `RDATA` is the Read Data.

Next, we will look at how these five prefixes form the core architectural model of AXI.
