"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon, InformationCircleIcon } from "@heroicons/react/20/solid";
import { StatusBadge } from "@/components/ui/status-badge";
import { CHART_CYAN, DEEP_CYAN, WHITE } from "@/lib/palette";
import {
  DISTRICTS_CREATED,
  FIRST_YEAR,
  formatPoint,
  LAST_YEAR,
  type DistrictPoint,
  type NationalPoint,
  type TimelineSeries,
} from "@/lib/timeline";
import { cn } from "@/lib/utils";

/** One of the district's current indicators, with the period it was measured in. */
export type YearIndicator = {
  id: string;
  label: string;
  period: string;
  start: number;
  end: number;
  value: string;
  status: string;
  group: string;
  source: string;
  rank?: string;
};

const YEARS = Array.from({ length: LAST_YEAR - FIRST_YEAR + 1 }, (_, index) => FIRST_YEAR + index);
const CENSUS_YEARS = [1978, 1991, 2002, 2012, 2022];
const DEFAULT_YEAR = 2025;
const covers = (point: { start: number; end: number }, year: number) => point.start <= year && year <= point.end;
/** The unit is in the value (27.4%, RWF 31,200, 32 minutes), so it is dropped from the label. */
const plainLabel = (label: string) => label.replace(/ \((%|RWF|minutes)\)$/, "");
/** National figures grouped by the census or survey they come from, in this order. */
const SURVEY_GROUPS: { match: string; title: string }[] = [
  { match: "Poverty Profile", title: "Poverty (EICV7)" },
  { match: "RPHC", title: "Population census" },
  { match: "EICV rounds", title: "Household living conditions (EICV)" },
  { match: "DHS rounds", title: "Health and nutrition (DHS)" },
  { match: "LFS rounds", title: "Work (Labour Force Survey)" },
];
const surveyGroup = (source: string) => SURVEY_GROUPS.findIndex((group) => source.includes(group.match));

/** A small line for a series across its years, with the chosen year marked. Decorative: the values are in the text. */
function Sparkline({ points, selected }: { points: { x: number; y: number }[]; selected: number }) {
  if (points.length < 2) return <span className="w-[88px]" aria-hidden="true" />;
  const width = 88;
  const height = 28;
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const scaleX = (x: number) => 4 + ((x - minX) / (maxX - minX || 1)) * (width - 8);
  const scaleY = (y: number) => height - 4 - ((y - minY) / (maxY - minY || 1)) * (height - 8);
  const current = points.find((point) => point.x === selected);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="shrink-0">
      <polyline
        points={points.map((point) => `${scaleX(point.x)},${scaleY(point.y)}`).join(" ")}
        fill="none"
        stroke={DEEP_CYAN}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {current && (
        <circle cx={scaleX(current.x)} cy={scaleY(current.y)} r={3.5} fill={CHART_CYAN} stroke={WHITE} strokeWidth={1.5} />
      )}
    </svg>
  );
}

function FigureRow({
  label,
  detail,
  value,
  status,
  trend,
}: {
  label: string;
  detail: string;
  value: string;
  status?: string;
  trend?: ReactNode;
}) {
  return (
    <li className="grid break-inside-avoid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 border-t border-line py-3 first:border-t-0">
      <div className="min-w-0">
        <p className="text-pretty text-[14.5px] font-semibold leading-5 text-ink">{label}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] leading-5 text-muted">
          {status && status !== "observed" && <StatusBadge status={status} />}
          {detail}
        </p>
        {trend && <div className="mt-1.5 sm:hidden">{trend}</div>}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {trend && <div className="hidden sm:block">{trend}</div>}
        <span className="tabular min-w-[4.5rem] text-right font-display text-[18px] font-bold text-ink">{value}</span>
      </div>
    </li>
  );
}

