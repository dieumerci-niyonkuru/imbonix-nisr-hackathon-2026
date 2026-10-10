# IMBONIX — demo script for judges

> **Submission package:** [Index](README.md) · [Solution overview](solution-overview.md) · **Demo script** · [IMBONIX AI](../ai-assistant.md) · [AI disclosure](ai-disclosure.md)

A short, repeatable walkthrough that lands every one of the five evaluation criteria. Use the 90-second run for a
quick pitch and the 3-minute run for a full review. All figures shown are NISR's published statistics, each labelled on
screen with its source and how far to trust it.

- **Live site:** run `npm run dev` in `apps/web` (or open the deployed URL).
- **Optional — turn on the full AI:** set a key in `apps/web/.env` — either `ANTHROPIC_API_KEY`, or a free-tier
  `GEMINI_API_KEY`. Without any key, IMBONIX AI still works from the on-device engine over the same figures, so the demo
  never depends on a key. Details in [`../ai-assistant.md`](../ai-assistant.md).

---

## 90-second run

| Time | Do this | Say this | Criterion |
|---|---|---|---|
| 0:00 | **Homepage**, top banner + the six headline figures | "Access to finance in Rwanda is almost universal — but only a fraction of adults are *financially healthy*, and banking has been flat since 2020. That gap is the problem IMBONIX is built around." | 1 — Problem |
| 0:20 | Scroll to **"Aligned to national priorities"** | "We track the national targets behind Vision 2050 and NST2 — financial inclusion and social protection — and show how far today's figure is from each goal." | 1 — Relevance |
| 0:35 | Open **IMBONIX AI** (bottom-right), ask *"Where is financial exclusion highest?"* | "The assistant answers only from NISR's published figures and names the source every time — no invented numbers." | 2, 3 |
| 0:55 | In the assistant, **attach a photo or PDF** of a chart/report and send | "It reads uploaded documents and relates what it finds to the NISR data." | 3 — Innovation |
| 1:15 | Open the **district map** (`/poverty-dynamics/district-map`), switch a layer | "Every measure, mapped for all 30 districts, validated for colour-blind readability." | 4 — Design |
| 1:30 | Open **Priority districts** (`/social-protection/priority-districts`) | "And it ends in action: districts flagged by transparent rules, so support goes where the need is greatest." | 5 — Impact |

---

## 3-minute run (criterion by criterion)

**1 · Problem understanding & relevance (NST2 / Vision 2050).**
Homepage → the gap chart ("Access is high. Financial health is not.") frames a sharp, non-obvious problem. Then the
**"Aligned to national priorities"** section names Vision 2050, NST2, the National Financial Inclusion Roadmap
2025–2030 and the Social Protection Sector Strategic Plan, and shows progress toward four published targets with their
baselines.

**2 · Data use & methodology (NISR + external).**
About → **Sources** (`/about#sources`): every publication with the number of indicators it gives and a **"Collected
with"** column that shows where NISR works with external partners (ICF / The DHS Program for the Rwanda DHS, the World
Food Programme for the CFSVA). About → **Method** and **Principles**: every figure carries one of six trust labels
(official estimate, calculation, model estimate, projection, scenario, target); national and province figures are
weighted from districts and labelled as calculations; the pipeline is reproducible and microdata is never published.

**3 · Tech innovation.**
`/financial-exclusion/risk-model` (an explainable vulnerability model with its factors and limits stated) →
`/social-protection/policy-scenarios` (test a target and see the effect) → **IMBONIX AI**: a grounded assistant that
answers open-ended questions from the NISR digest and analyses an uploaded image or document. The key is read only on
the server and never reaches the browser; with no key it falls back to the on-device engine.

**4 · Usability & design.**
The whole site follows a calm, government-style system (the look of gov.rw / Irembo): one brand colour, validated
charts, a legend and a table view for every chart, keyboard and screen-reader support, and a consistent four-tab
structure. Show the interactive map and the chart library (`/data/chart-library`).

**5 · Tangible impact.**
About → **Who benefits**: households, policymakers, researchers, civil society and development partners, each with the
page they would use. `/social-protection/intervention-planner` brings the evidence together for one problem, one group
and one place; **Priority districts** flags where to act first with a rule anyone can check.

---

## Scoring crosswalk

| Criterion | Where it shows, in one click |
|---|---|
| 1. Problem understanding & relevance | Homepage gap chart + "Aligned to national priorities" (Vision 2050, NST2) |
| 2. Data use & methodology | `/about#sources` ("Collected with" column), Method, Principles; reproducible pipeline |
| 3. Tech innovation | `/financial-exclusion/risk-model`, `/social-protection/policy-scenarios`, IMBONIX AI with document reading |
| 4. Usability & design | Homepage, `/poverty-dynamics/district-map`, `/data/chart-library` |
| 5. Tangible impact | `/social-protection/priority-districts`, `/social-protection/intervention-planner`, About → Who benefits |

---

## Honest framing (worth saying out loud)

IMBONIX is independent and **not an official NISR product**. It describes places and groups, never scores individuals,
and presents relationships as associations, not causes. Every number is NISR's, with its source on screen; the analysis
and framing are ours.
