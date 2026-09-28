# IMBONIX Project Progress and AI Handoff

**Project:** IMBONIX — Data for Inclusive Prosperity  
**Competition:** NISR 2026 Big Data Hackathon, Track 2: Financial Inclusion & Poverty Reduction  
**Last updated:** 27 September 2026  
**Status:** Version 1.0.0 released on `main`. Multi-page product on published NISR district and sector data, with a tested public API, CI and production Docker images verified locally. Household-level (microdata) analysis and public deployment remain to do.

## Executive Summary

IMBONIX is an independent decision-support prototype intended to help researchers and decision-makers explore financial inclusion and financial vulnerability in Rwanda. Since 26 September 2026 the website shows **published** NISR district and sector figures (poverty, financial access, nutrition, shocks, work, health cover) with their source, year, status label and confidence interval where published. The old illustrative district placeholders have been removed. No household-level (microdata) analysis has been done yet.

The most important next milestone is to verify access to suitable NISR data and build one reproducible analysis comparing financial access with poverty or social-protection measures at a geography and subgroup level the source data supports.

## Progress Snapshot

| Area | Status | Evidence / notes |
| --- | --- | --- |
| Track 2 problem framing | In place | Product scope focuses on household financial vulnerability and relevant interventions. |
| Web app | Implemented | Next.js 15 / React 19: homepage, dashboard, resilience map (SVG and MapLibre with sector drill-down), 30 district profiles, vulnerability analysis, access vs use, social protection, priorities, scenario simulator, model design, data and methods. Loading, error and 404 states. |
| District and sector data | Implemented from published tables | 30 districts × 67 indicators and 416 sectors, built from `data/extracts/` by `scripts/data/build_web_data.py`. Every value carries its source, year and status label. Not for household targeting or eligibility. |
| API | Implemented | Express 5, read-only `/api/v1` for indicators, districts and sectors; zod validation, JSON errors, rate limiting, CORS allow-list, helmet, structured logs. See `docs/api.md`. |
| Tests | Implemented | 49 web unit tests (Vitest), 38 API tests (node:test + supertest), 13 data tests including an exact rebuild check of the website data. Automated accessibility audit (axe, WCAG 2.1 AA) clean on every page at 320, 390 and 1440px. |
| CI and security | Implemented | GitHub Actions: format, lint, types, tests, build, `npm audit`, gitleaks, Docker build and health smoke test. Dependabot, CODEOWNERS, templates. Branch protection and secret scanning must be enabled by the owner in GitHub settings (`docs/security.md`). |
| ML and evaluation | Designed, not trained | The model page shows the design and features checked against the FinScope 2024 dictionary. No model output exists; microdata not yet downloaded. |
| Production build/deployment | Images verified locally, not deployed | Both Docker images build, start healthy and pass the route sweep (27 Sep 2026). No public deployment yet; see `docs/deployment.md`. |
| Team/submission readiness | Needs team confirmation | Verify team members and eligibility, submission package, deployed URL, AI disclosure details, licence choice, and acceptance of competition IP terms. |

## Completed in the First Pass (earlier, September 2026)

- Replaced four unsupported headline examples with NISR FinScope 2024 national figures: overall inclusion (96%), formal inclusion (92%), banked adults (22%), and financial exclusion (4%).
- Added source links and visible source context to the indicator cards.
- Added the FinScope 2024 entry to `data/dictionaries/source-registry.json` and expanded `data/schemas/indicator.schema.json` for source and reference metadata.
- Documented the verified dashboard slice and data-access caveat in `docs/data/data-source-plan.md`.
- Changed evidence cards to published descriptive findings with source links and explicit non-causal follow-up questions.
- Clearly marked district examples as illustrative placeholders and unsuitable for decisions.
- Fixed invalid Heroicons imports that caused the home page to throw a runtime rendering error.
- Checked TypeScript diagnostics and viewed the dashboard in a browser at desktop and 390px mobile widths. The source cards rendered without visible overflow.

## Source and Data Notes

- NISR FinScope Survey 2024 publication: <https://statistics.gov.rw/statistical-publications/business-establishment-finance-trade/finscope-survey-2024>
- FinScope report PDF: <https://statistics.gov.rw/sites/default/files/documents/2024-09/Rwanda-Finscope-2024-Report_compressed.pdf>
- NISR NADA microdata catalog: <http://microdata.statistics.gov.rw/>
- NISR EICV study listing: <https://statistics.gov.rw/datasource/EICV>
- NISR VUP baseline study listing: <https://statistics.gov.rw/datasource/VUP-Umurenge-2020>

