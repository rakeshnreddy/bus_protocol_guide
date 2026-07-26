# Learner Pilot Facilitator Guide

## Scope

Use this guide with the production release candidate at
[busprotocolguide.vercel.app](https://busprotocolguide.vercel.app). The pilot
tests whether learners can find, explain, and apply the completed Foundations,
AHB, and AXI material without protocol coaching.

Do not start APB work during this pilot. Do not collect participant names,
employer names, confidential design details, production addresses, or internal
waveforms. Assign pseudonymous participant IDs such as `P01`.

## Session setup

1. Copy `docs/LEARNER_PILOT_SESSION_TEMPLATE.md` for the participant.
2. Record the participant's experience band without identifying the person.
3. Start on the production home page in a clean browser session.
4. Let the learner navigate. Do not provide route names unless the learner is
   already blocked and the intervention is recorded.
5. Ask the learner to explain the evidence aloud. Do not correct the protocol
   answer until the task is scored.
6. Record hesitation, search terms, backtracking, and accessibility problems.
7. File each actionable observation using the learner-pilot finding template.
8. Convert the scored fields to the versioned JSON format in
   `docs/LEARNER_PILOT_DATA_FORMAT.md`, then run `npm run pilot:aggregate`.
   Keep raw participant files under the ignored `pilot-sessions/` directory.

## Task rubric

### Task 1 — Pipeline overlap versus outstanding transactions

- Learner question: What is the difference between AHB phase overlap and AXI
  outstanding transactions?
- Starting route: `/lesson/03_timing_diagrams`
- Scope: AMBA 5 AHB and AXI4.
- Correct evidence: AHB overlaps the address phase of a later transfer with the
  data/response phase of an earlier accepted transfer. AXI outstanding traffic
  means multiple independently accepted transactions remain in flight; IDs
  correlate responses and define ordering scope where the interface includes
  IDs. Phase overlap alone is not an outstanding-transaction count.
- Primary-source anchor: Arm IHI 0033B.b, transfer operation; Arm IHI 0022H,
  channel handshakes and transaction ordering.

### Task 2 — AHB wait-state ownership

- Learner question: During a wait, which transfer owns the data/response phase
  and what happens to the visible following address?
- Starting route: `/lesson/16_wait_states_hready`
- Scope: AMBA 5 AHB.
- Correct evidence: global `HREADY=0` extends the current data/response phase.
  The following valid address/control can be visible but is pending and not
  accepted; its complete context remains stable. The data/response owner is the
  earlier accepted address phase, not the currently visible pending address.
- Primary-source anchor: Arm IHI 0033B.b, transfer operation and wait states.

### Task 3 — AHB 1 KB boundary

- Learner question: Does a four-beat, four-byte INCR burst starting at `0x3F4`
  remain in one 1 KB region?
- Starting route: `/lesson/16_wait_states_hready`
- Interaction: use the AHB accepted-phase checker calculator.
- Correct evidence: the addresses are `0x3F4`, `0x3F8`, `0x3FC`, and `0x400`;
  the final transferred byte is `0x403`. The request crosses from region
  `0x000–0x3FF` to `0x400–0x7FF`, so one AHB burst cannot represent it. A
  request generator can split the work into three beats below the boundary and
  one new transfer at `0x400`.
- Primary-source anchor: Arm IHI 0033B.b, burst boundary rule.

### Task 4 — AXI4 write-response prerequisites

- Learner question: When may a subordinate assert `BVALID`, and what changes
  when write data arrives before the write address?
- Starting route: `/lesson/13_write_transaction_walkthrough`
- Scope: AXI4. Do not apply the AXI4 address prerequisite to AXI3.
- Correct evidence: AXI4 `BVALID` follows acceptance of the applicable AW and
  acceptance of the final W transfer. It must not depend on `BREADY`. A source
  can offer W before AW; a destination is not required to accept it early, but
  accepted early W data must be retained and associated with accepted write
  addresses in AXI4 AW order.
- Primary-source anchor: Arm IHI 0022H, write transaction dependencies and
  write-data ordering.

### Task 5 — Transaction-aware WLAST

- Learner question: Which accepted beat makes `WLAST` early or missing?
- Starting route: `/lesson/37_axi_formal_property_patterns`
- Scope: AXI4.
- Interaction: inspect the AWID 9, `AWLEN=2` transaction. Toggle `WLAST` on its
  second accepted beat to create an early-LAST failure, then select that cycle
  with pointer or focus plus Enter to read the diagnostic. Restore it and remove
  `WLAST` from the third accepted beat to create a missing-LAST failure.
- Correct evidence: `AWLEN=2` means three W transfers. Only accepted transfers
  advance the count; a stalled W offer does not. `WLAST` is LOW on accepted
  beats one and two and HIGH on accepted beat three.
- Primary-source anchor: Arm IHI 0022H, burst length and write-data channel.

### Task 6 — AXI lanes and 4 KB boundary

- Learner question: Which byte lanes are active for an unaligned first beat,
  and does the proposed burst stay in one 4 KB decode region?
- Starting route: `/lesson/25_4kb_boundary_rule`
- Interaction: use the AXI burst checker calculator.
- Correct evidence:
  - `0x1001`, four bytes, eight-byte data bus: first active-lane mask `0x0E`;
    the next INCR address is `0x1004` with mask `0xF0`.
  - `0x0FF8`, four beats, four bytes per beat: final byte `0x1007`,
    end-exclusive address `0x1008`, and a required two-beat plus two-beat split.
- Primary-source anchor: Arm IHI 0022H, unaligned transfers, byte strobes,
  burst addressing, and the 4 KB rule.

### Task 7 — Discovery

- Learner question: Can the learner recover an answer without knowing the
  curriculum location?
- Starting route: `/`
- Interaction: find the 4 KB rule through production search, then find the AXI
  burst checker through `/visuals`.
- Pass condition: both destinations are reached without facilitator navigation.

### Task 8 — Mobile repeat

- Learner question: Can a completed lesson-and-visual task be repeated at
  exactly 375 px width?
- Starting route: repeat Task 2, 5, or 6 at `375 × 812`.
- Pass condition: navigation remains usable; required controls are operable;
  the visual scrolls inside its container; text stays readable; and the page
  itself has no horizontal overflow.

## Scoring

- Protocol first-attempt score: correct first attempts for Tasks 1–6 divided by
  six.
- Navigation completion: Tasks 7 and 8 completed without facilitator action.
- Assistance is any protocol hint, route instruction, control instruction, or
  direct answer. Record the exact intervention.
- A participant passes the protocol criterion at five correct first attempts
  out of six. The aggregate release criterion remains at least 80%.

## Severity

- Release blocker: can teach a wrong protocol conclusion, blocks a required
  route or interaction, loses content, or prevents an accessibility-dependent
  participant from completing a required task.
- Important follow-up: causes repeated hesitation or an avoidable wrong turn
  but the learner can recover using existing content.
- Observation: polish or preference with no material effect on correctness,
  completion, or accessibility.

Do not downgrade a protocol-accuracy concern because only one participant found
it. Validate it against the applicable primary specification.
