# IMBONIX AI — the grounded assistant

> **Submission package:** [Index](submission/README.md) · [Solution overview](submission/solution-overview.md) · [Demo script](submission/demo-script.md) · **IMBONIX AI** · [AI disclosure](submission/ai-disclosure.md)

IMBONIX AI is the conversational layer of the platform. It lets anyone — a household, a district officer, a
policymaker, a researcher — ask about financial inclusion and poverty in Rwanda in plain language, in English, French
or Kinyarwanda, and get an answer built **only** from NISR's published figures, with the source named every time.

This document explains what it is, how it is built, why it is trustworthy, and how it maps to the hackathon's judging
criteria. For the whole-platform story see [`submission/solution-overview.md`](submission/solution-overview.md); for the
live walkthrough see [`submission/demo-script.md`](submission/demo-script.md).

---

## 1. What it does

- **Answers open-ended questions** about any district, sector, cell or village, and about every measure the site
  carries — poverty, financial access and health, nutrition, shocks, social protection and more.
- **Frames each answer the way the challenge asks:** it names the gap, grounds it in the NISR figure, points to the
  solution, and says who it helps — instead of dumping a number.
- **Compares places and measures as tables** when a comparison is asked for, so the answer is scannable.
- **Reads an uploaded picture or document** (a chart photo, a PDF report, a screenshot) and relates what it finds back
  to the NISR data.
- **Speaks and listens.** It can read answers aloud and take a question by voice (Web Speech API, in browsers that
  support it).
- **Asks a clarifying question** when a request is ambiguous, rather than guessing.
- **Speaks like a guide, not a database:** no indicator IDs, study slugs or internal identifiers ever reach the reader;
  it offers a clear next step.
- **Always works.** With no API key configured it falls back to an instant on-device engine over the same figures, so a
  demo never depends on a network call or a secret.

---

## 2. Architecture at a glance

```
Browser (ImbonixAI component)
  │  POST /api/assistant   (same-origin only; no key in the browser)
  ▼
Next.js route  app/api/assistant/route.ts   (runtime = nodejs, force-dynamic)
  │  • per-IP rate limit (30 / 5 min)
  │  • place resolution injected into the last user turn
  │  • system prompt = instructions + full NISR data digest  (grounding)
  ▼
One of two backends, chosen by which key is present:
  • Anthropic Claude   (ANTHROPIC_API_KEY)        → preferred when set
  • Google Gemini      (GEMINI_API_KEY / GOOGLE_API_KEY, free tier)
  │  streamed back to the browser as Server-Sent Events
  ▼
If no key, or the backend fails after retries (HTTP 502):
  • Client falls back to the on-device deterministic engine (lib/assistant.ts)
```

Key files:

| File | Responsibility |
|---|---|
| `apps/web/src/app/api/assistant/route.ts` | The server route: backend selection, streaming, retries, rate limit, safety limits. |
| `apps/web/src/lib/ai-context.ts` | The system prompt: the instructions and the whole NISR data digest that grounds every answer. |
| `apps/web/src/lib/ai-places.ts` | Resolves a place name (cell / village / sector) to its district and injects the context. |
| `apps/web/src/components/assistant/imbonix-ai.tsx` | The floating assistant: chat UI, attachments, voice, Markdown/table rendering, fallback. |
| `apps/web/src/components/assistant/ai-mark.tsx` | The IMBONIX AI mark (a conversation bubble with an insight spark). |
| `apps/web/src/lib/assistant.ts` | The on-device engine that answers from the same figures when no key is set. |

---

## 3. Grounding — why the answers can be trusted

The assistant does **not** free-associate. Every request carries a system prompt assembled in `ai-context.ts` from two
parts:

1. **Instructions** — who it is, the challenge it serves, how to answer (tight and fast, a table for comparisons, a
   clarifying question when unsure, the reader's own language), what to hide (no technical identifiers), and what it is
   for (it declines off-topic requests).
2. **A data digest** — a compact, text rendering of the site's own figures: the national findings (FinScope, EICV7,
   targets and national frameworks), a block per dimension, and the geography (sectors by district with their poverty
   estimates). This is the same data the pages show, turned into prose the model reads as context.

Because the figures travel **with** the question, the model answers from them rather than from its training memory. It
is instructed to name the source and never to invent a number. No microdata is ever included — only published,
aggregate figures that already appear on the site.

