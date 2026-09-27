# Contributing to IMBONIX

Thank you for helping. This guide covers how work moves from an idea to `develop`, through `testing`, and into `main`
at release. For setting up your machine, see [docs/development.md](docs/development.md).

## Branches

`main` is the production branch. It is protected: nothing is pushed to it directly, and it changes only through a pull
request from `testing` once a release has passed its checks.

| Branch       | Purpose                                                              | Merges into |
| ------------ | -------------------------------------------------------------------- | ----------- |
| `main`       | Production. Protected; changed only by pull request from `testing`.  |             |
| `testing`    | Integration and release checks on what `develop` holds.              | `main`      |
| `develop`    | The current development version. Never commit to it directly.       | `testing`   |
| `feature/*`  | New pages, charts, endpoints, for example `feature/sector-map`.      | `develop`   |
| `fix/*`      | Bug fixes, for example `fix/map-legend-overflow`.                    | `develop`   |
| `security/*` | Security improvements, for example `security/rate-limits`.           | `develop`   |
| `docs/*`     | Documentation, for example `docs/api-examples`.                      | `develop`   |
| `chore/*`    | Tooling, dependencies and repository settings.                       | `develop`   |

Start each branch from `develop` and merge it back with a merge commit (`--no-ff`) so each branch stays visible in the
history, then delete the branch. When `develop` is ready for a release, merge it into `testing`, run the full checks
there, and open a pull request from `testing` to `main`.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): summary` in the imperative mood,
under about 72 characters, with a body when the reason is not obvious.

```text
feat(map): zoom to a district's sectors on click
fix(api): return 400 for an unknown indicator id
docs(readme): add deployment instructions
test(web): cover the within-district colour breaks
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `data`.

One logical change per commit. Do not pad the history with empty or trivial commits.

## Before you open a pull request

In `apps/web`:

```bash
npm run format:check && npm run lint && npm run typecheck && npm test && npm run build
```

In `apps/api`:

```bash
npm test
```

At the repository root, if you changed data or scripts:

```bash
python -m unittest discover -s scripts/data/tests -v
```

CI runs the same checks, plus a secret scan, a dependency audit and a Docker build. Merge only when they pass; the
repository owner can enforce this with a branch ruleset (see [docs/security.md](docs/security.md#github-settings-to-turn-on)).

## Data rules

These apply to every change that shows a number.

- **Trace it.** Every value comes from a published NISR source, and the chart's source line names it.
- **Label it.** Mark each value as observed, calculated, model estimate, projection or scenario.
- **Don't imply cause.** The surveys are cross-sections. Write "is associated with", not "causes" or "drives".
- **No microdata in git.** Survey files stay in the ignored `data/raw` folder. NISR's terms forbid redistribution.
- **Stay independent.** IMBONIX is not an NISR product. Don't use NISR's logo, and don't word anything as an
  endorsement.

## Secrets

Never commit `.env` files, keys, tokens or passwords. Add new settings to the relevant `.env.example` with a
placeholder value, and read them from the environment in code. See [SECURITY.md](SECURITY.md).

## AI assistance

Parts of this project were written with AI assistance (see
[docs/submission/ai-disclosure.md](docs/submission/ai-disclosure.md)). Whoever merges a change is responsible for
checking it, including every number and claim.
