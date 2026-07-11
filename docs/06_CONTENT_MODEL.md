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
