import type { CSSProperties } from "react";

/**
 * One bar. `gapTo` draws the missing part of the bar up to that value as a dashed band, labelled with `gapLabel`, so
 * the gap is visible in the chart itself.
 */
export type GapRow = { label: string; value: number; color: string; gapTo?: number; gapLabel?: string };

/**
 * The gap in one chart: a statement title, one bar per published measure with its value, the gap drawn as a dashed
 * band, and a closing line that spells it out. Plain HTML bars, so the chart reads the same with or without
 * JavaScript and by screen readers; the bars grow in once on load unless reduced motion is preferred.
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
  return (
    <figure className="rounded-3xl bg-white p-5 text-ink shadow-lift sm:p-7">
      <figcaption>
        <p className="font-display text-xl font-bold tracking-[-0.015em] sm:text-[22px]">{title}</p>
        <p className="mt-1 text-[13px] leading-5 text-muted">{note}</p>
      </figcaption>
      <ul className="mt-6 space-y-3.5">
        {rows.map((row, index) => (
          <li
            key={row.label}
            className="grid grid-cols-[minmax(0,6.5rem)_minmax(0,1fr)_2.75rem] items-center gap-3 sm:grid-cols-[minmax(0,9.5rem)_minmax(0,1fr)_3rem]"
          >
            <span
              className={`text-right text-[13px] leading-5 sm:text-[13.5px] ${row.gapTo !== undefined ? "font-bold text-ink" : "text-ink/85"}`}
            >
              {row.label}
            </span>
            <span className="relative h-8 rounded-md bg-mist">
              <span
                className="bar-grow absolute inset-y-0 left-0 rounded-md"
                style={{ width: `${row.value}%`, background: row.color, "--bar-delay": `${index * 90}ms` } as CSSProperties}
                aria-hidden="true"
              />
              {row.gapTo !== undefined && (
                <span
                  className="absolute inset-y-0 flex items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-cyan-ink/50 bg-cyan-soft px-0.5 text-[11px] font-bold text-cyan-ink sm:px-2 sm:text-[11.5px]"
                  style={{ left: `${row.value}%`, width: `${row.gapTo - row.value}%` }}
                >
                  <span className="text-center leading-[1.1]">{row.gapLabel}</span>
                </span>
              )}
            </span>
            <span className="tabular text-[15px] font-bold">{row.value}%</span>
          </li>
        ))}
      </ul>
      {takeaway && <p className="mt-6 rounded-xl bg-cyan px-4 py-3 text-[14px] font-semibold leading-6 text-ink">{takeaway}</p>}
      <p className="mt-4 text-[12px] leading-5 text-muted">{source}</p>
    </figure>
  );
}
