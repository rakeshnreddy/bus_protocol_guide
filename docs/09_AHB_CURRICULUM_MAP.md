# AHB Curriculum Map

## Objective

Deliver a complete expert-level AHB learning path covering AHB, AHB-Lite, and AHB5 from basic mental models to senior-level verification and integration concerns.

## Recommended Lesson Set

### Section A – Orientation
1. What AHB is and where it fits
2. AHB family variants and evolution
3. AHB terminology and acronym glossary

### Section B – Signals
4. Clock and reset
5. Address and control signals
6. Transfer type signals
7. Burst and size signals
8. Data and response signals
9. Lock, exclusive, and security-related signals

### Section C – Transfer Semantics
10. Single transfers
11. HTRANS semantics: IDLE, BUSY, NONSEQ, SEQ
12. Burst progression rules
13. Wrapping burst intuition
14. HSIZE and alignment

### Section D – Timing and Pipelining
15. Address phase and data phase
16. Wait states and HREADY/HREADYOUT
17. Multi-cycle examples
18. Throughput vs latency intuition

### Section E – Architecture
19. Arbiter behavior
20. Decoder and slave selection
21. Multi-master system behavior
22. AHB-Lite simplifications
23. AHB-to-APB bridge behavior

### Section F – Advanced Features
24. Error responses
25. Locked sequences
26. Exclusive accesses in AHB5
27. Secure vs non-secure concepts where applicable
28. Common AHB5 differences from older mental models

### Section G – Verification
29. AHB simulation strategy
30. AHB assertions and checkers
31. AHB functional coverage model
32. AHB formal property patterns
33. Common RTL and testbench bugs
34. Debug case studies

### Section H – Review
35. AHB expert checklist
36. AHB signal quick reference
37. AHB waveform review pack
38. AHB interview and work-use recap

## Completion Standard

The AHB track is only complete when:
- every public-facing signal is covered
- timing behavior is shown visually
- advanced features are included
- architecture context is explained
- verification guidance is practical
- review material supports day-to-day use
