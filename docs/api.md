# API reference

The IMBONIX API is a read-only JSON service over the same published aggregates as the website: 30 districts,
67 indicators and 416 sectors, each with its source. It needs no authentication.

- Local base URL: `http://localhost:4000`
- Version prefix: `/api/v1`
- Source: [apps/api](../apps/api)

IMBONIX is an independent project. The figures come from the National Institute of Statistics of Rwanda (NISR) and its
partners; the API is not an official NISR service.

## Conventions

**Successful responses** always have the shape `{ "data": ..., "meta": { ... } }`. Lists include `meta.count`, and
filtered lists echo `meta.filters`.

**Errors** always have the shape:

```json
{
  "error": {
    "code": "bad_request",
    "message": "The request is not valid.",
    "details": [{ "in": "query", "field": "province", "message": "Invalid option: expected one of \"East\"|\"Kigali City\"|\"North\"|\"South\"|\"West\"" }],
    "requestId": "2907aa59-c3cd-4e6b-ba87-17dcbfd5f692"
  }
}
```

| Status | `code` | When |
| --- | --- | --- |
| 400 | `bad_request` | Invalid parameter, unknown or repeated query parameter, or malformed URL |
| 404 | `not_found` | Unknown district, indicator or route (including any non-GET method) |
| 429 | `rate_limited` | More than the per-minute limit from one client |
| 500 | `internal_error` | Unexpected failure; details are logged against the `requestId`, not returned |

**Values** are objects with `value`, `standardError`, `ciLow` and `ciHigh`. The last three are `null` when NISR does not
publish them. Each indicator has a `status`: `observed` (official estimate), `calculated` (IMBONIX arithmetic on
published figures), `model_estimate` or `projection`.

**Headers**

| Header | Meaning |
| --- | --- |
| `X-Request-Id` | Unique per request; send your own (letters, digits, `.`, `_`, `-`, up to 64 characters) to trace a call |
| `RateLimit`, `RateLimit-Policy` | Remaining requests and the window (IETF draft 8 format) |
| `Cache-Control` | `public, max-age=300` for data, `no-store` for errors and the health check |

Unknown query parameters are rejected rather than ignored, so a typo such as `?stauts=` fails loudly.

## Endpoints

### `GET /health`

Service status, version and the amount of data loaded. It is not rate-limited, so it suits load balancers and uptime
monitors.

```json
{
  "status": "ok",
  "service": "imbonix-api",
  "version": "0.1.0",
  "environment": "production",
  "uptimeSeconds": 9,
  "data": { "districts": 30, "indicators": 64, "sectors": 416 }
}
```

### `GET /api/v1`

Name, version, attribution statement and the list of endpoints.

### `GET /api/v1/indicators`

All indicators with their provenance.

| Query | Values |
| --- | --- |
| `status` (optional) | `observed`, `calculated` or `projection` (the statuses present in the district data) |

```bash
curl "http://localhost:4000/api/v1/indicators?status=projection"
```

```json
{
  "data": [
    {
      "id": "proj_adults_16plus_2024",
      "label": "Projected adults aged 16+ (2024)",
      "unit": "persons",
      "year": "2024",
      "source": "NISR subnational population projections 2023-2032",
      "table": "single-age tables",
      "status": "projection"
    }
  ],
  "meta": { "count": 6, "filters": { "status": "projection" } }
}
```

### `GET /api/v1/indicators/:id`

One indicator, a summary across districts, and its value in every district that has one, highest first.

```bash
curl http://localhost:4000/api/v1/indicators/dhs_stunting
```

```json
{
  "data": {
    "id": "dhs_stunting",
    "label": "Stunted children under 5 (height-for-age below -2 SD) (%)",
    "unit": "% of children under 5",
    "year": "2025",
    "source": "NISR Rwanda DHS 2025 final report",
    "table": "Table D.4",
    "status": "observed",
    "summary": { "count": 30, "min": 8.7, "median": 27.85, "max": 38.8 },
    "values": [
      {
        "district": { "name": "Gicumbi", "slug": "gicumbi", "province": "North" },
        "value": 38.8,
        "standardError": null,
        "ciLow": null,
        "ciHigh": null
      }
    ]
  },
  "meta": {}
}
```

Ids use lower-case letters, digits and underscores. A malformed id returns 400; an unknown one returns 404.

### `GET /api/v1/districts`

The 30 districts with name, slug and province, in alphabetical order.

| Query | Values |
| --- | --- |
| `province` (optional) | `Kigali City`, `North`, `South`, `East` or `West` |

```bash
curl "http://localhost:4000/api/v1/districts?province=Kigali%20City"
```

### `GET /api/v1/districts/:slug`

One district with its indicator values, each joined to its indicator metadata.

| Query | Values |
| --- | --- |
| `indicators` (optional) | Comma-separated indicator ids. Every id must exist; unknown ids are named in the error |

```bash
curl "http://localhost:4000/api/v1/districts/nyamagabe?indicators=eicv7_poverty_rate,finscope_excluded"
```

Response `data`: `name`, `slug`, `province`, `sectorCount` and `values` (a list of `{ indicator, value, standardError,
ciLow, ciHigh }`).

### `GET /api/v1/districts/:slug/sectors`

Figures for every sector in a district. `meta.fields` explains each field's unit, source and status.

```bash
curl http://localhost:4000/api/v1/districts/gicumbi/sectors
```

```json
{
  "data": [
    {
      "sector": "Bukure",
      "population": 20454,
      "nonpoor": 43.1,
      "vulnerable": 23.6,
      "moderatelyPoor": 26.9,
      "severelyPoor": 6.5,
      "mpiHeadcount": 33.3,
      "mpi": 0.138,
      "povertySae": 28.1
    }
  ],
  "meta": {
    "count": 21,
    "district": { "name": "Gicumbi", "slug": "gicumbi", "province": "North" },
    "fields": {
      "povertySae": {
        "label": "Poverty rate, small-area estimate",
        "unit": "% of population",
        "source": "NISR EICV7 district presentations (small-area estimation with the 2022 census), 2023/24",
        "status": "model_estimate"
      }
    }
  }
}
```

Sector small-area estimates are model outputs that NISR did not benchmark to district survey figures. Compare sectors
within a district, not across districts.

## Configuration

All settings are optional environment variables; see [apps/api/.env.example](../apps/api/.env.example).

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `4000` | Port to listen on |
| `HOST` | all interfaces | Interface to bind |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated browser origins allowed to call the API, or `*` |
| `RATE_LIMIT_PER_MINUTE` | `120` | Requests per minute per client IP on `/api/v1` |
| `TRUST_PROXY` | `0` | Number of proxies in front of the API, so rate limits see real client IPs |
| `LOG_LEVEL` | `info` (`silent` in tests) | `silent`, `error`, `warn`, `info` or `debug` |
| `DATA_DIR` | `apps/web/src/data/generated` | Folder containing `districts.json` and `sectors.json` |
| `NODE_ENV` | `development` | Reported by `/health` |

Invalid values stop the server at startup with a clear message.

## Logging

Each request produces one JSON line on stdout, for example:

```json
{"time":"2026-09-26T22:26:12.546Z","level":"info","msg":"request","requestId":"4856eac8-…","method":"GET","path":"/api/v1/indicators","status":200,"durationMs":3.1}
```

Client errors log at `warn`, server errors at `error` with the stack trace, and passing health checks at `debug`.
Query strings are not logged.
