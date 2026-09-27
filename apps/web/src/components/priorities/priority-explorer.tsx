"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { RwandaMap } from "@/components/map/rwanda-map";
import { Badge } from "@/components/ui/badge";
import { PROVINCE_LABEL } from "@/lib/data";
import type { DistrictFlags, Lever, LeverId } from "@/lib/priorities";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NO_DATA } from "@/lib/palette";
import { textOn } from "@/lib/scales";

/** Pick a lever to see which districts the evidence flags for it, on a map and as a list. */
export function PriorityExplorer({ levers, districts }: { levers: Lever[]; districts: DistrictFlags[] }) {
  const [active, setActive] = useState<LeverId>("income");
  const lever = levers.find((l) => l.id === active)!;
  const flagged = useMemo(
    () =>
      districts
        .map((d) => ({ ...d, flag: d.flags.find((f) => f.lever === active) }))
        .filter((d) => d.flag)
        .sort((a, b) => (a.flag!.rank ?? 99) - (b.flag!.rank ?? 99)),
    [districts, active],
  );
  const fills = Object.fromEntries(
    districts.map((d) => [d.slug, d.flags.some((f) => f.lever === active) ? lever.color : NO_DATA]),
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="card p-5 sm:p-6">
        <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-muted">Choose a lever</p>
        <div className="mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Intervention lever">
          {levers.map((l) => (
            <button
              key={l.id}
              type="button"
              role="radio"
              aria-checked={l.id === active}
              onClick={() => setActive(l.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
                l.id === active ? "bg-navy-900 text-white" : "bg-paper text-ink/80 hover:bg-line/70",
              )}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} aria-hidden="true" />
              {l.title}
            </button>
          ))}
        </div>
        <div className="mt-5 rounded-xl bg-paper p-4">
          <p className="font-display text-lg font-semibold text-ink">{lever.question}</p>
          <p className="mt-2 text-[13px] leading-5 text-ink/80">
            <strong>Rule:</strong> {lever.rule}
          </p>
          <p className="mt-1.5 text-[13px] leading-5 text-ink/80">
            <strong>Programmes to look at:</strong> {lever.programmes}
          </p>
        </div>
        <div className="mx-auto mt-5 max-w-md">
          <RwandaMap
            fills={fills}
            title={`Districts flagged for ${lever.title.toLowerCase()}`}
            describe={(slug) => {
              const d = districts.find((x) => x.slug === slug)!;
              return `${d.name}: ${d.flags.some((f) => f.lever === active) ? "flagged" : "not flagged"}`;
            }}
          />
          <p className="mt-2 text-center text-[12px] text-muted">
            <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm align-middle" style={{ background: lever.color }} />
            {flagged.length} districts flagged
          </p>
        </div>
      </div>

      <div className="card p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-display text-lg font-semibold text-ink">{lever.title}</p>
          <Badge variant="secondary">{flagged.length} districts</Badge>
        </div>
        <ol className="mt-4 divide-y divide-line" aria-live="polite">
          {flagged.map((d, i) => (
            <li key={d.slug} className="flex items-start gap-3 py-3">
              <span className="tabular mt-0.5 w-5 shrink-0 text-right text-[12px] font-semibold text-muted">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <Link href={`/districts/${d.slug}`} className="font-semibold text-ink hover:text-royal">
                  {d.name}
                </Link>
                <span className="ml-2 text-[11.5px] text-muted">{PROVINCE_LABEL[d.province]}</span>
                <p className="mt-0.5 text-[12.5px] leading-5 text-muted">{d.flag!.evidence}</p>
              </div>
              <span className="shrink-0 text-[11.5px] text-muted">{d.flags.length} of 7 levers</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/** Every district against every lever: a compact overview that works without the map. */
export function PriorityMatrix({ levers, districts }: { levers: Lever[]; districts: DistrictFlags[] }) {
  return (
    <ScrollArea label="Levers flagged for each district (scrolls sideways)" className="rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[760px] text-left text-[12.5px]">
        <caption className="sr-only">Which levers the evidence flags for each district</caption>
        <thead className="bg-paper text-[11px] text-muted">
          <tr>
            <th scope="col" className="px-4 py-3 uppercase tracking-[0.06em]">
              District
            </th>
            {levers.map((l) => (
              <th key={l.id} scope="col" className="px-2 py-3 text-center font-semibold">
                <span className="mx-auto mb-1 block h-2 w-2 rounded-full" style={{ background: l.color }} aria-hidden="true" />
                {l.title}
              </th>
            ))}
            <th scope="col" className="px-4 py-3 text-right uppercase tracking-[0.06em]">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {districts.map((d) => (
            <tr key={d.slug} className="border-t border-line">
              <th scope="row" className="px-4 py-2 font-semibold">
                <Link href={`/districts/${d.slug}`} className="text-ink hover:text-royal">
                  {d.name}
                </Link>
              </th>
              {levers.map((l) => {
                const flag = d.flags.find((f) => f.lever === l.id);
                return (
                  <td key={l.id} className="px-2 py-2 text-center" title={flag?.evidence}>
                    {flag ? (
                      <span
                        className="mx-auto flex h-6 w-6 items-center justify-center rounded-full"
                        style={{ background: l.color, color: textOn(l.color) }}
                      >
                        <CheckIcon className="h-4 w-4" aria-label="Flagged" />
                      </span>
                    ) : (
                      <span className="text-line" aria-label="Not flagged">
                        ·
                      </span>
                    )}
                  </td>
                );
              })}
              <td className="tabular px-4 py-2 text-right font-bold text-ink">{d.flags.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  );
}
