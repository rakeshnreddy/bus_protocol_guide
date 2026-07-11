# AXI Curriculum Map

## Objective

Deliver a complete expert-level AXI learning path covering AXI3, AXI4, AXI4-Lite, and AXI-Stream from basic channel intuition to advanced system integration and verification.

## Recommended Lesson Set

### Section A – Orientation
1. What AXI is and where it fits
2. AXI family variants and evolution
3. AXI terminology and acronym glossary
4. Five-channel mental model

### Section B – Signals by Channel
5. Write address channel
6. Write data channel
7. Write response channel
8. Read address channel
9. Read data channel
10. Sideband signals and attributes

### Section C – Handshake and Transaction Flow
11. Ready/valid in depth
12. Independent channel behavior
13. Write transaction walkthrough
14. Read transaction walkthrough
15. Burst structure and beat progression
16. WLAST and RLAST meaning

### Section D – Ordering and Performance
17. IDs and transaction matching
18. Outstanding transactions
19. Ordering guarantees
20. Out-of-order completion
21. Backpressure behavior
22. Throughput reasoning and bottlenecks

### Section E – Rules and Constraints
23. Burst types
24. Address alignment
25. 4KB boundary rule
26. Legal and illegal transaction patterns
27. AXI3 vs AXI4 differences
28. AXI4-Lite simplifications
29. AXI-Stream packet semantics

### Section F – Architecture
30. AXI interconnects and crossbars
31. Multi-master system reasoning
32. QoS and system-level traffic behavior
33. Bridges and mixed-protocol contexts

### Section G – Verification
34. AXI simulation strategy
35. AXI assertions and protocol checking
36. AXI functional coverage model
37. AXI formal property patterns
38. Common RTL and interconnect bugs
39. Debug case studies

### Section H – Review
40. AXI expert checklist
41. AXI signal quick reference
42. AXI ordering review pack
43. AXI waveform review pack
44. AXI interview and work-use recap

## Completion Standard

The AXI track is only complete when:
- every major channel and key sideband signal is covered
- ordering rules are explained deeply
- performance and backpressure are visualized clearly
- variant differences are explicit
- verification guidance is practical and realistic
- review material supports rapid on-the-job recall
