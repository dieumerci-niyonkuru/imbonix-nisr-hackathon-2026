# IMBONIX — evidence for the Track 2 criteria

> **Submission package:** [Index](README.md) · [Solution overview](solution-overview.md) · [Demo script](demo-script.md) · [IMBONIX AI](../ai-assistant.md) · **Criteria evidence** · [AI disclosure](ai-disclosure.md)

This document answers each evaluation criterion point by point and names the **evidence to demonstrate** it — in the
live app, the repository, and this documentation. Every figure cited is NISR's, shown on screen with its source; the
analysis and framing are ours.

---

## 1 · Problem Understanding & Relevance

**The one specific problem.** Rwanda has all but solved *access* to finance — **96%** of adults are included (FinScope
2024) — but **not resilience**: only about **1 in 10** adults is financially *healthy*, and the share who are **banked
(22%) has not moved since 2020**. The households left behind are not spread evenly; they cluster in the same districts
where poverty, poor nutrition and shocks pile up.

**Who and where is affected.** Financial exclusion is highest in districts such as **Nyaruguru**; poverty is deepest in
the Southern Province (e.g. **Nyamagabe, Gisagara**). Rural households, women-led households and young people are the
most exposed. Every one of these is shown on the site with its NISR source and year.

**Link to national priorities.** The work serves **Vision 2050** (a high-income, inclusive economy) and the near-term
vehicles toward it — **NST2**, the **National Financial Inclusion Roadmap 2025–2030** and the **Social Protection
Sector Strategic Plan** — each tracked against its published baseline and target.

**Why current tools fall short.** The figures exist, but across many separate NISR surveys, censuses and reports,
unlabelled for trust, and hard for a non-specialist to turn into a decision. Conventional dashboards show *numbers*;
they rarely say how far to trust each one, where needs *overlap*, or **what to do next**.

**Evidence to demonstrate:** homepage gap chart + "Aligned to national priorities"; [`solution-overview.md`](solution-overview.md); ask IMBONIX AI "where is financial exclusion highest?".

---

## 2 · Data Use & Methodology

**NISR datasets, with years.** EICV7 (2023/24), FinScope (2024, with the 2020 round for comparison), the Rwanda DHS
(2025), CFSVA (2024), the Labour Force Survey (2025), the 2022 Population & Housing Census (RPHC5), the Establishment
Census (2023) and the EICV7 VUP survey. Each indicator records its **source, table, year and a trust label**.

**Sources, variables, limitations — documented.** About → Sources (`/about#sources`) lists every publication, how many
indicators it gives, and whether NISR collected it **with a partner** (ICF/The DHS Program; WFP for the CFSVA). Limits
are stated plainly (About → Limits): different survey years are never combined as one moment; sector poverty rates are
NISR small-area *model* estimates; the 2020 and 2024 "banked" definitions differ, so they are never plotted against
each other.

**Preprocessing — explained and reproducible.** Published tables are transcribed to CSV with their table references;
`scripts/data/build_web_data.py` standardizes **geographic identifiers** (district/sector names and codes, aligned to
geoBoundaries), checks for duplicates and missing values, and weights province/national figures from districts where
NISR does not publish them (labelled as calculations). **CI re-runs the pipeline and fails if the output does not match
exactly.** Raw microdata is never committed.

**External data — only where it adds value.** geoBoundaries (CC BY 4.0) for district/sector outlines and OpenFreeMap for
the basemap — used only for the maps.

**Analysis & AI, evaluated honestly.** An **explainable** financial-vulnerability model states its factors and limits
(results shown only once trained on microdata). Relationships are presented as **associations, not causes**. The AI
assistant is **grounded** in the published digest and instructed never to invent a number; it falls back to a
deterministic on-device engine. No data leakage: the site describes places and groups, never scores individuals.

**Evidence to demonstrate:** reproducible pipeline (`scripts/data/`, CI), [`../architecture.md`](../architecture.md),
[`../data/`](../data/), the validation tests (`apps/web` `npm test`), About → Method & Principles.

---

## 3 · Tech Innovation

**A working prototype, not a mockup.** A live Next.js 15 app plus a read-only JSON API — real pages, real interactions,
built from the real data. (Run locally in minutes; see [`../deployment.md`](../deployment.md).)

