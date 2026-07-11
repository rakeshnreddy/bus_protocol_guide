# Curriculum Structure and Coverage Model

## Curriculum Philosophy

The curriculum must not jump straight into protocol names and signal lists.
It should first teach how senior DV engineers think about buses, timing, and transactions.
Only after those foundations are solid should protocol-specific material begin.

The curriculum is divided into layers so that understanding builds naturally from basic timing intuition to advanced architecture and verification reasoning.

## Tier 0 – Foundations

Purpose: teach protocol thinking before protocol details.

### Module Groups

1. Bus mental models
- What a bus is
- Why protocols exist
- Shared bus vs point-to-point vs switched interconnect
- Transaction vs beat vs burst vs packet
- Command, data, and sideband information

2. Signal thinking
- Clock edges
- Active-low and active-high conventions
- Sampling and stability
- Setup/hold intuition
- Valid windows
- Reset behavior

3. Timing diagrams
- How to read waveforms
- How to annotate cycles
- Distinguishing combinational dependence from sampled behavior
- Single-cycle vs pipelined timing

4. Handshakes and flow control
- Ready/valid
- Request/grant
- Pipelined address/data phases
- Backpressure
- Stalls
- Fairness and forward progress

5. Transaction structure
- Single transfer
- Burst transfer
- Ordered vs out-of-order completion
- Atomic/exclusive/locked behaviors
- Error responses

6. Senior DV verification mindset
- Corner-case discovery
- Illegal sequence thinking
- Ordering and progress guarantees
- Deadlock vs livelock
- Coverage closure thinking
- Debugging protocol failures from waveforms

## Tier 1 – AHB Track

Purpose: complete deep-dive into AHB, AHB-Lite, and AHB5.

### Major Lesson Areas

1. AHB family overview
2. AHB terminology and acronyms
3. Signal-by-signal breakdown
4. Transfer types and semantics
5. Burst behavior and address progression
6. HREADY/HREADYOUT and wait-state behavior
7. Pipelining and phase overlap
8. Arbitration and multi-master operation
9. Decoder, mux, and interconnect structure
10. Error handling and response timing
11. Locked and exclusive accesses
12. AHB-Lite simplifications
13. AHB5 advanced features
14. Bridge behavior, especially AHB-to-APB
15. Common RTL bugs and spec misunderstandings
16. Simulation verification strategy
17. Formal verification strategy
18. Coverage model and closure checklist
19. Debug case studies
20. Revision and expert cheat sheets

## Tier 2 – AXI Track

Purpose: complete deep-dive into AXI3, AXI4, AXI4-Lite, and AXI-Stream.

### Major Lesson Areas

1. AXI family overview
2. AXI terminology and acronyms
3. Five-channel mental model
4. Signal-by-signal breakdown per channel
5. Ready/valid semantics in depth
6. Burst types, lengths, and alignment
7. IDs, ordering, and outstanding transactions
8. Read and write path decoupling
9. Responses and error handling
10. Backpressure and throughput reasoning
11. AXI3 vs AXI4 differences
12. AXI4-Lite design intent and simplifications
13. AXI-Stream packet semantics
14. Interconnects, crossbars, and system topology
15. QoS, region, cache, protection, and sideband signaling
16. Common RTL bugs and integration failures
17. Simulation verification strategy
18. Formal verification strategy
19. Coverage model and closure checklist
20. Debug case studies and review aids

## Future Tier – Expansion

Reserved for later phases:
- APB
- ACE / ACE-Lite
- CHI
- Non-AMBA context modules if useful
- Cache coherency foundations
- NoC and advanced interconnect topics

## Lesson Template Standard

Each lesson should ideally include:
- Why this topic matters
- Definitions and acronym expansion
- Core concept explanation
- Signal-level behavior
- Timing/transaction examples
- Common mistakes
- Verification implications
- Visual aids
- Self-check questions
- Related lessons
- Quick review summary

## Completeness Rule

Every protocol track must maintain an explicit checklist document that answers:
- Have all signals been covered?
- Have all transaction types been covered?
- Have all timing rules been covered?
- Have all architectural contexts been covered?
- Have all important verification concerns been covered?
- Have common bugs and pitfalls been covered?

A track is not considered complete until the checklist is fully satisfied.
