# Phase 7 Expansion Plan

## 0. Prerequisite: Critical Audit Fixes (Phase 6.5)
Before any new expansion content is generated, the Critical issues identified in `docs/13_POST_LAUNCH_AUDIT.md` must be addressed. Building on top of a broken foundation will only compound technical debt.
*   **TypeScript Build Failure:** Resolve all compilation errors so that `npm run build` succeeds.
*   **AXI Lesson Numbering Drift:** Clean up the duplicate `01_axi_intro.md` / `01_what_is_axi.md` files and re-sync the file structure with the AXI Curriculum Map.
*   **Missing Cross-Links in Quick Reference:** Implement bi-directional linking from the `AHBSignals` and `AXISignals` pages back to their source lessons.

## 1. Candidate Protocols for Expansion
With AHB and AXI covered, the following protocols are the logical next steps:

*   **APB (Advanced Peripheral Bus):** 
    *   **Rationale:** Highly recommended as the immediate next protocol. APB has already been referenced conceptually in both AHB and AXI tracks (e.g., AHB-to-APB bridges, AXI4-Lite comparisons). It is simpler than AHB/AXI but ubiquitous for peripheral configuration interfaces.
    *   **Sequencing:** It naturally builds upon the "bridge" concepts and allows for a comprehensive "System Topology" view showing AXI interconnecting to AHB domains which then bridge to APB peripherals.
*   **ACE / CHI (Coherency Extensions / Coherent Hub Interface):**
    *   **Rationale:** A logical stretch goal. Once a learner masters AXI, system-level cache coherency is the ultimate advanced topic.
    *   **Sequencing:** Should only be tackled after APB and after the advanced visual tools (below) are built, as coherency states (MOESI, etc.) and snoop transactions are highly complex and require strong visual support.

## 2. Advanced Visual Components (Deferred from Earlier Phases)
The following interactive components were deferred but are critical for reaching the "expert verification" goal:

*   **CoverageMap (`src/components/visuals/CoverageMap.tsx`):**
    *   **Purpose:** Visualizes a multi-dimensional functional coverage space (e.g., Burst Type × Length × Response).
    *   **Data Model:** Requires a matrix/grid data structure representing coverage bins, hit counts, and coverage holes.
    *   **Benefits:** Will heavily enhance the Section G (Verification) lessons for both AHB and AXI by showing learners *exactly* what "coverage closure" looks like interactively.
*   **FormalPropertyPlayground (`src/components/visuals/FormalPropertyPlayground.tsx`):**
    *   **Purpose:** Allows learners to toggle signal behaviors in a mini-waveform to see if a formal assertion (e.g., `SVA`) passes or fails.
    *   **Data Model:** Requires an SVA string definition, a set of waveform states, and a lightweight evaluator logic that flags violations at specific cycles.
    *   **Benefits:** Crucial for the Section G (Formal Verification) lessons to bridge the gap between abstract properties and concrete waveform violations.
*   **SpecRuleExplorer (`src/components/visuals/SpecRuleExplorer.tsx`):**
    *   **Purpose:** A searchable, filterable index of "shall/must" rules directly tied to common bug patterns.
    *   **Data Model:** Requires a database of spec clauses, violation examples, and linked bug patterns.
    *   **Benefits:** Replaces the static lists in the "Common RTL Bugs" and "Expert Checklist" review lessons with a dynamic, highly scannable tool.

## 3. Structural Cleanup (Moderate Audit Findings)
These moderate-severity issues from the audit should be rolled into a Phase 7.0 cleanup step:
*   **Mobile SVG Targets:** Enlarge clickable touch targets inside `WaveformVisualizer` to meet 44x44px standards for mobile usability.
*   **Knowledge Leaks:** Revise AHB Section B and C lessons to gently foreshadow `HREADY` without assuming full pipeline knowledge, deferring the deep dive strictly to Section D.
*   **Visual Density:** Enhance `TopologyViewer` with interactive tooltips or highlighting so it is less static.
*   **Glossary Depth:** Expand the glossary definitions for complex AXI sideband signals (`AxUSER`, `AxPROT`, `AxCACHE`).

## 4. Proposed Phase 7 Breakdown

*   **Phase 7.0: Cleanup & Prerequisite Fixes:**
    *   Address all Critical and Moderate findings from `docs/13_POST_LAUNCH_AUDIT.md`.
*   **Phase 7.1: Advanced Visual Tools:**
    *   Build and integrate `CoverageMap`, `FormalPropertyPlayground`, and `SpecRuleExplorer`.
*   **Phase 7.2: APB Curriculum:**
    *   Section A & B: Orientation and Signals.
    *   Section C & D: Operating States (Setup, Access) and Timing.
    *   Section E & F: Bridges and Verification.
*   **Phase 7.3: System-Level Topology & Cross-Protocol Comparisons:**
    *   Lessons connecting AXI, AHB, and APB together in a single SoM/SoC context.

## 5. Explicit Non-Goals
To maintain project focus and adhere to the original architecture scope, the following are explicitly out of scope for Phase 7:
*   **Backend / Server / Database:** The app remains 100% static, client-side, and local-only.
*   **User Accounts / Auth:** No logins, multi-user progress tracking, or social features.
*   **Analytics / Telemetry:** No tracking. The tool respects privacy and operates entirely within the learner's browser.
