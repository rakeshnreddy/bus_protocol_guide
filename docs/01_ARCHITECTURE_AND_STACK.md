# Architecture and Technology Stack

## Architecture Decision Summary

Phase 1 should be a fully local, static-first single-page application.
This keeps implementation simple, portable, and ideal for iterative content development while avoiding unnecessary backend complexity.

## Recommended Stack

### Frontend
- React
- Vite
- TypeScript
- React Router

### Styling and UI
- Tailwind CSS for fast, consistent, utility-driven styling
- CSS variables for theme tokens and visualization color systems
- A small internal design system rather than a heavy component framework

### Content Rendering
- Markdown lesson files with frontmatter
- JSON configuration for visuals, exercises, glossary items, and protocol metadata
- MDX only if interactive content embedding becomes significantly easier with it; otherwise plain markdown is preferable for simplicity

### Visualization Layer
- SVG-based custom React components for waveforms and timelines
- D3 or Visx only where custom scaling, interaction, or layout benefits from it
- React Flow or a lightweight graph rendering approach for topologies and interconnect maps

### State Management
- Local component state for most UI
- Zustand for lightweight app-level state only if needed
- localStorage for optional single-user progress, bookmarks, and notes

## Why This Stack Fits

This stack is appropriate because the product is:
- Content-heavy
- Visualization-heavy
- Locally runnable
- Iteratively expandable
- Best served by type-safe front-end architecture

React + TypeScript supports reusable interactive learning components.
Vite keeps iteration fast.
Markdown + JSON keeps content maintainable and separable from UI code.

## Content and App Separation

The project should be split into three layers:

1. App shell
- Routing
- Layout
- Navigation
- Search
- Theme
- Lesson rendering

2. Content layer
- Markdown lesson text
- JSON visual datasets
- Exercises and quizzes
- Glossary and acronym definitions
- Coverage checklists

3. Visualization layer
- Waveform visualizer
- Transaction timeline
- Topology viewer
- Coverage map
- Property playground

This separation allows content growth without destabilizing the app shell.

## Local-Only Decisions

For the current phase:
- No backend
- No API dependency for core functionality
- No auth
- No server persistence
- No collaborative editing

Everything necessary to read, learn, and navigate should work entirely from the local project build.

## Suggested Project Structure

```text
project-root/
├── docs/
├── content/
│   ├── lessons/
│   ├── visuals/
│   ├── exercises/
│   ├── glossary/
│   └── checklists/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── pages/
│   ├── lib/
│   ├── types/
│   └── styles/
├── public/
└── package.json
```

## Non-Goals for Phase 1

Do not add these yet:
- User accounts
- Cloud sync
- Multi-user collaboration
- CMS backend
- Analytics dashboard
- Content authoring UI

Those can be part of a later expansion plan once the curriculum and visual engine are stable.
