<div align="center">

# IMBONIX — Submission Package

**NISR Big Data Hackathon 2026 · Track 2 — Financial Inclusion & Poverty Reduction**

*Data for Inclusive Prosperity*

</div>

---

Everything a judge needs, in reading order. Each document stands on its own; together they make the full case.

| # | Read this | For | Time |
|---|---|---|---|
| 1 | **[Solution overview](solution-overview.md)** | The whole submission: problem → solution → data → tech → design → impact, with a **criterion-by-criterion scorecard**. Start here. | ~5 min |
| 2 | **[Demo script](demo-script.md)** | A **90-second** pitch and a **3-minute** walkthrough, each mapped to the five criteria. Use it to drive the live app. | 1–3 min |
| 3 | **[IMBONIX AI](../ai-assistant.md)** | How the grounded, multilingual, multimodal, voice-capable assistant is built, and why its answers can be trusted. | ~4 min |
| 4 | **[AI-assistance disclosure](ai-disclosure.md)** | Required by the rules: how AI tools were used, and the team's responsibility for every figure. | ~1 min |

## The one-paragraph version

Rwanda has all but solved **access** to finance (96% included, FinScope 2024) but not **resilience** — only ~1 in 10
adults is financially healthy, and the households left behind cluster where poverty, poor nutrition and shocks overlap.
**IMBONIX** brings NISR's published figures together for all **30 districts** and **416 sectors**, labels every value
for trust, and turns them into clear starting points for action — paired with **IMBONIX AI**, a grounded assistant that
answers open questions about any place in plain language (EN / FR / Kinyarwanda), by voice or text, and reads uploaded
charts and reports. It is independent, open-source, and **not an official NISR product**.

## Five criteria, in one click each

| Criterion (20 pts) | Where to see it |
|---|---|
| 1 · Problem understanding & relevance | Homepage gap chart + "Aligned to national priorities"; ask the assistant |
| 2 · Data use & methodology | `/about#sources` (the "Collected with" column), Method & Principles |
| 3 · Tech innovation | `/financial-exclusion/risk-model`, `/social-protection/policy-scenarios`, IMBONIX AI |
| 4 · Usability & design | Homepage, `/poverty-dynamics/district-map`, `/data/chart-library` |
| 5 · Tangible impact | `/social-protection/priority-districts`, the intervention planner, About → Who benefits |

## Run or view it

- **Locally:** `cd apps/web && npm install && npm run dev` → <http://localhost:3000>
- **Live:** _deploy and add the public URL here_ — see the [Vercel quickstart](../deployment.md#deploy-the-web-app-to-vercel-fastest).
- **Turn on the AI (optional):** set a free `GEMINI_API_KEY` (or `ANTHROPIC_API_KEY`) in `apps/web/.env`; without a key
  the assistant uses its on-device engine, so the demo never depends on a secret.

## Submission checklist (per the rules)

- [ ] **Public GitHub link** — this repository.
- [ ] **Deployed app link** — deploy to Vercel and record the URL here and in the main [README](../../README.md).
- [ ] **Documentation** — this package, plus the top-level [README](../../README.md) and [docs/](../).
- [ ] **AI disclosure** — [ai-disclosure.md](ai-disclosure.md), with the specific tools recorded.
- [ ] **Team** — exactly 2 students, at least one Rwandan citizen; student IDs ready.
- [ ] **Screenshots** — add to [docs/screenshots/](../screenshots/) (guide there) and uncomment the README tags.

<div align="center">

[Solution overview](solution-overview.md) · [Demo script](demo-script.md) · [IMBONIX AI](../ai-assistant.md) · [Main README](../../README.md)

</div>
