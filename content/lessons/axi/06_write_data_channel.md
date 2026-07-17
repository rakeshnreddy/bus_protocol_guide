---
id: "06_write_data_channel"
title: "The Write Data Channel (W)"
summary: "The signals used to transfer the actual payload."
protocol: "axi"
tier: "1"
level: "intermediate"
order: 6
tags: ["axi", "signals", "write"]
relatedLessons: ["05_write_address_channel", "09_read_data_channel"]
prerequisites: ["05_write_address_channel"]
visualIds: ["wf-axi-write-channels"]
exerciseIds: ["ex-axi-channels-2"]
glossaryTerms: ["WDATA", "WSTRB", "WLAST", "WVALID", "WREADY", "WID"]
checklistIds: []
---

A write transaction also carries its payload on the Write Data (W) channel. Because AW and W are independently handshaken, W data can reach an interface before, with, or after the matching AW request.

All signals on this channel begin with the prefix `W`.

## Handshake Signals

*   **`WVALID`** (Master -> Slave): The master drives this HIGH when valid write data is on the bus. It must not wait for `WREADY`.
*   **`WREADY`** (Slave -> Master): The slave drives this HIGH when it can accept the write data.

*Note: The W handshake can occur before, with, or after AW. A destination is not required to accept early W data: it may keep `WREADY` LOW. If it does accept W before AW, it must buffer and later associate that data with the correct transaction.*

Inspect the stalled cycles below. The first W beat is accepted before AW, while the second beat must hold the entire payload—`WDATA`, `WSTRB`, `WLAST`, and `WUSER` when present—stable until `WREADY` returns.

![AXI4 write waveform showing W data before AW acceptance and stable payload during backpressure](visual:wf-axi-write-channels)

## Data Payload Signals

*   **`WDATA`** (Write Data): The actual payload. The bus width is typically 32, 64, 128, 256, 512, or 1024 bits wide.
*   **`WSTRB`** (Write Strobes): One strobe bit for every byte lane in `WDATA`. An asserted bit qualifies that byte for update and must be consistent with the byte lanes selected by the start address and `AWSIZE`.
*   **`WLAST`** (Write Last): The master asserts `WLAST` on the transfer that becomes accepted beat `AWLEN + 1`. Stalled clock cycles do not advance the beat count.

## The Missing Signal: WID (AXI3 vs AXI4)

If you are working with AXI3, you will see a **`WID`** (Write ID) signal on this channel. In AXI3, masters were allowed to interleave write data from different transactions. For example, if transaction A and transaction B were both writing bursts, the master could send Beat A1, Beat B1, Beat A2, Beat B2. `WID` was used to identify which transaction each beat belonged to.

In practice, data interleaving made slave and interconnect designs excessively complex and created timing bottlenecks. 

**In AXI4, `WID` was completely removed.** AXI4 requires write data for successive transactions to follow write-address order. You cannot interleave write-data bursts. Because the W stream follows that order, the slave no longer needs a `WID` tag on every beat.
