"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRightIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Fingerprint, OverlapBadge, worstThirdCount } from "@/components/charts/fingerprint";
import { DISTRICTS, PROVINCE_LABEL, PROVINCES, rankOf } from "@/lib/data";
import { CORE_DIMENSIONS, DIMENSIONS, meta } from "@/lib/indicators";

const SORTS = [
  { id: "overlap", label: "Most overlapping vulnerabilities" },
  ...CORE_DIMENSIONS.map((d) => ({ id: d, label: `Most affected: ${DIMENSIONS[d].label.toLowerCase()}` })),
  { id: "name", label: "Name (A–Z)" },
];

export function DistrictDirectory() {
  const [query, setQuery] = useState("");
  const [province, setProvince] = useState<string>("all");
  const [sort, setSort] = useState("overlap");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = DISTRICTS.filter(
      (d) => (province === "all" || d.province === province) && (!q || d.name.toLowerCase().includes(q)),
    );
    const rank = (d: (typeof DISTRICTS)[number], dimension: string) =>
      rankOf(d, meta(DIMENSIONS[dimension as keyof typeof DIMENSIONS].headline!))?.rank ?? 99;
    return [...filtered].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "overlap") {
        const diff = worstThirdCount(b) - worstThirdCount(a);
        if (diff) return diff;
        const sum = (d: typeof a) => CORE_DIMENSIONS.reduce((s, dim) => s + rank(d, dim), 0);
        return sum(a) - sum(b);
      }
      return rank(a, sort) - rank(b, sort);
    });
  }, [query, province, sort]);

  return (
    <div>
      <div className="card flex flex-col gap-3 p-4 md:flex-row md:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search districts</span>
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a district"
            className="w-full rounded-xl border border-line bg-paper py-2.5 pl-9 pr-3 text-sm text-ink outline-none focus:border-royal"
          />
        </label>
        <label className="flex items-center gap-2 text-[13px] font-semibold text-muted">
          Province
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-royal md:flex-none"
          >
            <option value="all">All provinces</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {PROVINCE_LABEL[p]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-[13px] font-semibold text-muted">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-royal md:flex-none"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-4 text-[13px] text-muted" aria-live="polite">
        {list.length} {list.length === 1 ? "district" : "districts"}
      </p>

      <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((d) => (
          <Link
            key={d.slug}
            href={`/districts/${d.slug}`}
            className="card group block p-5 transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{PROVINCE_LABEL[d.province]}</p>
                <p className="font-display text-xl font-bold tracking-[-0.02em] text-ink group-hover:text-royal">{d.name}</p>
              </div>
              <OverlapBadge district={d} />
            </div>
            <div className="mt-4">
              <Fingerprint district={d} compact />
            </div>
            <p className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-bold text-royal">
              Open profile <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
