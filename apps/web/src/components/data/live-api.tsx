"use client";

import { useEffect, useState } from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { REPOSITORY_URL } from "@/components/layout/nav";

/** The published read-only endpoints, shown whether or not a live API is linked in this environment. */
const ENDPOINTS: { path: string; desc: string }[] = [
  { path: "/api/v1/indicators", desc: "Every indicator, filterable by status" },
  { path: "/api/v1/indicators/:id", desc: "One indicator with its values and source" },
  { path: "/api/v1/districts", desc: "All 30 districts, filterable by province" },
  { path: "/api/v1/districts/:slug", desc: "One district with its indicators" },
  { path: "/api/v1/districts/:slug/sectors", desc: "A district's sectors with their figures" },
];

type Live = {
  configured: boolean;
  connected: boolean;
  service?: string;
  version?: string | null;
  counts?: { districts?: number; indicators?: number; sectors?: number } | null;
  endpoints?: string[];
};

/**
 * A live status panel for the IMBONIX JSON API. On mount it asks the same-origin `/api/live` route whether the backend
 * is linked and reachable (the route reaches the API server-side, so no CSP or CORS is involved). The published
 * endpoints are always listed, so the panel is useful even before the API is deployed; when it is deployed and linked,
 * the panel shows a live "Connected" badge with the version and the counts the API is actually serving.
 */
export function LiveApi() {
  const [live, setLive] = useState<Live | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/live", { signal: controller.signal, headers: { accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: Live) => setLive(data))
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, []);

  const loading = !live && !failed;
  const connected = !!live?.connected;
  const counts = live?.counts ?? null;

  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow text-cyan-ink">Open, reusable API</p>
        <Status loading={loading} live={live} failed={failed} />
      </div>

      <h3 className="mt-3 font-display text-2xl font-bold tracking-[-0.02em] text-ink">A live JSON API over the same figures</h3>
      <p className="mt-3 max-w-2xl text-pretty text-[15px] leading-7 text-muted">
        Every figure IMBONIX shows is also served as read-only JSON — from this same deployment — so district teams, partners and
        researchers can build on the same NISR aggregates, with no scraping and no copy-paste. The pages have the data built in,
        so the site works even if the API is ever unavailable.
      </p>

      {connected && counts ? (
        <dl className="mt-5 grid grid-cols-3 gap-3">
          <Stat value={counts.districts} label="districts" />
          <Stat value={counts.indicators} label="indicators" />
          <Stat value={counts.sectors} label="sectors" />
        </dl>
      ) : null}

      <ul className="mt-6 divide-y divide-line overflow-hidden rounded-xl border border-line">
        {ENDPOINTS.map((endpoint) => (
          <li key={endpoint.path} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-3">
            <code className="shrink-0 font-mono text-[12.5px] font-semibold text-cyan-ink">
              <span className="mr-1.5 rounded bg-cyan-soft px-1.5 py-0.5 text-[10.5px] font-bold text-cyan-ink">GET</span>
              {endpoint.path}
            </code>
            <span className="text-[12.5px] leading-5 text-muted">{endpoint.desc}</span>
          </li>
        ))}
      </ul>

      <a
        href={`${REPOSITORY_URL}/blob/main/docs/api.md`}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-bold text-cyan-ink underline-offset-4 hover:text-ink hover:underline"
      >
        Read the API reference
        <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </div>
  );
}

function Stat({ value, label }: { value?: number; label: string }) {
  return (
    <div className="rounded-xl bg-cyan-soft/60 px-4 py-3 ring-1 ring-cyan/15">
      <dd className="tabular font-display text-2xl font-bold tracking-[-0.02em] text-cyan-ink">{value ?? "—"}</dd>
      <dt className="mt-0.5 text-[12.5px] font-semibold text-muted">{label}</dt>
    </div>
  );
}

function Status({ loading, live, failed }: { loading: boolean; live: Live | null; failed: boolean }) {
  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-2.5 py-1 text-[12px] font-bold text-muted">
        <span className="h-2 w-2 animate-pulse rounded-full bg-muted" aria-hidden="true" />
        Checking…
      </span>
    );
  }
  if (live?.connected) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-soft px-2.5 py-1 text-[12px] font-bold text-cyan-ink ring-1 ring-cyan/30">
        <span className="h-2 w-2 rounded-full bg-cyan-ink" aria-hidden="true" />
        Live{live.version ? ` · v${live.version}` : ""}
      </span>
    );
  }
  // configured but unreachable, not configured, or the status check itself failed
  const label =
    live && live.configured && !live.connected ? "API unreachable" : failed ? "Status unavailable" : "Not linked here";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-1 text-[12px] font-bold text-muted ring-1 ring-line">
      <span className="h-2 w-2 rounded-full bg-line" aria-hidden="true" />
      {label}
    </span>
  );
}