The NISR FinScope page reports fieldwork from 6 September to 8 October 2024 and a sample of 14,000 households. Confirm the exact indicator denominator, definitions, weights, uncertainty, and comparability in the report before extending or recalculating any finding. A public report does not automatically mean underlying microdata can be redistributed. Check each study's NADA access conditions and license.

FinScope 2024 findings are national-level. Do not use them to infer a particular district's condition. Cross-sectional comparisons alone do not establish that a social-protection program caused an outcome.

## Research Update (26 September 2026)

Track 2 desk research is complete. See [Track 2 Research Dossier](../research/track2-research-dossier.md) and [Data Inventory](../data/track2-data-inventory.md).

- **Data feasibility (priority 1) is largely resolved on paper.** The NADA catalog lists public-use microdata for FinScope 2024 (ID 120), EICV7 cross-section (119) and EICV7 VUP (121). Their data dictionaries confirm:
  - district identifiers and weights in both FinScope and EICV7;
  - FinScope social-protection variables: Ubudehe category, VUP transfer and public-works income;
  - EICV7 VUP payment channel and payment-delay days.
  - Downloads still need a NADA account and acceptance of each study's terms.
- **Published district tables are extracted** to `data/extracts/`: EICV7 district poverty and FinScope district access strand, with caveats. These can replace the illustrative district placeholders, labelled as observed published estimates.
- **Recommended scope:** Resilience Map + explainable Drivers model + Benefit Delivery Monitor. The dossier also covers alternatives, target alignment and a week-by-week plan.
- **Competitors:** two other public 2026 Track 2 repos exist, a cost-of-living navigator and a generic inclusion dashboard.

### Second pass, same day: public data collected and extracted

The team has registered for the competition. Work done:

- **Download pipeline:** `scripts/data/download_nisr_public.py` plus the manifest `data/dictionaries/nisr-public-files.json` (170 files). 122 of 123 core files (about 320 MB) are in gitignored `data/raw/nisr/published/`. The MINALOC Imibereho SOP failed because MINALOC's TLS certificate had expired; it was added manually from an earlier download.
- **Variable dictionaries:** `scripts/data/fetch_nada_dictionary.py` wrote the full variable lists for FinScope 2024 (2,500), EICV7 (838) and the VUP sample (800), plus value labels and unweighted counts for 52 key variables (`data/dictionaries/nada_*`).
- **Extraction:** `scripts/data/extract_published_tables.py` (needs `scripts/data/requirements.txt`) builds `data/extracts/`:
  - 30 districts × 47 indicators, with NISR standard errors and CIs where published;
  - all 416 sectors from the census (non-monetary poverty, MPI, population);
  - the LFS district series 2017–2025;
  - VUP delivery tables.
- **Sector monetary poverty:** NISR small-area estimates for all 416 sectors were transcribed from the district decks' maps (`sector_poverty_eicv7_sae.csv`). Names were validated against the census. The values are **not benchmarked** to district direct estimates; the README explains this.
- **New findings** are in the dossier, section 2.6: sector extremes, the digital-readiness correlation, falling real earnings in 19 of 30 districts, and rural communication prices +54.8%.
- **Microdata guide:** `docs/data/microdata-access.md`.

### Third pass, same day: the whole microdata catalog

- **Catalog index:** `scripts/data/index_nada_catalog.py` lists all **76 studies** in `data/dictionaries/nada_catalog.csv`, with their 527 data files and 448 documentation items.
  - None is open without an account: 69 are public use (one request per study), 4 are hosted by the World Bank, and 3 have no microdata.
  - Public documentation for 17 priority studies (75 files, 187 MB) is in gitignored `data/raw/nisr/nada-docs/`.
- **More variable lists:** `fetch_nada_dictionary.py --studies <id>` now covers 10 studies. New: FinScope 2020, EICV5 VUP, LFS 2025, CFSVA 2024, Census 2022 sample, Establishment Census 2023, AHS 2024.
  - The **Census 2022 public sample has the sector code**, and NISR says it supports sector-level analysis.
  - **DHS 2025** has district codes and women's and men's account and mobile-money questions.
  - **CFSVA 2024** records VUP receipt by component, by district.
