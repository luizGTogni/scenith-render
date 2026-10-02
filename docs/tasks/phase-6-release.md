# Phase 6 — v1.0

**Goal:** a stable, documented public release.

**Exit criteria:** all `@kairon-render/*` packages published at 1.0.0 under MIT;
public API locked by an API report in CI; docs and examples complete.

| ID | Title | Type | Size | Depends on | Status |
|----|-------|------|------|------------|--------|
| P6-01 | Legal review of license, FFmpeg and naming policies | adr | S | — | todo |
| P6-02 | Public API audit and reference docs | docs | M | — | todo |
| P6-03 | API freeze: API report in CI | infra | M | P6-02 | todo |
| P6-04 | Error code catalog page | docs | S | P0-13 | todo |
| P6-05 | Examples and templates | docs | M | — | todo |
| P6-06 | Versioning and upgrade policy | docs | S | P1-01 | todo |
| P6-07 | Release pipeline | infra | M | P6-03 | todo |
| P6-08 | Release v1.0.0 | infra | S | P6-01, P6-02, P6-03, P6-04, P6-05, P6-06, P6-07 | todo |

---

### P6-01 · Legal review of license, FFmpeg and naming policies
- **Type:** adr · **Size:** S
- **Refs:** [11](../11-legal-and-clean-room.md), [ADR 0007](../decisions/0007-mit-license.md), [ADR 0008](../decisions/0008-ffmpeg-not-bundled.md), [ADR 0010](../decisions/0010-own-api-vocabulary.md)
- **Also cover:** the trademark/prior-use risk found informally in
  [P0-12](phase-0-foundation.md) — an established open-source "Kairon"
  conversational-AI platform (digiteinfotech/NimbleWork) predates us, and
  `@kairon` was already taken on npm by a third, unrelated product
  (`heykairon`). A real USPTO/EUIPO and common-law search is needed before
  any public launch, trademark filing or domain purchase.
- **Done when:** [ ] a lawyer reviewed the three policies and the naming
  risk above; [ ] findings recorded as an ADR (or "no changes").

### P6-02 · Public API audit and reference docs
- **Type:** docs · **Size:** M
- **Done when:** [ ] every public export checked against the naming policy and [09](../09-api-design.md); [ ] TypeDoc reference generated; [ ] [09](../09-api-design.md) matches the code.

### P6-03 · API freeze: API report in CI
- **Type:** infra · **Size:** M
- **Depends on:** P6-02
- **Done when:** [ ] API report per package committed; [ ] CI fails on unreviewed public API changes.

### P6-04 · Error code catalog page
- **Type:** docs · **Size:** S
- **Depends on:** P0-13
- **Done when:** [ ] page generated from the code catalog: code, meaning, hint.

### P6-05 · Examples and templates
- **Type:** docs · **Size:** M
- **Done when:** [ ] vertical short with captions and music; [ ] promo with video and transitions; [ ] custom clip type project; [ ] each renders in CI.

### P6-06 · Versioning and upgrade policy
- **Type:** docs · **Size:** S
- **Depends on:** P1-01
- **Done when:** [ ] semver rules for packages; [ ] scene version support window; [ ] supported Node, FFmpeg and Chromium versions.

### P6-07 · Release pipeline
- **Type:** infra · **Size:** M
- **Depends on:** P6-03
- **Done when:** [ ] Changesets publishes all packages with npm provenance; [ ] prebuilt standard runtime included in `@kairon-render/renderer`; [ ] smoke test installs from the registry and renders a scene.

### P6-08 · Release v1.0.0
- **Type:** infra · **Size:** S
- **Depends on:** P6-01, P6-02, P6-03, P6-04, P6-05, P6-06, P6-07
- **Done when:** [ ] 1.0.0 published; [ ] release notes; [ ] README status updated.
