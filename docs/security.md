# Security

This page describes what IMBONIX protects, the controls in place, and the GitHub settings the repository owner must turn
on. To report a vulnerability, follow [SECURITY.md](../SECURITY.md).

## What there is to protect

IMBONIX publishes **aggregate statistics only**. It has no user accounts, no login, no database, no personal data and no
secrets at runtime. The realistic risks are:

| Risk | Why it matters |
| --- | --- |
| Credentials committed to git | A leaked token for GitHub, a cloud account or a data portal could be abused |
| Survey microdata committed to git | NISR's terms of use forbid redistribution, and records could be re-identified |
| Vulnerable dependencies | The web app and API run third-party code |
| Tampered data | A silently changed figure would mislead decisions |
| Browser attacks on the site | Script injection or framing |
| API abuse | Scraping or floods that deny service to others |

## Controls

### Repository

- `.gitignore` excludes `.env` files (except `.env.example`), keys and certificates, database files and dumps, editor
  folders, logs, and every raw, interim or processed data folder.
- The CI `secrets` job runs **gitleaks** over the full history on every push and pull request.
- All work goes through branches merged into `develop`; `main` changes only through a pull request from `testing` (see
  [CONTRIBUTING.md](../CONTRIBUTING.md)).
- CODEOWNERS requests a review for changes to data scripts, extracts and workflows.

### Dependencies

- `npm audit --audit-level=high` runs in CI for both apps and fails the build on high or critical advisories. On
  27 September 2026 both apps report 0 vulnerabilities, after moving the web app from Next.js 14.2.30 (one critical and
  four high advisories) to 15.5.26, and lifting Next's bundled PostCSS to 8.5.28.
- Dependabot opens weekly grouped updates for npm, and monthly ones for pip and GitHub Actions, against `develop`.

### Data integrity

- Every figure traces to a publication and table in the extracts.
- CI rebuilds the website data from the extracts and fails on any difference, so a hand edit to generated data is caught.
- Tests check that every indicator has a source and a known status, and that published intervals contain their
  estimates.

### Web app

`next.config.mjs` sends these headers on every response:

| Header | Value |
| --- | --- |
| `Content-Security-Policy` | `default-src 'self'`; scripts, styles, fonts and workers only from the site; images and connections also allowed to `tiles.openfreemap.org` (basemap); `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`; `frame-ancestors 'none'` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | camera, microphone, geolocation, payment and USB disabled |
| `Cross-Origin-Opener-Policy` | `same-origin` |

`X-Powered-By` is removed. External links open with `rel="noreferrer"`.

**Known limitation:** `script-src` includes `'unsafe-inline'`, because Next.js inlines hydration scripts. Removing it
needs a per-request nonce, which would make every page dynamic. The site renders no user-supplied content, which limits
the practical risk.

### API

- **helmet** security headers, and no `X-Powered-By`.
- **CORS allow-list** from `CORS_ORIGINS` (default: the local website only).
- **Rate limiting** per client IP on `/api/v1` (`RATE_LIMIT_PER_MINUTE`, default 120). `TRUST_PROXY` makes it work
  behind a load balancer.
- **Strict validation** with zod: path parameters must match safe patterns, and unknown or repeated query parameters are
  rejected.
- **Read-only**: only `GET` routes exist, and no request body is parsed.
- **Safe errors**: clients get a code, a message and a request id; stack traces are only logged. Errors are never cached.
- Incoming `X-Request-Id` values are accepted only if they match a safe pattern, so they cannot inject into logs.
- Configuration is validated at startup; the server refuses to start with invalid settings.

### Containers

The images run as the unprivileged `node` user, contain no build tools or dev dependencies, and include only the files
the service needs. `.dockerignore` keeps `.env` files, local data and git history out of the build context.

## GitHub settings to turn on

These are repository settings, so they cannot be committed. The owner should enable them under **Settings**:

1. **Rules → Rulesets → New branch ruleset** for `main`, `testing` and `develop`:
   - require a pull request before merging;
   - require status checks to pass: the `web`, `api`, `data`, `secrets` and `docker` jobs of the CI workflow;
   - block force pushes and deletions.

2. **Advanced Security → Dependabot alerts** and **Dependabot security updates**: enable both.
3. **Advanced Security → Secret scanning** and **Push protection**: enable if available. On private repositories they
   need GitHub Secret Protection; the gitleaks job covers the gap until then.
4. **Advanced Security → Private vulnerability reporting**: enable, so the reporting link in SECURITY.md works.

## If a secret is committed

1. **Revoke or rotate it first.** Deleting it from git does not make it safe: it stays in history and may already have
   been copied.
2. Move the value to an environment variable and add a placeholder to the relevant `.env.example`.
3. Agree with the team before rewriting history, then treat the old value as public regardless.
