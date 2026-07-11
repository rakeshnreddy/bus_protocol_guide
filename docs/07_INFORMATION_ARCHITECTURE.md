# Information Architecture

## Navigation Goals

The app should support two different learning modes:
- Sequential curriculum learning
- Fast reference and revision during work

The information architecture should therefore support both deep study and quick lookup.

## Primary Sections

1. Home
2. Foundations
3. AHB
4. AXI
5. Visual Gallery
6. Glossary
7. Checklists
8. Revision

## Per-Protocol Structure

Each protocol section should have sub-navigation for:
- Overview
- Signals
- Timing
- Transactions
- Advanced Features
- Architecture Context
- Verification
- Debug and Pitfalls
- Review

## Cross-Linking Rules

Every lesson should link to:
- Prerequisite lessons
- Related signal definitions
- Related visuals
- Related verification topics
- Review/checklist pages

## Fast Lookup Features

The app should make it easy to quickly answer questions like:
- What does this signal do?
- What are legal HTRANS values?
- How does this burst behave?
- What does this AXI sideband signal mean?
- What should I verify for this feature?

To support that, search and glossary integration should be considered early in the design.

## Revision Routes

Add special revision-oriented routes later such as:
- all signals for AHB
- all signals for AXI
- all burst rules
- all ordering rules
- all formal property ideas
- all common bug patterns

This makes the site useful not only for deep learning but also as a working engineer reference.