This is retrieval-style grounding: the knowledge is supplied at request time, so updating the data updates the
assistant, with no retraining.

---

## 4. The two backends

The route supports two interchangeable model backends and picks whichever key is present (Anthropic first):

- **Anthropic Claude** — model `claude-opus-5-5`, via the official `@anthropic-ai/sdk`, streamed.
- **Google Gemini** — model `gemini-flash-lite-latest` by default (override with `GEMINI_MODEL`), via the REST
  streaming endpoint with an `x-goog-api-key` header. Gemini has a **no-cost free tier**, so the full generative
  experience can be demonstrated without any paid account.

Both receive the identical system prompt and the identical attachment, so the behaviour is the same whichever is
configured. Responses stream token-by-token to the browser over Server-Sent Events, so the answer appears as it is
written.

Transient upstream failures (`429`, `500`, `502`, `503`, `504`) are retried a few times with back-off. If the backend
is still unreachable, the route returns HTTP 502 with `{ fallback: true }`, and the client answers from the on-device
engine instead — the user still gets a grounded reply.

---

## 5. Multimodal input

A person can attach an image, a PDF or a text file with the **+** button ("Add photos & files"). The file is read in
the browser, sent as base64 to the route, and forwarded to the model as inline data alongside the question. Limits are
enforced server-side (images must be a known type; a payload over ~6 MB is refused; text attachments are truncated), so
an exposed demo endpoint stays safe and cheap. The model is asked to relate what it sees to the NISR figures rather than
to read the document in isolation.

---

## 6. Place intelligence

Rwanda's administrative hierarchy runs province → district → sector → cell → village. NISR publishes figures to
district and sector level; cells and villages inherit their sector's figures. `ai-places.ts` builds a lookup from the
site's own `places.json` and, when a question names a place, injects a short note ("*X (cell) is in Y sector, Z
district*") into the last user turn. The model can then answer about a named cell or village by using the right
sector's and district's published figures — and it says so plainly, without exposing any internal identifier.

---

## 7. Voice

- **Reading aloud** uses `speechSynthesis`, chunked by sentence with a keep-alive so long answers don't cut off, with
  play / pause / stop controls and an auto-read toggle.
- **Dictation** uses `SpeechRecognition` where the browser supports it (Chrome / Edge). The controls appear only when
  the browser exposes the capability, so nothing breaks where it does not.

---

## 8. Safety, privacy and cost

- **The key never reaches the browser.** The browser only ever calls the same-origin `/api/assistant` route; the key is
  read from the server environment. Keys live in a git-ignored `.env` and are never committed.
- **Rate limited.** A best-effort per-IP limit (30 requests / 5 minutes) keeps a public demo from running up a bill.
- **Bounded.** Conversation length, per-turn length, output tokens and attachment size are all capped.
- **On-topic.** The assistant answers about IMBONIX and Rwanda's inclusion and poverty data, and declines unrelated
  requests.
- **No invented numbers.** It is grounded in, and instructed to cite, published figures only; the on-device fallback is
  deterministic.

---

## 9. How it maps to the judging criteria

| Criterion | How IMBONIX AI contributes |
|---|---|
| **1 · Problem understanding & relevance** | Every answer is framed as gap → evidence → solution → who it helps, mirroring the challenge and Rwanda's national priorities. |
| **2 · Data use & methodology** | Grounded in the same NISR + partner figures the site cites; names the source; never invents a number; no microdata. |
| **3 · Tech innovation** | A grounded, streaming, multimodal, multilingual, voice-capable assistant with a two-backend design and a deterministic offline fallback. |
| **4 · Usability & design** | Plain-language, jargon-free guidance in the user's own language, with tables, voice and a clean branded mark; works for non-technical users. |
| **5 · Tangible impact** | Lets anyone, anywhere, interrogate the evidence for their own district and get a clear next step — the platform in one question. |

---

## 10. Configuration

Set one key in `apps/web/.env` (git-ignored) to turn on the generative layer:

```bash
# Preferred when present:
ANTHROPIC_API_KEY=sk-ant-...
# Or the free option:
GEMINI_API_KEY=...            # or GOOGLE_API_KEY
# Optional override of the Gemini model:
GEMINI_MODEL=gemini-flash-lite-latest
```

With no key set, IMBONIX AI runs entirely on the on-device engine — so it is always demonstrable.
