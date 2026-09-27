# Security policy

## Reporting a vulnerability

Please report security problems privately through GitHub's
[private vulnerability reporting](https://github.com/dieumerci-niyonkuru/imbonix-nisr-hackathon-2026/security/advisories/new),
not in a public issue. Include the affected page or endpoint, steps to reproduce and the impact you expect. We aim to
acknowledge reports within three working days.

Please also report, the same way, any figure that could identify a person or household, or any file that looks like
survey microdata.

## Supported versions

Until the first production release, the current version on `develop` is supported; after it, the latest release on
`main`. Fixes are made on a `fix/*` or `security/*` branch cut from `develop` and merged back into `develop`.

## More detail

[docs/security.md](docs/security.md) describes what IMBONIX protects, the controls in place (secret scanning, dependency
audits, security headers, API validation and rate limits), known limitations, and the GitHub settings the repository owner
should enable.
