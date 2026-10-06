# IMBONIX — solution overview

**Data for Inclusive Prosperity.** IMBONIX brings the National Institute of Statistics of Rwanda's (NISR) published
statistics on financial inclusion, poverty, nutrition, shocks and social protection together for every district and
sector in Rwanda, says how far to trust each figure, and turns them into clear starting points for action — with a
grounded AI assistant that lets anyone ask about their own place in plain language.

This is the one-document tour of the whole submission. For the live walkthrough see
[`demo-script.md`](demo-script.md); for the assistant's internals see [`../ai-assistant.md`](../ai-assistant.md).

- **Track:** NISR Big Data Hackathon 2026 — Track 2, Financial Inclusion & Poverty Reduction.
- **What it is:** an independent, open-source evidence platform. **Not** an official NISR product.
- **Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind. A JSON API serves the same figures the pages show.

---

## 1. The challenge

Track 2 asks teams to use NISR and complementary data to understand financial exclusion and poverty in Rwanda and to
point to where action is needed — in service of Rwanda's national goals (Vision 2050, NST2, the National Financial
Inclusion Roadmap 2025–2030 and the Social Protection Sector Strategic Plan).

## 2. The problem IMBONIX names

Access to finance in Rwanda is now almost universal — but **access is not health**. Only a fraction of adults are
financially *healthy*, and formal banking has been broadly flat since 2020. At the same time poverty and its related
needs — poor nutrition, exposure to shocks, thin social-protection reach — are **concentrated** in particular
districts and sectors, and the evidence for them is spread across many separate NISR surveys, censuses and reports.

The problem is therefore twofold: a **substantive gap** (inclusion without resilience, unevenly distributed) and an
**evidence gap** (the figures exist but are scattered, unlabelled for trust, and hard for a non-specialist to act on).

## 3. The solution

**IMBONIX = one trustworthy evidence base + one way to ask it anything.**

1. **The platform** gathers the published figures for every district and sector, labels every value for trust, and
   presents them as validated, accessible charts and maps organised around the questions people actually ask.
2. **IMBONIX AI** is a grounded assistant that answers open-ended questions — about any district, sector, cell or
   village — only from those published figures, in English, French or Kinyarwanda, by voice or text, and can read an
   uploaded chart or report. See [`../ai-assistant.md`](../ai-assistant.md).

Together they take a user from a national question to their own village and to a concrete next step.

## 4. What's in the platform

A consistent four-area structure, in the calm style of Rwanda's government services (gov.rw / Irembo):

- **Financial exclusion** — who is left out of finance, and who is included but not resilient; an explainable
  vulnerability risk model with its factors and limits stated.
- **Poverty dynamics** — who is poor, where, and what has changed; a validated district map and trends; where needs
  overlap.
- **Social protection** — who the programmes reach and how well; VUP payments; priority districts flagged by
  transparent rules; a policy-scenario and intervention planner.
- **Data** — every indicator with its table, year and trust label; a chart library; a JSON API and reproducible
  scripts.
- **Districts & About** — a profile for every district, and the full method, sources, principles and limits.

Live, data-derived counts (districts, sectors, cells, villages, indicators, publications) are shown on the
[About page](../../apps/web/src/app/about/page.tsx); they are computed from the data so they stay true as it changes.

## 5. Data use & methodology

- **NISR + external partners.** Figures come from EICV7, FinScope, the Rwanda DHS, the CFSVA, the Labour Force Survey,
  the 2022 census, the Establishment Census and more. The About → Sources table shows, per publication, how many
  indicators it gives and whether NISR collected it **with a partner** (ICF / The DHS Program for the DHS; the World
  Food Programme for the CFSVA).
- **Six trust labels.** Every value is one of: official estimate, IMBONIX calculation, model estimate, projection,
  scenario, or policy target — shown on screen with its source, table and year.
- **Honest aggregation.** Where NISR publishes a national or province figure it is used; otherwise those figures are
  weighted up from districts and **labelled as calculations**. Sector poverty rates are NISR small-area estimates (a
  model), compared within a district, not across the country.
