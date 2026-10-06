"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { Fingerprint, worstThirdCount } from "@/components/charts/fingerprint";
import { PriorityBadge } from "@/components/district/district-intelligence";
import { SelectField } from "@/components/ui/select-field";
import { DISTRICTS, PROVINCE_LABEL, PROVINCES, rankOf } from "@/lib/data";
import { priorityFor, type Priority } from "@/lib/district-intelligence";
import { CORE_DIMENSIONS, DIMENSIONS, meta } from "@/lib/indicators";

const PRIORITY_LEVELS: Priority["level"][] = ["High", "Moderate", "Lower"];

const SORTS = [
  { id: "overlap", label: "Highest priority first" },
  ...CORE_DIMENSIONS.map((d) => ({ id: d, label: `Most affected: ${DIMENSIONS[d].label.toLowerCase()}` })),
  { id: "name", label: "Name (A to Z)" },
];

export function DistrictDirectory() {
  const [query, setQuery] = useState("");
  const [province, setProvince] = useState<string>("all");
  const [sort, setSort] = useState("overlap");
  const [priority, setPriority] = useState("all");

  const list = useMemo(() => {
    const term = query.trim().toLowerCase();
    const matchesTerm = (d: (typeof DISTRICTS)[number]) =>
      !term || d.name.toLowerCase().includes(term) || PROVINCE_LABEL[d.province].toLowerCase().includes(term);
    const filtered = DISTRICTS.filter(
      (d) =>
        matchesTerm(d) &&
        (province === "all" || d.province === province) &&
        (priority === "all" || priorityFor(d).level === priority),
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
  }, [query, province, priority, sort]);

  return (
    <div>
      <label className="relative mb-4 block">
        <span className="sr-only">Search districts</span>
        <MagnifyingGlassIcon
          className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search districts"
          className="h-12 w-full rounded-lg bg-paper pl-11 pr-4 text-[15px] text-ink ring-1 ring-line placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
        />
      </label>
      <div className="card grid gap-4 p-4 sm:grid-cols-3 sm:p-5">
        <SelectField label="Province" value={province} onChange={setProvince}>
          <option value="all">All provinces</option>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>
              {PROVINCE_LABEL[p]}
            </option>
          ))}
        </SelectField>
        <SelectField label="Priority" value={priority} onChange={setPriority}>
          <option value="all">All priorities</option>
          {PRIORITY_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level} priority
            </option>
          ))}
        </SelectField>
        <SelectField label="Sort" value={sort} onChange={setSort}>
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </SelectField>
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
                <p className="text-[12.5px] font-semibold text-muted">{PROVINCE_LABEL[d.province]}</p>
                <p className="font-display text-xl font-bold tracking-[-0.02em] text-ink group-hover:text-cyan-ink">{d.name}</p>
              </div>
              <PriorityBadge priority={priorityFor(d)} />
            </div>
            <div className="mt-4">
              <Fingerprint district={d} compact />
            </div>
            <p className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-bold text-cyan-ink">
              Open profile <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
