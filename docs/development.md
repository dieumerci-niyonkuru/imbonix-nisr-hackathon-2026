# Development guide

How to set up IMBONIX on your machine, run it, test it and change it. For the branch and commit workflow, see
[CONTRIBUTING.md](../CONTRIBUTING.md).

## Prerequisites

| Tool | Version | Needed for |
| --- | --- | --- |
| Node.js | 22.9 or later | Web app and API |
| npm | 10 or later | Installing packages |
| Python | 3.12 or later | Rebuilding data and running the data tests |
| Docker Desktop | Any recent version | Optional: running the production images |
| Git with SSH access to GitHub | | Cloning and pushing |

## Set up

```bash
git clone git@github.com:dieumerci-niyonkuru/imbonix-nisr-hackathon-2026.git
cd imbonix-nisr-hackathon-2026

cd apps/web && npm ci && cd ../..
cd apps/api && npm ci && cd ../..
```

No `.env` file is required. To change a setting, copy the app's `.env.example` to `.env` and edit it; `.env` files are
ignored by git.

## Run

| What | Command | URL |
| --- | --- | --- |
| Web app, hot reload | `npm run dev` in `apps/web` | <http://localhost:3000> |
| Web app, production build | `npm run build`, then `npm run start` in `apps/web` | <http://localhost:3000> |
| API, restarts on changes | `npm run dev` in `apps/api` (loads `.env` if present) | <http://localhost:4000/health> |
| Both production images | `docker compose up --build` at the root | ports 3000 and 4000 |

`npm run dev` and `npm run build` first copy the MapLibre worker into `public/vendor/` (it is ignored by git), because
bundlers do not emit it.

Stop the dev server before running `npm run build`: both use the `.next` folder.

## Check your work

Run these before opening a pull request. CI runs the same commands.

```bash
# apps/web
npm run format:check   # Prettier (npm run format fixes it)
npm run lint           # ESLint with Next.js and accessibility rules; warnings fail
npm run typecheck      # generates Next route types, then runs tsc
npm test               # Vitest unit tests
npm run build          # production build

# apps/api
npm test               # node:test and supertest

# repository root
python -m unittest discover -s scripts/data/tests -v
```

Where tests live:

| Area | Location | Framework |
| --- | --- | --- |
| Web logic | `apps/web/src/lib/*.test.ts` | Vitest |
| API | `apps/api/tests/*.test.js` | node:test and supertest |
| Data build | `scripts/data/tests/` | unittest (standard library) |

Tests run against the real published data, so they also catch data mistakes: a missing source, an interval that does not
contain its estimate, or generated files that no longer match the extracts.

## Common tasks

### Add or correct a figure

Follow [database.md](database.md#updating-the-data): edit the extract, run `python scripts/data/build_web_data.py`,
run the tests, and commit the extract and generated files together.

### Add a page

1. Create `apps/web/src/app/<route>/page.tsx` with `metadata` (title and description).
2. Add it to `NAV_GROUPS` or `NAV_LINKS` in `apps/web/src/components/layout/nav.ts`, which the site search and the
   breadcrumbs read. The header only links the homepage focus areas, so link the page from the homepage tab it supports.
3. Label every value with its status, and give every chart a source line and a text or table alternative.

### Add an API endpoint

1. Add a route in `apps/api/src/routes/` with zod schemas for `params` and `query` (use `z.strictObject` so unknown
   parameters are rejected).
2. Read data through `services/data-store.js`; respond with `sendData(response, data, meta)`; raise `HttpError`s for
   failures.
3. Add tests in `apps/api/tests/api.test.js`, and document the endpoint in [api.md](api.md).

### Work with the logo and colours

The logo files in `apps/web/public/brand/` are vectors. The emblem (`imbonix-emblem.svg`) and the favicon mark
(`imbonix-mark.svg`) are drawn by hand; the wordmark, tagline and lockups are generated from the site's Lexend font:

```bash
pip install fonttools brotli
python scripts/brand/make_logo_svgs.py        # needs apps/web/node_modules (npm ci)
python scripts/brand/generate_palette.py      # prints the data colour ramps in apps/web/src/lib/palette.ts
```

Every colour lives in `apps/web/src/lib/palette.ts`, derived from the logo. A test fails if a component writes a hex
colour or uses a Tailwind default colour family instead.

## Code style

- TypeScript is strict; avoid `any`.
- Prettier formats everything (line width 130, Tailwind classes sorted by the plugin).
- Components are server components unless they need state or browser APIs; client components start with `"use client"`.
- Name things for what they mean to users (`reachScenario`, `flagsFor`) and keep comments for the reasons behind the
  code.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| "Worker failed to load" on the map | Run `npm run dev` or `npm run build` (not `next dev` directly), so the MapLibre worker is copied to `public/vendor/` |
| `Port 3000 is in use` | Another dev server is still running. On Windows a stopped terminal can leave `node.exe` behind: find it with `Get-NetTCPConnection -LocalPort 3000` and stop that process |
| Prettier reports every file changed on Windows | Line endings: the repository uses LF (`.gitattributes`). Run `git add --renormalize .` |
| TypeScript errors about missing `.next/types` | Run `npm run typecheck`, which generates the route types first |
| `build_web_data.py` cannot download boundaries | It fetches geoBoundaries from github.com on first run. If HTTPS to GitHub is blocked, copy the two files into `data/raw/geo/` by other means |
