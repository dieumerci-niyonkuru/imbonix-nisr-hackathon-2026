# Deployment

**Status: IMBONIX is being (re)deployed to Vercel from `main`; the public URL will be recorded here once live.** The website and its JSON API
(`/api/v1`) deploy together as one Vercel project. Both production Docker images have also been built, started and
checked locally: they reach a healthy state, every page renders with no console errors, and the interactive map loads.

**Recommended setup — everything on Vercel, one project.** The JSON API is built into the web app
([apps/web/src/app/api/v1](../apps/web/src/app/api/v1)), so deploying the **website to
[Vercel](#deploy-the-web-app-to-vercel)** also serves the API at `/api/v1` on the same URL — there is nothing else to
run, and the Data page's "live API" panel reads **Connected** automatically. Record the live URL and date here and in
the README once it is up.

**Optional — a separate API service.** If you want the JSON API as an independent endpoint (for example to hand partners
a URL that is not tied to the site), deploy the standalone [apps/api](../apps/api) to
[Railway](#deploy-the-api-to-railway) and point Vercel's `API_URL` at it. The website works the same either way; the
built-in API is the default.

## What gets deployed

| Service | Image | Port | Health check | Needs |
| --- | --- | --- | --- | --- |
| Web app | [apps/web/Dockerfile](../apps/web/Dockerfile) | 3000 | `GET /api/health` | Nothing: the data is built into the image |
| API | [apps/api/Dockerfile](../apps/api/Dockerfile) | 4000 | `GET /health` | Nothing: the data is copied into the image |

The website does not call the API, so each service can be deployed, scaled or left out independently. There is no
database, no secret and no persistent storage.

Both images:

- are multi-stage builds on `node:22-alpine`, so build tools stay out of the runtime image;
- run as the unprivileged `node` user;
- define a Docker `HEALTHCHECK`;
- stop on `SIGTERM`; the API first finishes in-flight requests (up to 10 seconds);
- log to stdout (the API writes one JSON line per request).

Local image sizes: about 385 MB for the web app and 254 MB for the API.

## Environments

| Environment | How it runs | Purpose |
| --- | --- | --- |
| Development | `npm run dev` in each app (see [development.md](development.md)) | Hot reload; the web app allows `eval` for React refresh |
| Local production | `docker compose up --build` | The exact images that would be deployed |
| CI | GitHub Actions `docker` job | Builds both images, starts them, waits for health checks, runs smoke requests |
| Production | Any container host (see below) | Not yet set up |

## Run the production images locally

```bash
docker compose up --build            # web on :3000, API on :4000
WEB_PORT=3300 API_PORT=4400 docker compose up --build   # other ports
docker compose down
```

Compose passes these API settings from your shell or an untracked `.env` next to `docker-compose.yml`:
`CORS_ORIGINS`, `RATE_LIMIT_PER_MINUTE`, `TRUST_PROXY`, `LOG_LEVEL`. The full list is in [api.md](api.md#configuration).

To build a single image:

```bash
docker build -f apps/web/Dockerfile -t imbonix-web .   # context is the repository root
docker build -f apps/api/Dockerfile -t imbonix-api .
```

## Production settings

### Web app

| Setting | Value |
| --- | --- |
| Start command | `node server.js` (already the image's `CMD`) |
| `PORT` / `HOSTNAME` | `3000` / `0.0.0.0` by default; set `PORT` if the platform assigns one |
| Health check path | `/api/health` |

The web app needs **no** runtime variables to run. To turn on IMBONIX AI's generative answers in production, set **one**
optional server-side key — `GEMINI_API_KEY` (Google Gemini, free tier) or `ANTHROPIC_API_KEY` (Claude, used in preference
when present). The key is read only on the server and never sent to the browser; with no key the assistant falls back to
its on-device engine, so the site is fully functional either way. See [ai-assistant.md](ai-assistant.md).

### API

| Setting | Recommended production value |
| --- | --- |
| `NODE_ENV` | `production` (set in the image) |
| `CORS_ORIGINS` | The website's public origin, e.g. `https://imbonix.example`; use `*` only if the API is meant to be fully public |
| `TRUST_PROXY` | `1` behind a platform router or load balancer, so rate limits apply per real client |
| `RATE_LIMIT_PER_MINUTE` | `120` to start; raise it if partners integrate |
| `LOG_LEVEL` | `info` |
| Start command | `node src/server.js` (the image's `CMD`) |
| Health check path | `/health` |

## Hosting options

Any service that runs a Docker image and routes HTTPS traffic works: for example Google Cloud Run, Azure Container Apps,
AWS App Runner, Fly.io, Render or Railway. For each service:

1. Point the service at the repository and the Dockerfile path (`apps/web/Dockerfile` or `apps/api/Dockerfile`) with the
   **repository root** as the build context, or push images built by CI to a registry.
2. Set the port (3000 or 4000) and the health check path.
3. Set the API variables above.
4. Deploy from `main` only, after CI has passed.
5. Put the platform's HTTPS domain on the web service. HSTS and TLS are handled by the platform.

The web app can also run on Vercel without Docker (import `apps/web` as the project root); the security headers are in
`next.config.mjs`, so they apply there too.

## Deploy the web app to Vercel

Vercel runs a Next.js app with no Dockerfile and gives an HTTPS URL in minutes — and it deploys the whole thing,
website and JSON API together.

1. Push the branch you want live (normally `main`, after `testing` is merged in by pull request and CI is green).
2. On [vercel.com](https://vercel.com), **Add New → Project**, import
   `dieumerci-niyonkuru/imbonix-nisr-hackathon-2026`, and set the **Root Directory** to `apps/web`. Vercel detects
   Next.js; keep the default build and output settings.
3. **The API needs no setup** — it ships inside this deployment, so `/api/v1` is live automatically and the Data page
   reads **Connected**. Set an `API_URL` environment variable only if you deployed a separate API service (see below)
   and want the panel to point at that one instead.
4. **Optional — turn on generative AI:** under **Settings → Environment Variables** add `GEMINI_API_KEY` (free tier) or
   `ANTHROPIC_API_KEY`. Leave it out and the assistant still works from the on-device engine.
5. **Deploy.** Then open `/`, the assistant (ask one question), `/poverty-dynamics/district-map` (the basemap loads),
   `/data` (the "live API" panel reads **Connected**) and `/api/v1` (returns the API index as JSON).
6. Put the Vercel URL in this file and the README, with the date.

## Deploy the API to Railway

_Optional — only if you want the JSON API as a separate service. The website already serves it at `/api/v1`, so most
deployments skip this._ To run it standalone, the `apps/api` service deploys to [Railway](https://railway.com) straight
from this repository. A repo-root [`railway.json`](../railway.json) points Railway at `apps/api/Dockerfile`, so there is
almost nothing to set.

1. On [railway.com](https://railway.com), **New Project → Deploy from GitHub repo**, and pick
   `dieumerci-niyonkuru/imbonix-nisr-hackathon-2026`. Leave the service **Root Directory** at the repository root (`/`) —
   the API's Dockerfile copies the shared data from `apps/web`, so it must build from the root. Railway reads
   `railway.json` and builds `apps/api/Dockerfile` automatically.
2. Under **Variables**, set:
   - `CORS_ORIGINS` = your Vercel URL, e.g. `https://imbonix.vercel.app` (or `*` for a fully public API).
   - `TRUST_PROXY` = `1` (Railway runs the service behind its router, so rate limits see the real client IP).
   - `RATE_LIMIT_PER_MINUTE` = `120` (optional; raise it if partners integrate).
   - `PORT` is injected by Railway and read automatically — do not hard-code it.
3. Under **Settings → Networking**, **Generate Domain** to get the public HTTPS URL.
4. **Deploy.** Check `GET /health` returns `{"status":"ok", ...}` and `GET /api/v1/districts` returns data.
5. Put that URL into Vercel's `API_URL` (step 3 above), redeploy the web app, and record the URL here and in the README.

The website never calls the API from the browser. The only live link is the Data page's status panel, which the Vercel
server fetches server-side — so no CORS setup is needed for the site itself; `CORS_ORIGINS` only matters if other
browser apps call the API directly.

## Production hardening notes

- **Microphone permission.** `next.config.mjs` sends `Permissions-Policy: microphone=(self)` so the browser can prompt
  for the assistant's voice input on this origin only; camera, geolocation, payment and USB stay disabled. Voice input
  needs HTTPS (which Vercel and every host above provide) and a Chromium browser.
- **Assistant rate limit is best-effort.** The per-IP limit in `app/api/assistant/route.ts` is in-memory, so it holds
  within one instance but is not shared across instances and resets on a cold start. It is enough to stop casual abuse of
  a demo. For a hardened multi-instance deployment, put a platform or edge rate limit in front of `/api/assistant`, or
  move the counter to a shared store (e.g. Upstash/Vercel KV). The assistant's own output, turn and attachment caps
  bound the cost of any single request regardless.
- **Trust the client IP.** That limit keys on `x-forwarded-for`. Deploy behind a router that overwrites this header with
  the real client IP (Vercel and the Docker hosts above do); on a self-managed proxy, strip any inbound
  `X-Forwarded-For` and set it yourself, so a client cannot spoof it to dodge the limit.

## Release checklist

- [ ] `testing` is merged into `main` by pull request, and CI is green on `main`.
- [ ] `docker compose up --build` works locally from a clean checkout.
- [ ] Both health checks return `"status": "ok"` on the deployed URLs.
- [ ] Spot-check `/`, `/poverty-dynamics/district-map` (the interactive map loads its basemap and sectors), a district page and `/data`.
- [ ] Response headers include `Content-Security-Policy` on the web app, and `X-Request-Id` and `RateLimit` on the API.
- [ ] `CORS_ORIGINS` names only the real website origin.
- [ ] The README states the deployed URLs and the date of the deployment.

## Rollback

Every deployment is an immutable image. Roll back by redeploying the previous image or the previous commit on `main`.
Nothing stateful needs restoring.

## Monitoring

- Point an uptime monitor at both health endpoints.
- The API's JSON logs can be filtered by `level` and `status`; every error response includes the `requestId` that appears
  in the log line.
- The CI `npm audit` step (and GitHub's Dependabot alerts, if enabled) flags vulnerable dependencies; upgrade them on `develop` and redeploy.
