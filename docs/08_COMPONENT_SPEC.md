# Component Specification

## Goal

Define the major reusable app components before implementation so the codebase remains consistent.

## Core App Components

### Layout Components
- AppShell
- TopNav
- SideNav
- LessonLayout
- SectionHeader
- Breadcrumbs

### Content Components
- LessonRenderer
- GlossaryTerm
- AcronymChip
- RelatedLinksPanel
- ChecklistPanel
- ReviewCard

### Visual Components
- WaveformVisualizer
- TransactionTimeline
- InterconnectTopologyViewer
- SignalExplorer
- SpecRuleExplorer
- CoverageMap
- FormalPropertyPlayground

### Utility Components
- SearchBar
- TagList
- DifficultyBadge
- ExpandablePanel
- CopySnippetButton
- NoteBox
- WarningBox
- BugPatternCard

## Component Design Rules

1. Components should be reusable across protocols.
2. Components should be data-driven through typed props.
3. Visual components should separate rendering logic from data preprocessing where possible.
4. Lesson rendering should remain content-first rather than turning every lesson into a custom page.
5. Accessibility should be built into components from the start.

## Minimum First-Build Priority

Implement in this order:
1. AppShell
2. LessonRenderer
3. WaveformVisualizer
4. TransactionTimeline
5. SideNav and lesson index components
6. GlossaryTerm and acronym helpers
7. Topology viewer
8. Coverage and formal visual tools

This order ensures the first usable version can render real content quickly.