- **District dataset now has 63 indicators.** New additions:
  - Establishment Census 2023;
  - DHS 2025 child nutrition;
  - CFSVA 2024 food consumption and natural hazards (hazards digitized from the chart by `scripts/data/digitize_cfsva2024_hazards.py`, checked against 11 values in the report text);
  - FinScope 2020 district banking. It includes over-the-counter users, so it is **not comparable** with 2024.
- **Other new extracts:** DHS 2025 account and mobile-money use by sex and wealth, and VUP payment timeliness for 2013/14, 2016/17 and 2023/24.
- **Findings** are in the dossier, section 2.7:
  - an "included is not using" gap among poor women;
  - stunting unrelated to monetary poverty outside Kigali;
  - a shock map separate from the poverty map;
  - the on-time share of VUP payments flat near 15% for ten years, while long delays fell.

### Website redesign, same day

The web app (`apps/web`) was rebuilt as a multi-page site around the multidimensional-vulnerability story. The previous version is backed up outside the repo only; its illustrative district data was deleted.

- **Pages:**
  - `/` overview: animated four-dimension hero map, key numbers, small multiples, poverty × exclusion scatter, usage-gap and VUP teasers.
  - `/map` resilience map: 25 layers in 8 dimensions, district panel, ranking with confidence intervals, shareable `?layer=&district=` links.
  - `/districts` and `/districts/[slug]`: 30 profiles with four-dimension ranks, grouped indicators, and a sector map and table.
  - `/access-vs-use` (DHS 2025 vs FinScope 2024), `/social-protection` (VUP delivery), `/data` (NISR catalog link, microdata to request, indicator catalogue, caveats).
- **Data:** `scripts/data/build_web_data.py` writes `apps/web/src/data/generated/*.json` from the extracts and from geoBoundaries district and sector outlines (CC BY 4.0, from NISR open geodata, 2012 units; downloaded automatically to gitignored `data/raw/geo/`).
- **Design rules:**
  - No composite score: districts are ranked on four separate dimensions.
  - Darker map colours always mean more vulnerable.
  - Categorical and ordinal colour pairs were checked with a colour-vision validator.
  - Status badges appear on every value.
- **Checks done:** TypeScript, production build, and headless-browser screenshots at 1440px and 390px widths.
- **Still to do:** keyboard and screen-reader testing by a person, automated tests, deployment, and replacing published aggregates with microdata estimates once access is granted.

Not yet done:

