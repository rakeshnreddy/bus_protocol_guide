---
name: Bus Protocol DV Academy
description: A luminous engineering instrument for visual AMBA learning.
colors:
  brand: "oklch(0.56 0.19 251)"
  cyan: "oklch(0.68 0.14 210)"
  amber: "oklch(0.76 0.15 75)"
  canvas-light: "oklch(0.975 0.009 240)"
  surface-light: "oklch(0.995 0.004 240)"
  ink-light: "oklch(0.22 0.035 255)"
  canvas-dark: "oklch(0.145 0.025 255)"
  surface-dark: "oklch(0.195 0.028 255)"
  ink-dark: "oklch(0.91 0.018 242)"
  success: "oklch(0.55 0.14 155)"
  danger: "oklch(0.56 0.2 25)"
typography:
  display:
    fontFamily: "Avenir Next, Segoe UI Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(3rem, 6.4vw, 5.8rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Avenir Next, Segoe UI Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "SFMono-Regular, Cascadia Code, Roboto Mono, Consolas, monospace"
    fontSize: "0.72rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.08em"
rounded:
  control: "9px"
  card: "12px"
  feature: "16px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "11px 17px"
    height: "46px"
  card:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.card}"
    padding: "20px"
  chip:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.pill}"
    padding: "4px 9px"
---

# Design System: Bus Protocol DV Academy

## Overview

**Creative North Star: "The Luminous Protocol Bench"**

The academy feels like a carefully calibrated engineering instrument: precise, dense, and confidently navigable. Atmospheric grid fields and restrained glass establish place; crisp lesson and visual surfaces keep timing, direction, phase ownership, and verifier intent dominant.

The system is responsive rather than theatrical. Motion communicates state and hierarchy, never delays reading, and disappears under reduced-motion preferences.

**Key Characteristics:**

- Structural glass in navigation, toolbars, and overlays only.
- Crisp, bordered content surfaces with strong phase and protocol hierarchy.
- Equal-quality light and dark modes, with system preference as the default.
- Monospace reserved for signals, cycle counts, IDs, and compact labels.

## Colors

The palette combines cool engineering neutrals with bus-blue, timing-cyan, and caution-amber accents.

### Primary

- **Bus Blue:** Owns selected navigation, primary actions, address phases, and active inspection state.

### Secondary

- **Timing Cyan:** Marks signal flow, interactive traces, and informational emphasis.

### Tertiary

- **Sampling Amber:** Marks caution, sampling points, and protocol conditions requiring attention.

### Neutral

- **Cool Instrument Canvas:** The atmospheric page field in light and dark variants.
- **Crisp Work Surface:** Lesson prose, cards, waveform canvases, and reference content.
- **Protocol Ink:** High-contrast text and diagram labels in both themes.

**The Signal Priority Rule.** Accent colors must explain protocol meaning or state; decoration never competes with a waveform.

## Typography

**Display Font:** Avenir Next with Segoe UI and system fallbacks

**Body Font:** Avenir Next with Segoe UI and system fallbacks
**Label/Mono Font:** SFMono-Regular with Cascadia Code, Roboto Mono, and Consolas fallbacks

**Character:** The UI stack is calm and technical without becoming sterile. The mono stack turns signals, addresses, phases, and counts into a consistent instrumentation layer.

### Hierarchy

- **Display** (700, fluid, 0.98): Home and protocol statements only.
- **Headline** (700, fluid, 1.1): Lesson and tool titles.
- **Title** (650–750, 1–1.55rem, 1.25): Section and card ownership.
- **Body** (400, 1rem, 1.6–1.78): Explanations limited to roughly 74 characters per line.
- **Label** (700, 0.68–0.78rem, tracked uppercase): Signals, cycle counts, protocol codes, and metadata.

**The Mono With Purpose Rule.** Never set paragraphs or navigation titles in monospace; reserve it for machine-readable information.

## Elevation

Depth is structural: tonal layers and one-pixel borders establish most hierarchy. Soft ambient shadows appear on elevated cards, dropdowns, and navigation; glass blur is limited to the persistent shell and sticky controls.

### Shadow Vocabulary

- **Card ambient:** A low-contrast 8 × 24 px shadow for interactive visual and glossary surfaces.
- **Navigation ambient:** A broader 8 × 24 px shadow for drawers, search results, and structural overlays.

**The Crisp Content Rule.** Lesson prose and diagrams stay opaque and readable; never apply backdrop blur to every card.

## Components

### Buttons

- **Shape:** Compact, gently curved corners (9–10px) with at least 44 × 44 px targets.
- **Primary:** Bus Blue with white text and confident 700–750 weight.
- **Hover / Focus:** Small tonal shift or 2px lift; focus always uses a 3px cyan ring.
- **Secondary / Ghost:** Bordered neutral surface or transparent control-hover tone.

### Chips

- **Style:** Quiet neutral fill, one-pixel border, mono label, fully rounded silhouette.
- **State:** Selected filters use Bus Blue and never rely on color alone; `aria-pressed` conveys state.

### Cards / Containers

- **Corner Style:** 12px for content, 16px for feature surfaces.
- **Background:** Crisp opaque surfaces for learning content; translucent surfaces only for structural glass.
- **Shadow Strategy:** Ambient and restrained; borders carry hierarchy at rest.
- **Internal Padding:** 16–24px, increasing fluidly for feature regions.

### Inputs / Fields

- **Style:** 44px minimum height, one-pixel strong-neutral stroke, 8–10px corners, native theme-aware controls.
- **Focus:** Brand border plus visible 3px focus ring.
- **Error / Disabled:** Semantic tint plus text/icon state; never color-only.

### Navigation

The desktop curriculum is persistent and collapsible; mobile uses an off-canvas drawer below a two-row header. Active routes combine a tonal fill, readable text, and a slim positional marker. Lesson pages always expose protocol progress and previous/next continuity.

### Interactive Visual

Every visual sits on a crisp work surface with a title, concise description, contained horizontal scrolling, 44px interaction targets, and an annotation panel that explains the selected cycle, phase, signal, or route.

## Do's and Don'ts

### Do:

- **Do** use glass morphism for the navigation shell, search results, sticky filters, and overlays.
- **Do** preserve protocol meaning through labels, annotations, driver direction, and non-color state cues.
- **Do** maintain WCAG 2.2 AA contrast, visible focus, 44 × 44 px controls, and reduced-motion behavior.
- **Do** keep dense waveforms and topology diagrams inside their own horizontal scroll regions.

### Don't:

- **Don't** return to the bare documentation-shell appearance with flat white surfaces and little hierarchy.
- **Don't** create neon cyberpunk terminal themes that make every signal compete for attention.
- **Don't** use generic SaaS dashboards with decorative metric cards unrelated to the learning task.
- **Don't** put frosted-glass decoration on every container; lesson content stays crisp.
- **Don't** add motion that delays reading, loops continuously, or ignores reduced-motion preferences.
