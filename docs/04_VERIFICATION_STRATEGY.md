# Verification Strategy for the Guide

## Objective

The guide is not only about understanding protocol specifications.
It must also teach how to verify the protocol thoroughly in realistic projects.
That includes simulation, assertions, coverage, debug methodology, and formal reasoning.

## Verification Teaching Principles

1. Every protocol concept should include verification implications.
2. Simulation and formal should both be discussed where meaningful.
3. The guide should distinguish between toy verification and production-quality verification.
4. The guide should teach both what to test and how to think about testing.
5. Coverage closure should be treated as a first-class topic.

## Simulation Coverage in the Guide

For each major protocol feature, include:
- Directed scenarios
- Constrained-random scenarios
- Monitor expectations
- Scoreboard implications
- Assertion opportunities
- Functional coverage ideas
- Expected debug signatures in waveforms

### Simulation Topics to Cover
- BFMs vs full VIP
- Master/slave/monitor partitioning
- Sequence strategy
- Directed corner tests
- Randomization dimensions
- Error injection
- Interconnect stress
- Throughput stress
- Latency variation
- Response matching
- Reset and recovery behavior
- Coverage planning and hole analysis

## Formal Coverage in the Guide

Formal content should be practical and protocol-focused.
The user should learn what classes of properties fit bus protocols and how to avoid common mistakes.

### Formal Topics to Cover
- Safety vs liveness
- Assumptions vs assertions
- Environment modeling
- Deadlock and progress reasoning
- Data integrity
- Ordering guarantees
- Illegal state exclusion
- Bounded vs unbounded proofs
- Why some properties are difficult to prove without environment constraints

## Lesson-Level Verification Sections

Every substantial protocol lesson should contain:
- Simulation verification notes
- Assertion ideas
- Coverage ideas
- Formal reasoning notes where applicable

## Senior-Level Framing

The verification sections should explicitly answer:
- What usually escapes weak regressions?
- What bugs appear at SoC integration rather than block level?
- What combinations are easily forgotten in coverage models?
- Which properties are essential for trust in the design?
- What kind of waveform evidence points to root cause quickly?

## Verification Completeness Checklist

Per protocol, maintain a dedicated checklist covering:
- Signal legality
- Transaction legality
- Ordering correctness
- Error behavior
- Backpressure behavior
- Arbitration/fairness where relevant
- Burst boundary correctness
- Reset behavior
- Progress/liveness expectations
- Coverage closure expectations

This checklist should serve both as a learning tool and as a practical review tool for engineers.
