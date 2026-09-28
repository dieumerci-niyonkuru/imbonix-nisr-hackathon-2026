"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { HowToRead } from "@/components/ui/chart-card";
import { SelectField } from "@/components/ui/select-field";
import { formatNumber } from "@/lib/format";
import { BRAND, CHART_CYAN } from "@/lib/palette";
import { explore, GROUPS, LOCATIONS, PROBLEMS, type GroupId, type ProblemId } from "@/lib/intervention-explorer";
import { cn } from "@/lib/utils";

/** The places, grouped for the dropdown: the country, the provinces, then the districts of each province. */
const LOCATION_GROUPS = LOCATIONS.reduce<{ group: string; items: typeof LOCATIONS }[]>((groups, location) => {
  const last = groups[groups.length - 1];
  if (last && last.group === location.group) last.items.push(location);
  else groups.push({ group: location.group, items: [location] });
  return groups;
}, []);

function Panel({ step, title, children, className }: { step: number; title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("flex flex-col rounded-2xl border border-line bg-white p-6 shadow-card", className)}>
      <p className="flex items-center gap-2.5 text-[12px] font-bold uppercase tracking-[0.1em] text-royal">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-900 text-[12px] text-white">{step}</span>
        {title}
      </p>
      <div className="mt-4 flex-1">{children}</div>
    </section>
  );
}

/**
 * Choose a problem, a target group and a place; the explorer shows the evidence, the people affected, where the
 * problem is concentrated, options to consider and what the evidence cannot tell us.
 */
export function InterventionExplorer({
  initialProblem = "exclusion",
  initialGroup = "all",
  initialLocation = "rwanda",
}: {
  initialProblem?: ProblemId;
  initialGroup?: GroupId;
  initialLocation?: string;
}) {
  const [problem, setProblem] = useState<ProblemId>(initialProblem);
  const [group, setGroup] = useState<GroupId>(initialGroup);
  const [location, setLocation] = useState(initialLocation);
  const result = useMemo(() => explore(problem, group, location), [problem, group, location]);
  const maxShare = Math.max(...result.concentration.rows.map((row) => row.share), 1);
  const districtSlug = location.startsWith("district:") ? location.slice("district:".length) : undefined;

  return (
    <div className="grid gap-6">
      <div className="card grid gap-4 p-5 sm:p-6 md:grid-cols-3">
        <SelectField label="1. Problem" value={problem} onChange={(value) => setProblem(value as ProblemId)}>
          {PROBLEMS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </SelectField>
        <SelectField label="2. Target group" value={group} onChange={(value) => setGroup(value as GroupId)}>
          {GROUPS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </SelectField>
        <SelectField label="3. Place" value={location} onChange={setLocation}>
          {LOCATION_GROUPS.map((locationGroup) => (
            <optgroup key={locationGroup.group} label={locationGroup.group}>
              {locationGroup.items.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </optgroup>
          ))}
        </SelectField>
      </div>

      <div className="rounded-2xl bg-navy-900 p-6 text-white sm:p-8" aria-live="polite">
        <p className="eyebrow text-cyan">
          {result.problem.label} · {result.groupLabel} · {result.placeLabel}
        </p>
        <p className="mt-3 text-balance font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl">{result.headline}</p>
        <p className="mt-2 text-[15px] text-white/75">{result.problem.question}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel step={1} title="Evidence: what the data shows">
          <ul className="space-y-4">
            {result.evidence.map((item) => (
              <li key={item.text} className="border-l-2 border-cyan pl-3">
                <p className="text-[15px] leading-6 text-ink">{item.text}</p>
                <p className="mt-1 text-[12px] text-muted">Source: {item.source}</p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel step={2} title="People affected">
          {result.affected.count !== undefined && (
            <p className="font-display text-5xl font-bold tracking-[-0.03em] text-ink">{formatNumber(result.affected.count)}</p>
          )}
          <p className={cn("text-[15px] leading-6 text-ink", result.affected.count !== undefined && "mt-2")}>
            {result.affected.text}
          </p>
          {result.affected.note && <p className="mt-3 text-[13px] leading-5 text-muted">{result.affected.note}</p>}
        </Panel>

        <Panel step={3} title="Where it is concentrated" className="lg:col-span-2">
          <p className="font-display text-lg font-bold text-ink">{result.concentration.title}</p>
          <HowToRead className="mt-1">
            Each bar is the share with the problem; the longer the bar, the more affected the place.
            {result.concentration.rows.some((row) => row.count) ? " The number beside it counts the people affected." : ""}
          </HowToRead>
          <ol className="mt-4 space-y-2">
            {result.concentration.rows.map((row, index) => (
              <li
                key={row.label}
                className={cn(
                  "grid grid-cols-[1.5rem_minmax(0,8rem)_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 py-1.5 sm:grid-cols-[1.5rem_minmax(0,11rem)_minmax(0,1fr)_auto]",
                  row.highlight && "bg-cyan-soft ring-1 ring-inset ring-cyan/50",
                )}
              >
                <span className="tabular text-[12.5px] font-bold text-muted">{index + 1}</span>
                {row.href ? (
                  <Link href={row.href} className="truncate text-[14px] font-semibold text-ink hover:text-royal hover:underline">
                    {row.label}
                  </Link>
                ) : (
                  <span className="truncate text-[14px] font-semibold text-ink">{row.label}</span>
                )}
                <span className="relative h-5 rounded bg-mist">
                  <span
                    className="absolute inset-y-0 left-0 rounded"
                    style={{ width: `${(row.share / maxShare) * 100}%`, background: row.highlight ? CHART_CYAN : BRAND.blue }}
                  />
                </span>
                <span className="tabular whitespace-nowrap text-right text-[13px] font-bold text-ink">
                  {Math.round(row.share * 10) / 10}%
                  {row.count ? <span className="ml-2 font-semibold text-muted">{formatNumber(row.count)}</span> : null}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[12.5px] text-muted">{result.concentration.note}</p>
        </Panel>

        <Panel step={4} title="What could be considered">
          <ul className="space-y-3">
            {result.options.map((option) => (
              <li key={option} className="border-l-2 border-royal pl-3 text-[14.5px] leading-6 text-ink">
                {option}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[12.5px] leading-5 text-muted">
            Options to consider, drawn from existing programmes and the National Financial Inclusion Roadmap. They are not
            predictions of impact.
          </p>
        </Panel>

        <Panel step={5} title="What the evidence cannot tell us">
          <ul className="space-y-2.5">
            {result.limitations.map((limitation) => (
              <li key={limitation} className="border-l-2 border-line pl-3 text-[14px] leading-6 text-ink/80">
                {limitation}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {districtSlug && (
          <Link
            href={`/districts/${districtSlug}`}
            className="group inline-flex items-center gap-1.5 rounded text-[15px] font-bold text-royal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal"
          >
            Open the district intelligence for {result.placeLabel.replace(" district", "")}
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        )}
        <Link
          href="/priorities"
          className="group inline-flex items-center gap-1.5 rounded text-[15px] font-bold text-royal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal"
        >
          See where to act first, district by district
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
