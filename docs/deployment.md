# Deployment

**Status (27 September 2026): IMBONIX has not been deployed to a public host.** Both production Docker images have been
built, started and checked locally: they reach a healthy state, every page renders with no console errors, and the
interactive map loads. Nothing below has been run against a real hosting provider yet.

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

The web app reads no secrets and needs no runtime variables.

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

## Release checklist

- [ ] `testing` is merged into `main` by pull request, and CI is green on `main`.
- [ ] `docker compose up --build` works locally from a clean checkout.
- [ ] Both health checks return `"status": "ok"` on the deployed URLs.
- [ ] Spot-check `/`, `/map` (the interactive map loads its basemap and sectors), a district page and `/data`.
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
- Dependabot and the CI `npm audit` step flag vulnerable dependencies; rebuild and redeploy after merging their updates.
