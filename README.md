# Bus Protocol DV Academy

A visual-first, local-first academy for learning and verifying Arm AMBA AHB and AXI protocols.

## Release status

`v1.0.0-rc.1` contains the complete AHB and AXI curriculum:

- 88 lessons: 6 Foundations, 38 AHB, and 44 AXI
- 88 production visuals
- 16 diagnostic labs
- light, dark, and system themes
- responsive desktop and mobile navigation
- protocol-accuracy, content-integrity, interaction, and accessibility regression coverage

APB curriculum is intentionally out of scope.

## Local development

Node.js 22 or newer is required.

```bash
npm ci
npm run dev
```

The development server prints the local URL.

## Verification

```bash
npm run verify
```

This runs the complete Vitest suite followed by the TypeScript and Vite production build.

Run the deterministic synthetic learner sessions separately:

```bash
npm run pilot:simulate
```

The simulations verify recovery paths and pilot scoring, but they do not replace
the real learner sessions required for the stable release decision.

Validate and aggregate privacy-safe real or synthetic session JSON:

```bash
npm run pilot:aggregate -- pilot-sessions/P01.json pilot-sessions/P02.json pilot-sessions/P03.json
```

The aggregator fails closed on incomplete or privacy-unsafe records. Synthetic
or mixed evidence is always reported as release-ineligible. See
`docs/LEARNER_PILOT_DATA_FORMAT.md` for the format and decision rules.

## Production deployment

The application is a Vite single-page application. `vercel.json` preserves client-side routing when a learner opens a lesson, visual, glossary, or reference URL directly.

Production: [busprotocolguide.vercel.app](https://busprotocolguide.vercel.app)

## Protocol evidence

Curriculum corrections and regression evidence are tracked in:

- `docs/AUDIT_REMEDIATION_TRACKER.md`
- `docs/AHB_AXI_VISUAL_COMPLETION_TRACKER.md`
- `docs/CODING_AGENT_HANDOFF.md`
- `docs/RELEASE_SECURITY_REVIEW.md`
- `docs/LEARNER_PILOT_PLAN.md`
- `docs/LEARNER_PILOT_FACILITATOR_GUIDE.md`
- `docs/LEARNER_PILOT_DATA_FORMAT.md`

Primary protocol sources are Arm IHI 0011A, IHI 0033B.b, IHI 0022H, and IHI 0051B.
