import { formatValue } from "@/lib/format";
import type { IndicatorMeta } from "@/lib/indicators";
import { INK } from "@/lib/palette";

export type RankRow = { slug: string; name: string; value: number; lo?: number; hi?: number; color: string };

/**
 * All districts on one measure, most affected first, with confidence intervals where NISR publishes them and a
 * reference line (national figure or district median).
 */
export function RankBars({
  indicator,
  rows,
  reference,
  selected,
  onSelect,
}: {
  indicator: IndicatorMeta;
  rows: RankRow[];
  reference: { value: number; label: string };
  selected?: string;
  onSelect?: (slug: string) => void;
}) {
  const max = Math.max(...rows.map((r) => r.hi ?? r.value), reference.value) * 1.05 || 1;
  const pct = (v: number) => `${(v / max) * 100}%`;
  const hasCi = rows.some((r) => r.lo !== undefined);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] font-semibold text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-0 border-l-2 border-dashed border-ink" /> {reference.label}:{" "}
          {formatValue(indicator, reference.value)}
        </span>
        {hasCi && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-[3px] w-4 rounded bg-ink/40" /> 95% confidence interval
          </span>
        )}
        <span>Most affected at the top</span>
      </div>
      <ol className="space-y-[3px]">
        {rows.map((row, index) => {
          const active = row.slug === selected;
          const content = (
            <>
              <span className="tabular w-6 shrink-0 text-right text-[11px] font-semibold text-muted">{index + 1}</span>
              <span
                className={`w-24 shrink-0 truncate text-left text-[12.5px] sm:w-28 ${active ? "font-bold text-ink" : "font-semibold text-ink/85"}`}
              >
                {row.name}
              </span>
              <span className="relative h-5 flex-1">
                <span
                  className="absolute inset-y-0.5 left-0 rounded-[4px] transition-[width] duration-500"
                  style={{ width: pct(row.value), background: row.color, boxShadow: active ? `0 0 0 2px ${INK}` : undefined }}
                />
                {row.lo !== undefined && row.hi !== undefined && (
                  <span
                    className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded bg-ink/45"
                    style={{ left: pct(row.lo), width: `calc(${pct(row.hi)} - ${pct(row.lo)})` }}
                  />
                )}
                <span
                  className="absolute inset-y-0 border-l-2 border-dashed border-ink/70"
                  style={{ left: pct(reference.value) }}
                />
              </span>
              <span className="tabular w-[76px] shrink-0 text-right text-[12.5px] font-semibold text-ink">
                {formatValue(indicator, row.value)}
              </span>
            </>
          );
          return (
            <li key={row.slug}>
              {onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(row.slug)}
                  aria-pressed={active}
                  className={`flex w-full items-center gap-2 rounded-lg px-1 py-0.5 transition-colors ${active ? "bg-paper" : "hover:bg-paper"}`}
                >
                  {content}
                </button>
              ) : (
                <div className="flex items-center gap-2 px-1 py-0.5">{content}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
