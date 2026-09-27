# Changelog

All notable changes to IMBONIX are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/),
and versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Minimal homepage and navigation

- The homepage makes one argument in three tabs that follow the Track 2 brief: the gap (included but not resilient),
  the evidence from NISR data on poverty, income and access, and the impact for households, policymakers and civil
  society.
- Its charts show published findings from the EICV7 Poverty Profile 2023/24, the FinScope Survey 2024, the EICV7 VUP
  tables, DHS 2025 and NISR's poverty and social protection page. Province figures are IMBONIX calculations from the 30
  district rates, weighted by population, and are labelled as such; over all districts the method reproduces the
  published national rates.
- Fixed: the homepage no longer shows assumed values. Payment timeliness, account use by wealth and the province
  comparison come from published tables. The financial health chart uses the FinScope 2024 segments (10% healthy,
  57% coping, 31% vulnerable, 3% extremely vulnerable), and the targets chart uses the baselines and targets of the
  National Financial Inclusion Roadmap 2025 to 2030 and NST2. The "Illustrative data" status was removed.
- Fixed: the homepage key figures form a valid description list for screen readers.
- The header links only the three focus areas and Data & methods; site search was removed. The footer shows the logo
  and version; the statement of independence is on the Data & methods page and the boundary credit on the map.
- Fixed: screen reader tables no longer widen the page on phones.

### Repository

- This repository became the project's official home on 27 September 2026. The code was brought in from the team's
  earlier working repository in stages, one branch per area, and all further work happens here.
- Branches: `main` (production, protected, changed only by pull request from `testing`), `testing` (integration),
  `develop` (development), and `feature/*`, `fix/*`, `security/*`, `docs/*` and `chore/*` for work in progress. CI runs
  on all of them, and Dependabot targets `develop`.
- The published extracts moved from `research/data-sources/extracts/` to `data/extracts/`, beside the dictionaries and
  schemas, and the research notes moved into `docs/data/` and `docs/research/`. The top level is now `apps`, `data`,
  `docs`, `scripts` and `.github`.
- Removed unused code (the navigation menu component and its package, an unused catalog module and PNG logo) and the
  empty placeholder folders under `ml/`, `data/`, `research/`, `docs/` and `scripts/`.

### Brand and design

- One colour palette derived from the logo (`lib/palette.ts`), used for the interface, the maps and the charts. The
  terracotta, purple, orange and green scales are replaced by logo-derived gold, blue, cyan, navy, azure, steel, teal and
  slate scales, each validated for colour-vision deficiencies. A test enforces the palette.
- The logo redrawn as vector files: emblem, wordmark with the gauge O and gradient X, tagline, lockups, a favicon mark,
  and regenerated favicon, touch and app icons (with a maskable icon).
- Site search across pages, districts, measures and all 416 sectors, and breadcrumbs on every page.
- A cleaner, more professional look: blurred colour blobs and decorative gradients replaced by solid logo colours and
  crisp motifs (the logo's ring and rising bars); the homepage hero and map card rebuilt.
- Accessibility checked again: no axe violations at 320, 390 and 1440px and no horizontal overflow from 320 to 1440px.

## 1.0.0 (27 September 2026, in the earlier working repository)

The first release: a working product on published NISR data, with a tested API, CI and production Docker images. It has
not been deployed to a public host yet.

### Web app

- Homepage that leads with the value proposition, platform counts, a guide to all nine tools and a data-to-decisions
  pipeline, alongside the evidence on poverty, exclusion, nutrition, shocks, usage and social protection.
- Resilience map with 25 measures in 8 dimensions: an interactive MapLibre map that zooms to a district's sectors
  (416 in all), with an SVG fallback and shareable links.
- 30 district profiles, a national dashboard, vulnerability analysis, access vs use, social protection, intervention
  priorities (seven levers with stated rules), a scenario simulator and the design of an explainable model.
- Every value labelled with its source, table, year and status; confidence intervals where NISR publishes them.
- Loading, error and not-found states; a `/api/health` endpoint; a Content Security Policy and security headers.
- IMBONIX brand throughout: light and dark logo lockups, favicon and app icons.
- Accessibility: no axe (WCAG 2.1 A and AA) violations on any page at 320, 390 and 1440px, no horizontal overflow at
  widths from 320 to 1440px, keyboard-scrollable tables, and colour palettes checked for colour-vision deficiencies.

### API

- Read-only `/api/v1` endpoints for indicators, districts and sectors, with provenance on every value.
- zod validation, a consistent `{ data, meta }` / `{ error }` shape, rate limiting, a CORS allow-list, helmet headers,
  request ids, structured JSON logs, graceful shutdown and a `/health` check.

### Data

- District extracts from 12 NISR and partner publications (64 indicators) and all 416 sectors, rebuilt into the website
  data by `scripts/data/build_web_data.py`; CI checks that the committed data matches a fresh build exactly.

### Engineering

- Next.js 15.5 and React 19 (moving off Next.js 14.2.30, which had one critical and four high advisories); `npm audit`
  reports 0 vulnerabilities in both apps.
- 45 web unit tests, 38 API tests and 13 data tests.
- GitHub Actions: formatting, lint, types, tests, build, dependency audit, gitleaks secret scan, and a Docker build that
  starts both images and waits for their health checks. Dependabot, CODEOWNERS, issue and pull request templates.
- Dockerfiles for the web app and API, and `docker-compose.yml`.
- Documentation: README, architecture, data model, API, deployment, security, development and contribution guides.