**Technology chosen to fit the problem.** Interactive district map, analytical dashboards and charts, an **explainable**
vulnerability indicator, and policy-scenario tools — each only where the data supports it.

**What is genuinely innovative (vs a conventional dashboard).**

| Most dashboards… | IMBONIX adds… |
|---|---|
| Show numbers | Labels every value for **trust** (six labels) and frames each as gap → evidence → solution → who it helps |
| Are read by analysts | A **grounded, multilingual (EN/FR/Kinyarwanda), multimodal, voice** assistant that answers about **any** district, sector, cell or village — and reads an uploaded chart or report |
| Break without a backend/key | A **deterministic on-device fallback**, so the demo always works |
| Stop at "here are the numbers" | Ends in **action**: priority districts and an intervention planner, by rules anyone can check |

**Evidence to demonstrate:** live demo; `/poverty-dynamics/district-map`, `/financial-exclusion/risk-model`,
`/social-protection/policy-scenarios`, IMBONIX AI; architecture in [`../architecture.md`](../architecture.md) and
[`../ai-assistant.md`](../ai-assistant.md).

---

## 4 · Usability & Design

**Responsive, laptop and mobile.** One governed design system; verified **no horizontal scrolling from 320px up**, and
layouts that adapt from phone to desktop.

**Readable, labelled, filterable.** Charts are **colour-blind-validated**, each with a legend, value labels and a
**table view**; sensible filters sit above the charts; a site-wide search covers every place, indicator and chart; a
consistent four-area structure means the address says where you are.

**Built for non-technical users.** Plain language throughout, the assistant in the reader's own language, and every
chart carries a short "how to read it" line — with **explanations and a recommended next step**, not unexplained
numbers.

**User feedback (honest status).** The interface follows the conventions of Rwanda's government services (gov.rw /
Irembo) and WCAG 2.1 AA, and was refined through internal review. **Structured feedback from representative users
(district officers, households) is the next step** before and during the pilot — see the impact plan below.

**Evidence to demonstrate:** the live app; `/data/chart-library`; the accessibility notes in the main
[README](../../README.md); screenshots in [`../screenshots/`](../screenshots/).

---

## 5 · Tangible Impact

**Who uses it, and the decision it helps.**

| User | Decision it supports |
|---|---|
| District / sector officers | Where to focus limited support first, by a checkable rule |
| Policymakers (MINECOFIN, LODA, AFR) | Which districts each policy lever flags, and distance to national targets |
| Development partners (WFP, AFR, UNICEF) | Where poverty, exclusion, nutrition and shocks **overlap**, to aim programmes |
| Civil society & researchers | Follow programmes with sourced figures; reuse the open data and API |
| Vulnerable households (via intermediaries) | Where payments arrive late and formal finance is far |

**Measurable indicators of success (impact plan).**

- **Reach:** number of districts/sectors whose teams use the priority flags or intervention planner in a planning cycle.
- **Decision speed:** time from question to a sourced, district-level answer (minutes on IMBONIX vs. days compiling
  tables) — measurable in pilot user sessions.
- **Targeting quality:** share of flagged "priority" districts that partners confirm as genuine priorities (precision
  against expert judgement).
- **Adoption:** monthly active users, assistant questions answered, and partner organisations integrating the JSON API.
- **Transparency:** share of on-screen figures carrying a source and trust label (target: 100%, currently the design
  rule).

**Credible path to adoption.**

- **Data access:** built entirely on **public** NISR publications and open geodata — no restricted data needed to run.
- **Operating cost:** the web app is static-friendly (low hosting cost); the AI uses a **free Gemini tier** or an
  optional paid key, with an offline fallback — so running a demo costs effectively nothing.
- **Deployment:** one-click on Vercel, or Docker on any host — [`../deployment.md`](../deployment.md).
- **Responsible handling of sensitive information:** IMBONIX describes **places and groups, never individuals**, and
  **never publishes microdata**; it states uncertainty and presents relationships as associations, not causes.

**Evidence to demonstrate:** `/social-protection/priority-districts`, `/social-protection/intervention-planner`,
About → Who benefits; this impact plan; the deployment pathway in [`../deployment.md`](../deployment.md).

---

<div align="center">

[Solution overview](solution-overview.md) · [Demo script](demo-script.md) · [IMBONIX AI](../ai-assistant.md) · [Main README](../../README.md)

</div>
