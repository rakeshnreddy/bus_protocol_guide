# v1.0.0-rc.1 Release Security Review

Reviewed: 2026-07-25

## Dependency audit

The release-candidate dependency refresh updates the resolved PostCSS package to 8.5.23, above the affected `<=8.5.17` range for GHSA-r28c-9q8g-f849.

`npm audit` also reports GHSA-qwww-vcr4-c8h2 against React Router 7.18.1. GitHub's advisory states that the issue affects only applications using React Router's unstable React Server Components APIs. Bus Protocol DV Academy is a static Vite single-page application using `BrowserRouter`; it has no server actions, RSC router, `createCallServer`, or unstable RSC API. The advisory is therefore not reachable in this deployment architecture.

Downgrading to React Router 7.11.0 is not an acceptable mitigation because that version falls within the ranges of multiple older router advisories. The project remains pinned to 7.18.1 until a patched compatible release is published.

## Release controls

- `src/release-readiness.test.ts` guards the static `BrowserRouter` architecture and rejects known unstable RSC API markers.
- The Vercel deployment serves only the Vite static output.
- No backend, server action, authentication flow, or user-submitted content is present.
- Re-run `npm audit` before promoting `v1.0.0-rc.1` to `v1.0.0`.
- Upgrade React Router and remove this temporary disposition as soon as a compatible patched release is available.
