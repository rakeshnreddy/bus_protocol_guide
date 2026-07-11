---
id: "44_axi_interview_recap"
tier: "3"
level: "advanced"
protocol: "axi"
title: "AXI Interview and Work-Use Recap"
section: "H"
order: 44
exerciseIds: []
---

# AXI Interview and Work-Use Recap

Congratulations. You have completed the AXI Curriculum. If you have internalized the concepts in this section, you understand AXI better than 90% of working RTL designers and DV engineers.

Here is what you need to remember for your next interview, or your next chip tapeout:

## For Interviews

1. **How is AXI different from AHB?**
   "AXI has five independent, decoupled channels. AHB is a shared bus with a strict pipeline. AXI allows out-of-order completion based on transaction IDs; AHB must return data in the exact order it was requested."

2. **What is the golden rule of AXI ordering?**
   "Transactions with different IDs can complete in any order. Transactions with the same ID must complete in order."

3. **What is a 4KB boundary and why does AXI care?**
   "A burst cannot cross a 4KB boundary to prevent it from accidentally crossing from one slave's physical memory region into another slave's region."

4. **How does an AXI write work?**
   "The master issues the address on AW. The master streams the data on W, asserting WLAST on the final beat. The slave returns a single response on B."

## For Daily Verification Work

1. **Your Scoreboard:** If your scoreboard is keyed by Address, it is broken. Key it by ID, and support out-of-order returns.
2. **Your Assertions:** Ensure `WLAST`/`RLAST` timing is strictly checked. Ensure `READY`/`VALID` stability is continuously verified.
3. **Your Stimulus:** Don't just run linear traffic. Force the queues full. Re-use IDs to force in-order resolution. Use unique IDs to force out-of-order resolution. Randomize `READY` backpressure aggressively to catch FIFO edge cases.

You are now ready to verify the most complex interconnects in the industry.
