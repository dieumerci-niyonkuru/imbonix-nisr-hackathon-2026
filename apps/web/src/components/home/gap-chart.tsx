import type { CSSProperties } from "react";
import { LINE } from "@/lib/palette";

/**
 * One bar. `gapTo` draws the shortfall from this value up to that value as a pale band ending in a marker line, so
 * the headline gap is measured in the chart itself; `gapLabel` names it.
 */
export type GapRow = { label: string; value: number; color: string; gapTo?: number; gapLabel?: string };

/** The scale ticks drawn behind the bars and labelled on the axis, as shares of the whole. */
const TICKS = [0, 25, 50, 75, 100];
/** A faint rule at each tick except zero, so the bars sit on a measured scale rather than in empty space. */
const GRIDLINES = `repeating-linear-gradient(to right, transparent 0, transparent calc(25% - 1px), ${LINE} calc(25% - 1px), ${LINE} 25%)`;

/**
 * The gap in one chart: a statement title, one bar per published measure on a measured 0 to 100% scale, and the
 * headline gap drawn as a pale band up to an access marker. Plain HTML bars, so the chart reads the same with or
 * without JavaScript and by screen readers; each bar grows in once on load unless reduced motion is preferred, and
 * hovering a row lifts it. Values and labels stay in ink; the cyan bar carries the measure.
 */
export function GapChart({
  title,
  note,
  rows,
  takeaway,
  source,
}: {
  title: string;
  note: string;
  rows: GapRow[];
  takeaway?: string;
  source: string;
}) {
  const columns = "grid-cols-[minmax(0,6.5rem)_minmax(0,1fr)_2.75rem] sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)_3rem]";
  return (
    <figure className="rounded-3xl border border-line bg-white p-5 text-ink shadow-lift sm:p-7">
      <figcaption>
        <p className="font-display text-xl font-bold tracking-[-0.015em] sm:text-[22px]">{title}</p>
        <p className="mt-1 text-[13px] leading-5 text-muted">{note}</p>
      </figcaption>

      <ul className="mt-6 space-y-2">
        {rows.map((row, index) => {
          const ceiling = row.gapTo;
          const rowTitle = `${row.label}: ${row.value}%${ceiling !== undefined ? ` — ${row.gapLabel} below ${ceiling}%` : ""}`;
          return (
            <li
              key={row.label}
              title={rowTitle}
              className={`group grid ${columns} items-center gap-3 rounded-lg py-1.5 transition-colors hover:bg-paper`}
            >
              <span
                className={`text-right text-[13px] leading-5 sm:text-[13.5px] ${
                  ceiling !== undefined ? "font-bold text-ink" : "text-ink/85"
                }`}
              >
                {row.label}
              </span>
              <span className="relative h-9 rounded-[5px]" style={{ backgroundImage: GRIDLINES }} aria-hidden="true">
                {/* The shortfall up to the access level, as a pale band ending in a marker line. */}
                {ceiling !== undefined && (
                  <span
                    className="absolute inset-y-0 flex items-center rounded-r-[5px] border-y border-r border-dashed border-cyan-ink/35 bg-cyan-soft"
                    style={{ left: `calc(${row.value}% + 2px)`, width: `calc(${ceiling - row.value}% - 2px)` }}
                  >
                    <span className="w-full truncate px-2 text-center text-[10.5px] font-bold uppercase tracking-[0.06em] text-cyan-ink">
                      {row.gapLabel}
                    </span>
                    <span className="absolute inset-y-[-3px] right-0 w-[2px] rounded bg-cyan-ink" />
                  </span>
                )}
                {/* The measure itself: a cyan bar anchored at zero, its end rounded, growing in on load. */}
                <span
                  className="bar-grow absolute inset-y-0 left-0 rounded-l-[2px] rounded-r-[5px] transition-[filter] group-hover:brightness-110"
                  style={{ width: `${row.value}%`, background: row.color, "--bar-delay": `${index * 80}ms` } as CSSProperties}
                />
              </span>
              <span className="tabular text-[15px] font-bold leading-5">{row.value}%</span>
            </li>
          );
        })}
      </ul>

      {/* The scale: ticks under the bar column, aligned with the gridlines above. */}
      <div className={`mt-1 grid ${columns} gap-3`} aria-hidden="true">
        <span />
        <div className="relative h-4 text-[10.5px] text-muted">
          {TICKS.map((tick) => (
            <span
              key={tick}
              className="tabular absolute top-0 -translate-x-1/2"
              style={{
                left: `${tick}%`,
                transform: tick === 0 ? "none" : tick === 100 ? "translateX(-100%)" : "translateX(-50%)",
              }}
            >
              {tick}
            </span>
          ))}
          <span className="absolute right-0 top-0 translate-y-0 text-muted" style={{ left: "calc(100% + 0.5rem)" }}>
            %
          </span>
        </div>
        <span />
      </div>

      {takeaway && <p className="mt-5 rounded-xl bg-cyan px-4 py-3 text-[14px] font-semibold leading-6 text-ink">{takeaway}</p>}
      <p className="mt-4 border-t border-line pt-3 text-[12px] leading-5 text-muted">{source}</p>
    </figure>
  );
}