/** A titled list of figures, with any note that applies to all of them said once underneath. */
function FigureGroup({ title, notes = [], children }: { title: string; notes?: string[]; children: ReactNode }) {
  return (
    <div className="mb-5">
      <h4 className="break-after-avoid text-[12.5px] font-bold uppercase tracking-[0.06em] text-cyan-ink">{title}</h4>
      <ul className="mt-1">{children}</ul>
      {notes.map((note) => (
        <p key={note} className="break-inside-avoid text-[12.5px] leading-5 text-muted">
          Note: {note}
        </p>
      ))}
    </div>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex gap-2 rounded-lg bg-paper px-4 py-3 text-[14px] leading-6 text-ink/80">
      <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-ink" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

/**
 * A district and Rwanda year by year, from 1978, the first census, to 2026. For the chosen year it lists the figures
 * NISR published: the district's own where they exist (its labour indicators from 2017, its projected population
 * from 2023 and every indicator measured that year), and Rwanda's and its province's. Years without figures say so
 * and point to the nearest years that have them. A timeline shows at a glance which years hold figures.
 */
export function DistrictTimeline({
  district,
  provinceLabel,
  series,
  national,
  districtPoints,
  indicators,
}: {
  district: string;
  provinceLabel: string;
  series: Record<string, TimelineSeries>;
  national: NationalPoint[];
  districtPoints: DistrictPoint[];
  indicators: YearIndicator[];
}) {
  const selectId = useId();
  const [year, setYear] = useState(DEFAULT_YEAR);

  // For every year: how many district and national figures it holds.
  const counts = useMemo(
    () =>
      Object.fromEntries(
        YEARS.map((candidate) => [
          candidate,
          {
            district:
              districtPoints.filter((point) => point.year === candidate).length +
              indicators.filter((indicator) => covers(indicator, candidate)).length,
            national: national.filter((point) => covers(point, candidate)).length,
          },
        ]),
      ) as Record<number, { district: number; national: number }>,
    [districtPoints, indicators, national],
  );
  const hasFigures = (candidate: number) => counts[candidate].district + counts[candidate].national > 0;
  const previousYear = [...YEARS].reverse().find((candidate) => candidate < year && hasFigures(candidate));
  const nextYear = YEARS.find((candidate) => candidate > year && hasFigures(candidate));
  const nearest = (kind: "district" | "national") => ({
    before: [...YEARS].reverse().find((candidate) => candidate < year && counts[candidate][kind] > 0),
    after: YEARS.find((candidate) => candidate > year && counts[candidate][kind] > 0),
  });

  // The district's yearly series that have a value this year, each with its whole run for the trend line.
  const districtRows = useMemo(() => {
    const byId = new Map<string, DistrictPoint[]>();
    districtPoints.forEach((point) => byId.set(point.id, [...(byId.get(point.id) ?? []), point]));
    return [...byId.entries()]
      .map(([id, points]) => ({ id, points, current: points.find((point) => point.year === year) }))
      .filter((row) => row.current);
  }, [districtPoints, year]);
  const yearIndicators = indicators.filter((indicator) => covers(indicator, year));
  const districtGroups = [
    {
      title: "Year by year",
      children: districtRows.map((row) => {
        const info = series[row.id];
        return (
          <FigureRow
            key={row.id}
            label={plainLabel(info.label)}
            detail={`${year} · ${info.source}, ${info.table}`}
            value={formatPoint(row.current!.value, info.unit)}
            status={row.current!.status ?? (row.id === "projected_population" ? "projection" : undefined)}
            trend={<Sparkline points={row.points.map((point) => ({ x: point.year, y: point.value }))} selected={year} />}
          />
        );
      }),
    },
    ...[...new Set(yearIndicators.map((indicator) => indicator.group))].map((group) => ({
      title: group,
      children: yearIndicators
        .filter((indicator) => indicator.group === group)
        .map((indicator) => (
          <FigureRow
            key={indicator.id}
            label={indicator.label}
            detail={[indicator.period, indicator.rank, indicator.source].filter(Boolean).join(" · ")}
            value={indicator.value}
            status={indicator.status}
          />
        )),
    })),
  ].filter((group) => group.children.length > 0);

  const nationalRows = useMemo(() => {
    const byKey = new Map<string, NationalPoint[]>();
    national.forEach((point) => {
      const key = `${point.area}:${point.id}`;
      byKey.set(key, [...(byKey.get(key) ?? []), point]);
    });
    return [...byKey.values()]
      .map((points) => ({ points, current: points.find((point) => covers(point, year)) }))
      .filter((row): row is { points: NationalPoint[]; current: NationalPoint } => Boolean(row.current))
      .sort(
        (first, second) =>
          surveyGroup(series[first.current.id].source) - surveyGroup(series[second.current.id].source) ||
          Number(first.current.area !== "Rwanda") - Number(second.current.area !== "Rwanda"),
      );
  }, [national, series, year]);
  const nationalGroups = SURVEY_GROUPS.map((group, index) => ({
    title: group.title,
    rows: nationalRows.filter(({ current }) => surveyGroup(series[current.id].source) === index),
  })).filter((group) => group.rows.length > 0);

  const nearestDistrict = nearest("district");
  const nearestNational = nearest("national");
  const jump = (target: number | undefined) =>
    target !== undefined ? (
      <button
        type="button"
        onClick={() => setYear(target)}
        className="font-semibold text-cyan-ink underline underline-offset-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
      >
        {target}
      </button>
    ) : null;
  const nearby = ({ before, after }: { before?: number; after?: number }) =>
    before === undefined && after === undefined ? null : (
      <>
        {" "}
        Nearest years with figures: {jump(before)}
        {before !== undefined && after !== undefined ? " and " : ""}
        {jump(after)}.
      </>
    );

  const buttonStyle =
    "inline-flex h-11 items-center justify-center gap-1 rounded border border-line bg-white px-3 text-[14px] font-semibold text-ink transition-colors hover:border-cyan-ink hover:text-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink disabled:pointer-events-none disabled:opacity-40";

  return (
    <div>
      <div className="grid grid-cols-2 items-end gap-3 sm:flex sm:flex-wrap">
        <div className="col-span-2">
          <label htmlFor={selectId} className="block text-[13px] font-semibold text-muted">
            Year
          </label>
          <select
            id={selectId}
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            className="mt-1 h-11 w-full rounded border border-line bg-white px-3 text-[16px] font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink sm:w-48"
          >
            {YEARS.map((candidate) => (
              <option key={candidate} value={candidate}>
                {candidate}
                {hasFigures(candidate) ? "" : " (no figures)"}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className={buttonStyle}
          disabled={previousYear === undefined}
          onClick={() => previousYear && setYear(previousYear)}
        >
          <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
          Earlier figures
        </button>
        <button
          type="button"
          className={buttonStyle}
          disabled={nextYear === undefined}
          onClick={() => nextYear && setYear(nextYear)}
        >
          Later figures
          <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="col-span-2 flex flex-wrap items-center gap-2 sm:ml-auto">
          <span className="w-full text-[13px] font-semibold text-muted sm:w-auto">Census years</span>
          {CENSUS_YEARS.map((census) => (
            <button
              key={census}
              type="button"
              aria-pressed={year === census}
              onClick={() => setYear(census)}
              className={cn(
                "h-9 rounded px-2.5 text-[13.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink",
                year === census ? "bg-cyan text-ink" : "bg-white text-ink ring-1 ring-line hover:ring-cyan-ink",
              )}
            >
              {census}
            </button>
          ))}
        </div>
      </div>

      {/* Which years hold figures: dots above the line for the district, below for Rwanda. Clicking a year selects it. */}
      <div className="mt-6 rounded-lg border border-line bg-white px-3 pb-2 pt-3 sm:px-4" aria-hidden="true">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${YEARS.length}, minmax(0, 1fr))` }}>
          {YEARS.map((candidate) => {
            const selected = candidate === year;
            return (
              <button
                key={candidate}
                type="button"
                tabIndex={-1}
                title={String(candidate)}
                onClick={() => setYear(candidate)}
                className={cn("flex flex-col items-center gap-1 rounded-sm py-1", selected ? "bg-cyan/25" : "hover:bg-mist")}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2",
                    counts[candidate].district ? "bg-cyan-ink" : "bg-transparent",
                  )}
                />
                <span className={cn("h-px w-full", candidate < DISTRICTS_CREATED ? "bg-line" : "bg-muted/50")} />
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2",
                    counts[candidate].national ? "bg-muted" : "bg-transparent",
                  )}
                />
                <span className={cn("h-3 text-[10px] font-semibold leading-3", selected ? "text-ink" : "text-muted")}>
                  {selected || (candidate % 10 === 0 && Math.abs(candidate - year) > 2) ? `'${String(candidate).slice(2)}` : ""}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-ink" /> {district} figures
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted" /> Rwanda figures
          </span>
          <span>1978 to 2026</span>
        </p>
      </div>

      <p className="sr-only" aria-live="polite">
        {year}: {counts[year].district} figures for {district}, {counts[year].national} national and province figures.
      </p>
      <div className="mt-6 grid gap-6">
        <div className="rounded-xl border border-t-4 border-line border-t-cyan bg-white p-5 sm:p-6">
          <h3 className="font-display text-[20px] font-bold text-ink">
            {district} in {year}
          </h3>
          <div className="mt-4">
            {year < DISTRICTS_CREATED && (
              <EmptyNote>
                The 30 districts date from the territorial reform of {DISTRICTS_CREATED}, so district figures on this site start
                after then. Rwanda&apos;s figures for {year} are below.
              </EmptyNote>
            )}
            {year >= DISTRICTS_CREATED && districtGroups.length === 0 && (
              <EmptyNote>
                This site holds no figures for {district} for {year}. It uses the latest round of each census and survey, and the
                labour force survey for every year from 2017; NISR&apos;s earlier district reports are on{" "}
                <a
                  href="https://statistics.gov.rw/"
                  className="font-semibold text-cyan-ink underline underline-offset-2 hover:text-ink"
                  target="_blank"
                  rel="noreferrer"
                >
                  statistics.gov.rw
                </a>
                .{nearby(nearestDistrict)}
              </EmptyNote>
            )}
            {districtGroups.length > 0 && (
              <div className="gap-10 lg:columns-2">
                {districtGroups.map((group) => (
                  <FigureGroup key={group.title} title={group.title}>
                    {group.children}
                  </FigureGroup>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-t-4 border-line border-t-cyan bg-white p-5 sm:p-6">
          <h3 className="font-display text-[20px] font-bold text-ink">Rwanda in {year}</h3>
          <div className="mt-4">
            {nationalRows.length === 0 ? (
              <EmptyNote>
                This site holds no national figures for {year}. Its national series are the censuses since 1978 and the EICV, DHS
                and labour force survey rounds in NISR&apos;s Statistical Yearbook 2025.{nearby(nearestNational)}
              </EmptyNote>
            ) : (
              <div className="gap-10 lg:columns-2">
                {nationalGroups.map((group) => (
                  <FigureGroup
                    key={group.title}
                    title={group.title}
                    notes={[
                      ...new Set(group.rows.map(({ current }) => current.note).filter((note): note is string => Boolean(note))),
                    ]}
                  >
                    {group.rows.map(({ points, current }) => {
                      const info = series[current.id];
                      const where = current.area === "Rwanda" ? "" : `, ${provinceLabel}`;
                      return (
                        <FigureRow
                          key={`${current.area}:${current.id}`}
                          label={`${plainLabel(info.label)}${where}`}
                          detail={`${current.period} · ${info.table}`}
                          value={formatPoint(current.value, info.unit)}
                          status={current.status}
                          trend={
                            <Sparkline
                              points={points.map((point) => ({ x: (point.start + point.end) / 2, y: point.value }))}
                              selected={(current.start + current.end) / 2}
                            />
                          }
                        />
                      );
                    })}
                  </FigureGroup>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="mt-4 max-w-4xl text-[13px] leading-6 text-muted">
        <span className="font-semibold text-ink">How to read: </span>
        each small line shows a series across all its years, and the dot marks {year}. A survey period such as 2023/24 counts for
        both years. Figures come from different surveys with different samples, so compare a series with itself over time rather
        than with another series.
      </p>
    </div>
  );
}
