# Phase 0: Bootstrap Implementation Notes

## What was moved
- The original planning markdown files (`00_` through `11_`) and the master tracker (`12_PHASED_EXECUTION_TRACKER.md`) have been safely moved to the `docs/` directory to keep the root repository clean.
- `12_PHASED_EXECUTION_TRACKER.md` is now the official execution control document.

## How to use the Phased Execution Tracker
- This tracker dictates the exact sequence of implementation. 
- It must be used as a guardrail against messy implementation, ensuring that prerequisites are satisfied before moving on to advanced feature work.
- Use it to truthfully track task progress, record important architectural decisions, and log blockers.

## Current Phase Status
- **Phase 0 (Bootstrap and Repository Setup):** **COMPLETE.** The repo is organized, the Vite + React app skeleton exists, routes are in place, and the foundational markdown parsing logic is prepared. The tracker has been updated to reflect this completion.
- **Phase 1 (Content Foundation and Shared Models):** **NOT STARTED.** This is the next target phase. It focuses on finalizing content schemas, building robust markdown/content loaders, and seeding sample data before any complex visuals are built.

## What structure was created
- **`content/`**: Scaffolding for the local content model, with directories for `lessons/` (foundations, ahb, axi), `visuals/` (waveforms, timelines, topologies, coverage, properties), `exercises/`, `glossary/`, and `checklists/`. 
- **`src/`**: Scaffolded the React app architecture into `app/`, `components/`, `features/`, `pages/`, `lib/`, `styles/`, and `types/`.
- **`src/types/content.ts`**: Basic TypeScript definitions for our metadata and content shape (Lessons, Visuals, Glossary, etc.).
- **`src/lib/markdown.ts`**: A simple front-matter parsing utility.
- **Routing**: Setup `react-router-dom` with a placeholder App Shell and basic routes (`/`, `/foundations`, `/ahb`, `/axi`, `/visuals`, `/glossary`).

## Assumptions Made
- We are relying on Vite's `?raw` string import capability combined with `front-matter` to parse markdown. This avoids overly complex Webpack/Vite plugin setups in the short term, ensuring content is highly readable and easy to structure.
- Styling uses basic global CSS variables (`src/styles/global.css`) for a minimal, clean theme.

## What remains intentionally unimplemented in Phase 0
- **Full Markdown Rendering**: We haven't implemented a fully-fledged markdown renderer (e.g., `react-markdown` with syntax highlighting). We only setup the data models and parser.
- **Advanced Visuals**: The waveform, topology, and timeline viewers are intentionally left for Phase 2.
- **Full Content Loading**: We haven't built the engine to dynamically list and aggregate all lessons. Only a dummy `01_intro.md` file was placed to prove the folder structure.

## Next Recommended Step
Move into **Phase 1: Content Foundation and Shared Models** by:
1. Finalizing all metadata schemas for content.
2. Building a comprehensive Content Aggregator to load these items into the application state.
3. Seeding the required sample data so UI components have something to render against in Phase 2.
