# Changelog

All notable changes to IMBONIX are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/),
and versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Plain language and a lighter homepage

- Pages have plain, descriptive names, used the same way in the menus, footer, search, breadcrumbs and page
  headings: Rwanda in figures, Who uses financial services, Who is most at risk, Map of every district, Find your
  district, Where needs overlap, VUP support and payments, Where to act first and Test a policy target. Each menu
  opens with "At a glance". The search jump list shows the names only, one per line.

### Minimal homepage and navigation

- The homepage tabs and the header menus follow the three parts of the Track 2 challenge: financial exclusion,
  poverty dynamics and social protection. Each menu opens with its homepage overview, and the footer has one column
  per part.
- The header follows the NISR style: a light grey utility bar with bold blue links, bold navy items that turn solid
  cyan on hover and when current, and plain text dropdowns without icons. The full menu shows from 1280px wide.
- The homepage opens with a statement chart of the gap (96% use a financial service, 10% are financially healthy)
  and four key figures across the three parts, followed by the district poverty map and the five poorest districts.
- The opening answers the three things the Track 2 brief asks of a solution, each worked out from the data: a real
  gap (96% against 10%), NISR data (64 indicators from 13 publications, 30 districts, 416 sectors) and practical
  impact (7 policy levers). The gap is drawn in the chart as a dashed band, the bars grow in once on load unless
  reduced motion is preferred, and the seven NISR studies behind the figures link to their catalog pages.
- The website presents IMBONIX as a working solution: the hackathon name, track number and brief no longer appear
  in the interface. The opening reads "Financial inclusion and poverty reduction in Rwanda", the homepage speaks of
  the problem IMBONIX addresses and its three focus areas, and the independence notes keep saying it is not an
  official NISR product. The project documents keep the hackathon context.
- The bar above the header is now a deep navy band with a cyan rule: "Independent evidence platform", the coverage
  counted from the data (30 districts, 416 sectors, 64 indicators, 13 publications, from 1280px wide) and the three
  project links in white, turning cyan on hover.
- The footer follows a university footer on deep navy: four centred link columns with large bold headings and no
  dividers, then a bottom row with the copyright on the left, the stacked logo straight on the dark background in the
  middle (the white wordmark and tagline over the full colour emblem, like a crest) and icon links on the right
  (source code, NISR microdata catalog, report a data issue, back to top). The credits line left the footer: data
  sources are cited beside every chart, the map shows its own credits, and the methods page lists them all, with the
  background map now included, and states the version. The floating scroll buttons fade away over the footer.
- On the resilience map, the district panel no longer slides over the district ranking while it stays in view: the
  ranking sits in the left column beside the panel instead of running under it.
- The homepage cards follow a university site. The three parts of the problem are tall image cards whose picture is
  a district map of a related measure on navy (brighter is higher, with a caption saying what it shows), with the
  finding as a large white title, its source and a circled arrow link. A full width banner over a faint outline of
  the districts opens "Who it serves", followed by text cards for households, policymakers and civil society, and
  the four steps of "How it works" are text cards too, each with a page to go deeper. The whole card is the link.
- Search shows no icons. Before anything is typed, "Jump to" lists every page grouped like the header menus
  (financial exclusion, poverty dynamics, social protection, each opening with its homepage overview, then the
  project pages) in two columns on wider screens. Results are plain text rows; the highlighted one has a cyan bar
  and an "Open" label, and the list can be scrolled from the keyboard.
- The site uses three brand colours only, on white and light neutral backgrounds: deep navy #022657 (main), bright
  cyan #02A5DC (buttons, active navigation, highlights) and medium blue #0461B1 (links, secondary elements, data).
  Gold and every other colour were removed from the interface and the charts; ramps are steps of the three colours
  plus a neutral grey. Cyan buttons carry navy text, text links on white use the medium blue, and chart marks use
  the cyan one small step deeper so they reach 3:1 against white. The logo keeps its own colours.
- The homepage opens with the Track 2 question and IMBONIX's answer, a district map of EICV7 poverty rates and four
  key figures with their sources. It then answers the three parts of the brief (financial exclusion, poverty
  dynamics, social protection impact) with one published figure each and a Read more link, names the groups it
  serves, shows the three focus area tabs, explains how IMBONIX works in four steps, and ends with a district finder.
- Chart rows are arranged by size and their cards end level, a focus panel's claim stays in view beside its charts,
  and the selected homepage tab is solid blue.
- Header items turn solid blue on hover and when open or current; search looks like a search field with a Search
  button; the search and the phone menu close with a labelled Close button. The Next.js badge no longer shows in
  development.
- The footer is laid out like a university footer: centred columns with bold headings, the NISR studies, then the
  copyright and independence statement, the logo and Back to top.
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
- A fuller header: a thin navy bar that states the project is independent and links to the NISR microdata catalog,
  the source code and the data issue form; then the logo, a home link, dropdown menus for the focus areas and the
  Explore, Insights and Act pages (each with an icon and a one line description), Data & methods and search. The
  menus open on click, the down arrow or hover and close on Escape, a click outside or moving focus away. Phones get
  a menu sheet with the same links.
- Site search is back as a command palette (Ctrl K, Cmd K or /): pages, focus areas, the 30 districts, the map
  measures and all 416 sectors, with keyboard navigation. Sector names load from a small index built at build time
  the first time search opens.
- A full footer on every page: the logo and mission, the statement of independence, every page grouped as in the
  menu, links to the source code, security policy and data issue form, the seven NISR studies behind the figures
  (each linked to its catalog page), the licence credits for boundaries and the background map, and a link back to
  the top.
- Buttons in the bottom right corner go back to the top of a long page or down to its end. They show only when a
  page is long enough, dim at either end without losing keyboard focus, and respect reduced motion.
- The site uses flat logo colours only: the sector range chart is a solid bar between a light and a dark navy dot
  instead of a gradient.
- Fixed: screen reader tables no longer widen the page on phones.
- Fixed: charts in inactive homepage tabs are drawn at their full size before the tab opens, instead of logging about
  37 size warnings on every page load.
- Values taken from policy documents carry a "Policy target" status, explained on the Data & methods page.
- The site's own text follows the project's writing rules: icons come from the icon set instead of typed arrows,
  ranges read "15 to 49" instead of using dashes, missing values show "n/a", and hyphenated words were reworded.
  Publication titles and official indicator names quoted from NISR keep their original spelling.
- A CI check, "Release source", fails pull requests into `main` that do not come from `testing`, so work branches
  cannot skip `develop` and `testing` by accident.

### Repository

- This repository became the project's official home on 27 September 2026. The code was brought in from the team's
  earlier working repository in stages, one branch per area, and all further work happens here.
- Branches: `main` (production, protected, changed only by pull request from `testing`), `testing` (integration),
  `develop` (development), and `feature/*`, `fix/*`, `security/*`, `docs/*` and `chore/*` for work in progress. CI runs
  on all of them, and Dependabot targets `develop`.
- CI uses actions/checkout 7, actions/setup-node 7, actions/setup-python 7 and gitleaks/gitleaks-action 3, and the data
  scripts require openpyxl 3.1.5 and xlrd 2.0.2. The README shows the CI status of `develop`.
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

