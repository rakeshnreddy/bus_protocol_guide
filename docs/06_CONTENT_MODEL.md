# Content Model Specification

## Purpose

The app should treat educational content as structured data, not as ad hoc page code.
This allows deep curriculum expansion without making the UI difficult to maintain.

## Content Types

### 1. Lesson
Each lesson should have:
- `id`
- `title`
- `protocol`
- `tier`
- `level`
- `summary`
- `tags`
- `prerequisites`
- `relatedLessons`
- `visualIds`
- `exerciseIds`
- `glossaryTerms`
- `checklistIds`

The lesson body should be markdown.

### 2. Visual
Each visual should have:
- `id`
- `type`
- `title`
- `protocol`
- `description`
- `dataFile`
- `relatedLessons`
- `learningGoal`

### 3. Exercise
Each exercise should have:
- `id`
- `type`
- `difficulty`
- `prompt`
- `expectedTakeaway`
- `relatedLessons`

Supported exercise types are:

- `multiple-choice`, with `options` and `correctOptionIndex`
- `reflection` or `short-answer`
- `diagnostic-lab`, for evidence-based verification and debug practice

A `diagnostic-lab` also requires:

- `title`
- `protocolScope`
- `learnerQuestion`
- `scenario`
- `evidence.caption`
- unique `evidence.columns[].key` values
- unique `evidence.rows[].id` values, with one non-empty value for every column
- two or more `diagnosisSteps`, each with a unique ID, prompt, options, one resolvable `correctOptionId`, and an explanation

Production diagnostic labs use the three-step IDs `locate`, `own`, and `verify`. They should identify the first decisive protocol edge, assign transaction or component ownership, and state the evidence a checker or scoreboard must retain. Configured liveness and implementation policy must be labeled separately from mandatory protocol safety.

The production loader normalizes missing legacy `difficulty` and `relatedLessons` fields and maps historical `explanation` text to `expectedTakeaway`. It rejects malformed exercises without preventing valid records in the same corpus from loading.

### 4. Glossary Entry
Each glossary item should have:
- `term`
- `expandedForm`
- `definition`
- `protocolScope`
- `relatedSignals`
- `relatedLessons`

### 5. Checklist
Each checklist should have:
- `id`
- `title`
- `protocol`
- `items`
- `status`
- `notes`

## Content Organization

Suggested structure:

```text
content/
├── lessons/
│   ├── foundations/
│   ├── ahb/
│   └── axi/
├── visuals/
│   ├── waveforms/
│   ├── timelines/
│   ├── topologies/
│   ├── coverage/
│   └── properties/
├── exercises/
├── glossary/
└── checklists/
```

## Authoring Rule

No lesson should hardcode visual behavior directly in JSX unless absolutely necessary.
The preferred model is:
- lesson markdown references visual IDs
- visual IDs resolve to typed JSON config
- React components render the visual from that config

This preserves scalability and keeps the site maintainable as protocol coverage grows.