- Microdata download (needs a team member's NADA account).
- Tests for the scripts and the web app.
- Public deployment.

### Engineering pass, 27 September 2026

The project was prepared as a production-ready application. All work went through `feature/*`, `fix/*`, `test/*`,
`chore/*` and `docs/*` branches merged into `develop`.

- **Security:** Next.js 14.2.30 had one critical and four high advisories; upgraded to 15.5.26 with React 19, and Next's
  bundled PostCSS lifted to 8.5.28. `npm audit` now reports 0 vulnerabilities in both apps. The web app sends a CSP and
  related headers. Git history was scanned for secrets (none found).
- **API:** replaced the demo endpoint with a validated, rate-limited, read-only data API; removed the unused PostgreSQL
  dependency (IMBONIX has no database; see `docs/database.md`).
- **Tests and CI:** added the three test suites above and extended CI with tests, audits, gitleaks and a Docker smoke test.
- **Deployment:** standalone Next.js output, Dockerfiles for both apps, `docker-compose.yml`, health endpoints.
- **Brand and homepage:** dark-background logo files (generated by `scripts/brand/make_logo_svgs.py`); the homepage
  leads with the value proposition, shows platform counts, a guide to all nine tools and a data-to-decisions pipeline.
- **Structure:** removed empty scaffold folders, renamed `charts/rc` to `charts/recharts`, moved lint to the ESLint CLI.
- **Docs:** README, `docs/architecture.md`, `database.md`, `api.md`, `deployment.md`, `security.md`, `development.md`,
  `CONTRIBUTING.md`, `SECURITY.md`.

### Brand and design pass, 27 September 2026

On `feature/brand-system`: every colour now comes from the logo (`apps/web/src/lib/palette.ts`, enforced by a test);
the logo is redrawn as vector SVG with regenerated icons; the header gains mega menus, a quick-access bar and site search
(work started in another session and completed here); every page has breadcrumbs and previous/next links; the footer,
page heroes and homepage are redesigned without blurred or gradient effects. Accessibility audit clean at 320, 390 and
1440px.

### Minimal redesign and repository cleanup, 27 September 2026

- **Homepage:** rebuilt as a minimal, infographic page with three tabs that follow the Track 2 brief: the gap, the
  evidence and the impact (`components/home/focus-panel.tsx`, `components/ui/tabs.tsx`). New charts:
  `milestone-timeline`, `mirror-bars` and `paired-stacks`. The header links only the focus areas and Data & methods.
- **New national figures to verify in the data review:** `INCLUSION_MILESTONES`, `INCLUSION_OVERVIEW` and
  `STRAND_BY_INCOME` in `lib/national.ts` were transcribed from the FinScope 2024 report's graphics without figure
  numbers. The report gives 7.9 million included adults for 2024 on its timeline and 7.8 million in its overview chart.
- **Repository:** everything merged into `main`, which is now the only branch; CI and Dependabot target it. Unused code
  and the empty placeholder folders were removed.

## Immediate Priorities

1. **Get the microdata.** Data feasibility is resolved on paper (see the research update above). A team member should create a NADA account and request studies 120, 119 and 121 following `docs/data/microdata-access.md`, then the priority-2 studies (109, 89, 126, 122). Reproduce the validation figures listed there. Do not commit microdata or personal information.
   - Done: the website now uses the published district and sector extracts (see "Website redesign" above).
2. **Choose one defensible analysis.** Based on authorized, comparable data, define a question about which groups face persistent financial barriers or how financial access varies with poverty/social-protection context. State clearly whether the result is descriptive or causal.
3. **Implement a reproducible data path.** Add a governed sample or permitted aggregate extract, source/cleaning script, validation, and indicator metadata. Keep source, year, geography, definition, unit, and status attached to each displayed measure.
4. **Make the prototype useful.** Done for published data (map, district profiles, filters and plain-language findings). Next: add microdata estimates (for example the DHS usage gap by district and VUP delays by province), each with its status label and uncertainty.
5. **Add focused tests and validation.** Test source metadata, schema validation, calculations, and user-facing labels. Run TypeScript checks, production build, and browser checks after changes.
6. **Prepare the submission.** Confirm team eligibility and registration, publish the repository, deploy the app, complete documentation and AI-use disclosure, and review NISR's intellectual-property transfer condition with the team.

Competition dates shown on the NISR page: registration deadline **20 October 2026 at 11:59 PM** and project submission deadline **30 October 2026 at 11:59 PM**. Recheck the official page before relying on these dates.

## Local Development

See [docs/development.md](../development.md) for setup, commands, tests and troubleshooting. In short:

```powershell
cd apps/web; npm ci; npm run dev      # http://localhost:3000
cd apps/api; npm ci; npm run dev      # http://localhost:4000/health
docker compose up --build             # both production images
```

Rebuild the website data only after the extracts change (`python scripts/data/build_web_data.py`); the generated JSON is
committed, and CI checks that it matches the extracts.

## Guardrails for Teammates and AI Helpers

- Read this file, `README.md`, `docs/project/product-scope.md`, and `docs/data/data-source-plan.md` before making broad changes.
- Preserve existing user work. Inspect the worktree before editing and do not revert unrelated changes.
- Keep IMBONIX identified as an independent project; do not imply NISR endorsement.
- Never fabricate or silently extrapolate official statistics. Distinguish observed data, calculations, model estimates, and scenarios in both code and UI.
- Do not use district or sector figures for household targeting, eligibility decisions or budget allocation; they describe places, not people.
- Do not claim causal program impact without a valid evaluation design and suitable data.
- Do not commit restricted microdata, credentials, or personally identifying information.
- Check dataset-specific access/licensing terms and acknowledge sources.
- Disclose AI assistance in the final submission as required by the competition; a human team member must verify facts and own the submission.
- Do not claim production readiness, deployed status, model accuracy, user impact, or judging success without evidence.

## Suggested Brief for the Next AI Helper

> Continue the IMBONIX NISR 2026 Track 2 project. Read `docs/project/PROGRESS.md`, `README.md` and
> `docs/architecture.md` first, then work on a short-lived branch from `main` following `CONTRIBUTING.md`. District and sector
> figures are published NISR aggregates with source and status labels; keep it that way. The next milestone is the
> household-level analysis once FinScope 2024 microdata access is granted (`docs/data/microdata-access.md`), then a public
> deployment (`docs/deployment.md`). Do not invent statistics, make causal claims, commit microdata or secrets, or merge
> untested work into `main`. Run the checks in `docs/development.md` and update this file with what changed.