- **Reproducible, and microdata-safe.** Scripts download the public files, extract the named tables and rebuild the
  site's data; automated checks rerun them. **Microdata is never committed or published.** IMBONIX describes places and
  groups — it never scores, ranks or selects individuals.

## 6. Technology

- **Web:** Next.js 15 App Router, React 19 server/client components, TypeScript (strict), Tailwind.
- **Grounded AI:** a same-origin route grounds Claude **or** free-tier Gemini in the NISR digest, streams the answer,
  reads attachments, and falls back to a deterministic on-device engine when no key is set — so it is always
  demonstrable. Full detail in [`../ai-assistant.md`](../ai-assistant.md).
- **Explainable models, not black boxes:** the vulnerability risk model and the policy-scenario tools state their
  factors, rules and limits.
- **Governed design system:** one brand colour defined in a single palette module, enforced by a test; charts validated
  for colour-blind readability, each with a legend and a table view.
- **Motion:** a site-wide scroll-reveal that respects reduced-motion and keeps all content in the DOM for
  accessibility and indexing.

## 7. Usability & design

Calm, government-style, and accessible by construction: keyboard and screen-reader support, a legend and a table view
for every chart, colour-blind-validated palettes, a search over every place / indicator / chart, and a plain line on
how to read each chart. IMBONIX AI brings the same figures to non-technical users in their own language, by voice if
they prefer.

## 8. Tangible impact — who benefits

| Audience | What they get | Start here |
|---|---|---|
| Vulnerable households | Where support arrives late and finance is far | Social protection → VUP payments |
| Policymakers | Policy levers, each flagged by one published figure and a checkable rule | Social protection → Priority districts |
| Researchers | Every figure with its table, year and trust label; a JSON API; rebuild scripts | Data |
| Civil society | Open figures with sources, to follow programmes and speak for places left behind | Districts |
| Development partners | Where poverty, exclusion, poor nutrition and shocks overlap | Poverty dynamics → Overlapping needs |

The platform ends in action: the **intervention planner** brings the evidence together for one problem, one group and
one place, and **priority districts** flags where to act first — always by a rule anyone can check.

## 9. Alignment with Rwanda's priorities

IMBONIX tracks the national targets behind **Vision 2050** and **NST2** — financial inclusion and social protection —
and shows how far today's published figure is from each goal, each with its baseline: the National Financial Inclusion
Roadmap 2025–2030 and the Social Protection Sector Strategic Plan.

## 10. How it maps to the judging criteria

| # | Criterion | Where it shows |
|---|---|---|
| 1 | Problem understanding & relevance (NST2 / Vision 2050) | Homepage gap chart + "Aligned to national priorities"; every AI answer framed gap → evidence → solution → who it helps |
| 2 | Data use & methodology (NISR + external) | About → Sources ("Collected with"), Method, Principles; six trust labels; reproducible pipeline; no microdata |
| 3 | Tech innovation | Explainable risk model, policy scenarios, and the grounded multimodal/multilingual/voice AI with offline fallback |
| 4 | Usability & design | Government-style system, validated accessible charts, site-wide search, plain-language AI |
| 5 | Tangible impact | Priority districts, intervention planner, five named audiences each with the page they would use |

## 11. Honest framing

IMBONIX is independent and **not an official NISR product**. Every number is NISR's or its partners', shown with its
source; the analysis and framing are ours. It describes places and groups, never individuals, and presents
relationships as **associations, not causes**. It does not measure the impact of any programme — that needs household
microdata over time and a comparison group — and it says so.

## 12. Run it

```bash
cd apps/web
npm install
npm run dev        # http://localhost:3000
```

Optionally set `ANTHROPIC_API_KEY` or a free `GEMINI_API_KEY` in `apps/web/.env` to turn on the generative AI layer;
without a key, IMBONIX AI answers from its on-device engine.
