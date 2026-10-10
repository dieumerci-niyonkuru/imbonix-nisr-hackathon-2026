<p align="center">
  <img src="apps/web/public/brand/imbonix-logo.svg" alt="IMBONIX: Data for Inclusive Prosperity" width="240">
</p>

<h1 align="center">IMBONIX</h1>

<p align="center">
  <strong>IMBONIX turns Rwanda's data into actionable intelligence for financial inclusion and poverty reduction.</strong><br>
  NISR 2026 Big Data Hackathon · Track 2: Financial Inclusion &amp; Poverty Reduction
</p>

<p align="center">
  <a href="https://github.com/dieumerci-niyonkuru/imbonix-nisr-hackathon-2026/actions/workflows/ci.yml"><img src="https://github.com/dieumerci-niyonkuru/imbonix-nisr-hackathon-2026/actions/workflows/ci.yml/badge.svg?branch=develop" alt="CI status of the develop branch"></a>
</p>

<p align="center">
  <a href="#for-judges">For judges</a> ·
  <a href="#getting-started">Getting started</a> ·
  <a href="docs/submission/solution-overview.md">Solution overview</a> ·
  <a href="docs/architecture.md">Architecture</a> ·
  <a href="docs/api.md">API</a> ·
  <a href="docs/deployment.md">Deployment</a> ·
  <a href="CONTRIBUTING.md">Contributing</a>
</p>

---

## Overview

Almost every Rwandan adult is counted as financially included (96% in FinScope 2024). Yet poverty, poor nutrition, natural
hazards and late social-protection payments are concentrated in different districts. A district that looks fine on one
measure can be among the worst on another.

IMBONIX puts NISR's published statistics side by side for all **30 districts** and **416 sectors**, so planners can see
where vulnerabilities overlap and which policy levers the evidence points to. Every number carries its source, table, year
and a status label, and uncertainty is shown wherever NISR publishes it.

IMBONIX is an independent team project. It is **not an official NISR product** and does not imply NISR endorsement.

## For judges

**→ [Submission package index](docs/submission/)** — the guided reading order. Or jump straight in:

- **[Solution overview](docs/submission/solution-overview.md)** — problem → solution → data & methodology → tech → design → impact → Vision 2050 / NST2 alignment, with a criterion-by-criterion scorecard.
- **[Demo script](docs/submission/demo-script.md)** — a 90-second pitch and a 3-minute, criterion-by-criterion walkthrough.
- **[IMBONIX AI](docs/ai-assistant.md)** — how the grounded, multilingual, multimodal assistant is built.
- **[AI-assistance disclosure](docs/submission/ai-disclosure.md)** — required by the rules: how AI tools were used, and the team's responsibility for every figure.
- **Live app:** _deploy and add the public URL here_ (see the [Vercel quickstart](docs/deployment.md#deploy-the-web-app-to-vercel-fastest)) · **Source:** this repository.

![The IMBONIX homepage](docs/screenshots/home.png)

## Site map

The site follows the three parts of the challenge. Each focus area has its own address, and its pages sit under it, so
the address says where you are. Earlier addresses (such as `/map` or `/dashboard`) redirect permanently.

| Menu                | Page                 | Address                                   | What it does                                                                                                                                                                  |
| ------------------- | -------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home                | Homepage             | `/`                                       | One argument in three tabs: the gap (96% included, 10% financially healthy), the evidence in NISR data, and the impact for households, policymakers and civil society.        |
| Financial exclusion | Overview             | `/financial-exclusion`                    | Inclusion by service, financial health, the access strand, mobile money and credit.                                                                                           |
|                     | Access and use       | `/financial-exclusion/access-and-use`     | FinScope's 96% inclusion against DHS 2025 account and mobile money use, by sex, age, residence, education and wealth.                                                         |
|                     | Risk model           | `/financial-exclusion/risk-model`         | The design of an explainable model of financial vulnerability; results appear only after it is trained on the microdata.                                                      |
| Poverty dynamics    | Overview             | `/poverty-dynamics`                       | Poverty in 2016/17 and 2023/24, where it is deepest, who is poorest and how households live.                                                                                  |
|                     | Trends               | `/poverty-dynamics/trends`                | Every census since 1978 and every EICV, DHS and LFS round: poverty by province, population, homes, services, health and work.                                                 |
|                     | District map         | `/poverty-dynamics/district-map`          | 28 measures on an interactive map; select a district to see its sectors. Links can be shared (`?layer=…&district=…`).                                                         |
|                     | District profiles    | `/districts`, `/districts/<name>`         | 30 profiles: priority, a year selector from 1978 to 2026, labour trends against the median district, every indicator with its confidence interval, and sectors.               |
|                     | Overlapping needs    | `/poverty-dynamics/overlapping-needs`     | Where poverty, financial exclusion, nutrition and shocks overlap, with correlations between districts.                                                                        |
| Social protection   | Overview             | `/social-protection`                      | Who VUP reaches, how late payments arrive and how far Rwanda is from its targets.                                                                                             |
|                     | VUP payments         | `/social-protection/vup-payments`         | Payment timeliness by programme and poverty status, payment channels, amounts and ten years of reports.                                                                       |
|                     | Priority districts   | `/social-protection/priority-districts`   | Seven policy levers, each tied to one indicator and a stated rule, showing which districts each lever flags and why.                                                          |
|                     | Policy scenarios     | `/social-protection/policy-scenarios`     | How many adults each district would need to reach for an inclusion target, and priorities under your own weights.                                                             |
|                     | Intervention planner | `/social-protection/intervention-planner` | Pick a problem, a group and a place to see the evidence and the options.                                                                                                      |
| Data                | Sources and methods  | `/data`                                   | Where every figure comes from, and how far to trust it.                                                                                                                       |
|                     | Key figures          | `/data/key-figures`                       | National inclusion, poverty trends and progress towards national targets.                                                                                                     |
|                     | Data catalogue       | `/data/catalog`                           | Every study in the NISR microdata catalogue, 1978 to today, searchable by theme, with the studies IMBONIX draws on flagged.                                                   |
|                     | Chart library        | `/data/chart-library`                     | Every chart and interactive tool on the site, grouped by focus area and page, with a filter.                                                                                  |
| About               | About                | `/about`                                  | Why IMBONIX exists, who it serves and how it works.                                                                                                                           |
| Assistant           | IMBONIX AI           | every page · `/api/assistant`             | A floating assistant, grounded in NISR's published figures, that answers questions by typing or voice, reads uploaded pictures and documents, and can read its answers aloud. |

The **public data API** (`apps/api`) serves read-only JSON for districts, indicators and sectors, with validation, rate
limiting and security headers.

## IMBONIX AI

A floating assistant, on every page, that helps people get answers without reading a whole dashboard. It is **grounded**:
its knowledge is the same published NISR digest the site is built on (district and national figures, the FinScope and
poverty findings, the national targets and the dataset catalogue), and it is told to quote only those figures, name the
source, and never invent a number.

- **Ask by typing or by voice.** Speech recognition dictates a question; answers can be read back aloud. Both use the
  browser's Web Speech API, so no audio leaves the page to a service of ours.
- **Reads pictures and documents.** Attach an image, PDF or text file and it extracts and analyses the content, relating
  it to the NISR data where relevant.
- **Works with or without a key, free or paid.** Set either `GEMINI_API_KEY` (Google Gemini — a free tier, no credit
  card) or `ANTHROPIC_API_KEY` (Claude `claude-opus-5-5`, used in preference when present) on the server, and answers
  come from that model through a same-origin route (`apps/web/src/app/api/assistant/route.ts`); the key is read only on
  the server and never reaches the browser. With no key, the assistant falls back to an instant on-device engine over the
  same figures, so it always works — including in a demo.

See [docs/ai-assistant.md](docs/ai-assistant.md) for the architecture and
[docs/submission/demo-script.md](docs/submission/demo-script.md) for a judge walkthrough.

<table>
  <tr>
    <td><img src="docs/screenshots/map.png" alt="Resilience map zoomed to a district's sectors"></td>
    <td><img src="docs/screenshots/district.png" alt="Gicumbi district profile"></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/priorities.png" alt="Priority ranking by policy lever"></td>
    <td align="center"><img src="docs/screenshots/home-mobile.png" alt="Homepage on a phone" width="260"></td>
  </tr>
</table>

## How the data is handled

- **Only published figures.** District and sector values are transcribed from NISR and partner reports (EICV7, the 2022
  census, FinScope, DHS 2025, CFSVA 2024, LFS 2025 and others), each with its table reference.
- **Every value is labelled** as an official estimate, our calculation, a model estimate, a projection or a scenario.
- **No composite score.** The dimensions are shown side by side, and ranks are presented as indicative.
- **No causal claims.** The surveys are cross-sections; the site describes associations between places, not households.
- **No microdata in git.** Survey microdata stays in ignored folders, under NISR's terms of use.
- **Reproducible.** `scripts/data/build_web_data.py` rebuilds the website data from the committed extracts, and CI checks
  that the result matches exactly.

See [docs/database.md](docs/database.md) for the data model, and the site's **Sources and methods** page (`/data`) for every
source and caveat.

## Design

- **Cyan and white.** Every colour on the site comes from `apps/web/src/lib/palette.ts`: bright cyan (`#02A5DC`)
  and white, with text in a neutral near black (`#1A1F21`) and a deeper cyan (`#01749C`) for links and small text.
  Map and chart scales are steps of the cyan plus a neutral grey, generated by `scripts/brand/generate_palette.py`
  and checked for colour-vision deficiencies. A test fails if a component writes its own colour.
- **Vector logo.** The emblem, wordmark and tagline are crisp SVG files in `apps/web/public/brand/`, with light and dark
  versions, lockups, a simplified favicon mark and app icons.
- **Minimal.** The header links only the three focus areas and Data & methods. Charts follow the FinScope report's
  infographic style, and every inner page has breadcrumbs.
- **Accessible.** No axe (WCAG 2.1 A and AA) violations on any page at 320, 390 and 1440px, no horizontal scrolling
  from 320px up, and every text colour at 4.5:1 or better.

## Tech stack

| Layer           | Tools                                                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Web app         | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui patterns with Radix primitives                                     |
| Assistant       | Google Gemini (free tier) or Anthropic Claude via a server route, with a grounded on-device fallback; Web Speech API for voice in and out |
| Charts and maps | Recharts, custom SVG charts, MapLibre GL with OpenFreeMap tiles, geoBoundaries outlines                                                   |
| API             | Node.js 22, Express 5, zod validation, helmet, express-rate-limit                                                                         |
| Data pipeline   | Python 3.12+ (standard library for the build; openpyxl and xlrd for extraction)                                                           |
| Quality         | Vitest, node:test with supertest, Python unittest, ESLint, Prettier, gitleaks, npm audit                                                  |
| Delivery        | Docker (multi-stage images), docker compose, GitHub Actions                                                                               |

## Architecture

```mermaid
flowchart LR
  A[NISR and partner<br>publications] -->|transcribed with table refs| B[data/extracts<br>CSV]
  G[geoBoundaries outlines<br>CC BY 4.0] --> S
  B --> S[scripts/data/build_web_data.py]
  S --> C[apps/web/src/data/generated<br>JSON, plus public/geo GeoJSON]
  C --> D[Next.js web app<br>static pages, client maps]
  C --> E[Express API<br>/api/v1]
```

There is no database: the site serves a small, versioned set of published aggregates. Details are in
[docs/architecture.md](docs/architecture.md).

## Getting started

### Prerequisites

- Node.js **22.9 or later** and npm 10
- Python **3.12 or later** (only to rebuild the data)
- Docker Desktop (optional, to run the production images)

### Install and run

```bash
git clone git@github.com:dieumerci-niyonkuru/imbonix-nisr-hackathon-2026.git
cd imbonix-nisr-hackathon-2026

# Web app on http://localhost:3000
cd apps/web
npm ci
npm run dev

# API on http://localhost:4000 (in a second terminal)
cd apps/api
npm ci
npm run dev
```

The website does not depend on the API: both read the same generated data.

### Environment variables

No secrets are needed to run IMBONIX. Every setting has a safe default, and each app documents its variables in its
`.env.example`:

| App                                                  | Variables                                                                                                                                                                                                                                                                                              |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| API ([apps/api/.env.example](apps/api/.env.example)) | `NODE_ENV`, `PORT`, `HOST`, `CORS_ORIGINS`, `RATE_LIMIT_PER_MINUTE`, `TRUST_PROXY`, `LOG_LEVEL`, `DATA_DIR`                                                                                                                                                                                            |
| Web ([apps/web/.env.example](apps/web/.env.example)) | `NEXT_PUBLIC_API_URL` (reserved; the site does not call the API yet), and **one of** `GEMINI_API_KEY` (free, no card) or `ANTHROPIC_API_KEY` (optional; powers IMBONIX AI's generative answers and document reading — the on-device engine works without either, and keys are read only on the server) |

Copy a `.env.example` to `.env` for local changes. `.env` files are ignored by git and must never be committed.

### Run with Docker

```bash
docker compose up --build
```

This serves the web app on <http://localhost:3000> and the API on <http://localhost:4000>. See
[docs/deployment.md](docs/deployment.md).

## Tests and checks

| Where           | Command                                                                      | What it covers                                                                                                                                                                                             |
| --------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web`      | `npm test`                                                                   | Formatting helpers, colour scales, generated-data integrity, province weighting against the published national rates, published homepage findings, priority rules, scenarios, correlations, sector colours |
| `apps/web`      | `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build` | ESLint (Next.js and accessibility rules), TypeScript, Prettier, production build                                                                                                                           |
| `apps/api`      | `npm test`                                                                   | Every endpoint, validation, errors, rate limits, CORS, security headers, logging and configuration                                                                                                         |
| repository root | `python -m unittest discover -s scripts/data/tests -v`                       | Build helpers, extract integrity, and that the website data rebuilds exactly                                                                                                                               |

GitHub Actions runs all of these on every push and pull request, plus `npm audit`, a gitleaks secret scan of the full
history, and a Docker build that starts both images and waits for their health checks.

## API

```bash
curl http://localhost:4000/api/v1/districts/nyamagabe?indicators=eicv7_poverty_rate
```

```json
{
  "data": {
    "name": "Nyamagabe",
    "slug": "nyamagabe",
    "province": "South",
    "sectorCount": 17,
    "values": [
      {
        "indicator": {
          "id": "eicv7_poverty_rate",
          "label": "Poverty headcount (% of people)",
          "source": "NISR EICV7 Main Indicators Report (tables)",
          "table": "Table A9.23",
          "year": "2023/24",
          "status": "observed"
        },
        "value": 51.3941,
        "standardError": 3.214,
        "ciLow": 45.09,
        "ciHigh": 57.6982
      }
    ]
  },
  "meta": {}
}
```

All endpoints, parameters and error codes are in [docs/api.md](docs/api.md).

## Project structure

```text
apps/
  web/              Next.js app: pages (src/app), components, lib (data, scales, rules), generated data
  api/              Express API: routes, middleware, data store, tests
data/
  extracts/         Published NISR tables transcribed to CSV: the source of every figure on the site
  dictionaries/     NISR microdata catalog index and variable dictionaries
  schemas/          JSON schema for an indicator
                    (raw and working survey files stay local in data/raw, never committed)
scripts/
  data/             Extraction and build scripts for the published data, with tests
  brand/            Generates the logo files and the colour palette
docs/
  data/             Data sources plan, data inventory, microdata access
  research/         Hackathon brief and the Track 2 research dossier
  model/  project/  submission/  screenshots/
                    Architecture, API, data model, deployment, security and development guides at the top level
.github/            CI workflow, Dependabot, issue and pull request templates, CODEOWNERS
```

## Deployment

The web app and API each have a production Dockerfile, and `docker-compose.yml` runs both. Both images have been built,
started and checked locally. **IMBONIX is not yet deployed to a public host.** The fastest path to the public URL the
hackathon requires is the [Vercel quickstart](docs/deployment.md#deploy-the-web-app-to-vercel-fastest) (no Docker
needed); add the live URL under [For judges](#for-judges) once it is up. [docs/deployment.md](docs/deployment.md) covers
Vercel, Docker hosting options, production settings, hardening notes and a release checklist.

## Security

No secrets are required or stored; configuration comes from environment variables. The web app sends a Content Security
Policy and related headers. The API validates every parameter, rate-limits requests and never exposes internal errors.
Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md); controls and the GitHub settings to enable
are in [docs/security.md](docs/security.md).

## Contributing

Work happens on `feature/*`, `fix/*`, `security/*`, `docs/*` and `chore/*` branches cut from `develop` and merged back
once the checks pass. `develop` moves to `testing` for integration checks, and `main` changes only through a pull request
from `testing`. Commits follow Conventional Commits. See [CONTRIBUTING.md](CONTRIBUTING.md) and
[docs/development.md](docs/development.md).

## Team

| Name                 | Role                            | GitHub                                                         |
| -------------------- | ------------------------------- | -------------------------------------------------------------- |
| Dieu Merci Niyonkuru | Team lead, development and data | [@dieumerci-niyonkuru](https://github.com/dieumerci-niyonkuru) |

<!-- Add the other team members here. -->

## Data sources and attribution

- Statistics: **National Institute of Statistics of Rwanda (NISR)** and partners (MINAGRI and WFP for CFSVA 2024; Access
  to Finance Rwanda for FinScope), as cited on each page and in the extracts.
- NISR microdata catalog: <https://microdata.statistics.gov.rw/index.php/catalog>
- District and sector boundaries: [geoBoundaries](https://www.geoboundaries.org/) (CC BY 4.0), from NISR open geodata.
- Background map: [OpenFreeMap](https://openfreemap.org/), © OpenMapTiles, data from OpenStreetMap contributors.

## AI assistance

Parts of the code and documentation were written with AI assistance. The team reviewed the work and is responsible for
every figure and claim. See [docs/submission/ai-disclosure.md](docs/submission/ai-disclosure.md).

## License

No open-source licence has been chosen yet, so all rights are reserved by the team for now. The competition's
intellectual-property terms and NISR's data terms of use also apply; the team will choose a licence after reviewing them.
Data remains subject to its publishers' terms.
