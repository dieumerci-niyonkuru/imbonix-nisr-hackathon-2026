import { StatusBadge } from "@/components/ui/status-badge";
import { rankOf, reference, SOURCES, valuesFor, type District } from "@/lib/data";
import { formatValue } from "@/lib/format";
import { DIMENSIONS, meta } from "@/lib/indicators";

/**
 * One indicator for one district: the value (with its confidence interval), and a strip showing where it sits
 * between the lowest and highest district, with the national or median reference marked.
 */
export function IndicatorRow({ district, id }: { district: District; id: string }) {
  const indicator = meta(id);
  const value = district.values[id];
  const source = SOURCES[id];
  if (!value || !source) return null;
  const values = valuesFor(id);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const ref = reference(id);
  const pos = (v: number) => (max === min ? 50 : Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100)));
  const rank = indicator.better === "neutral" ? undefined : rankOf(district, indicator);
  const accent = DIMENSIONS[indicator.dimension].accent;

  return (
    <div className="rounded-xl border border-line/80 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-semibold leading-5 text-ink">{indicator.short}</p>
        <div className="shrink-0 text-right">
          <p className="font-display text-xl font-bold leading-6 text-ink">{formatValue(indicator, value.v)}</p>
          {value.lo !== undefined && value.hi !== undefined && (
            <p className="tabular text-[10.5px] text-muted">
              CI {formatValue(indicator, value.lo)} to {formatValue(indicator, value.hi)}
            </p>
          )}
        </div>
      </div>

      <div className="relative mt-3 h-5" aria-hidden="true">
        {/* The confidence band is clipped to the district range; the full interval is printed above. */}
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-paper">
          {value.lo !== undefined && value.hi !== undefined && (
            <div
              className="absolute inset-y-0 opacity-30"
              style={{ left: `${pos(value.lo)}%`, width: `${Math.max(0, pos(value.hi) - pos(value.lo))}%`, background: accent }}
            />
          )}
        </div>
        <div
          className="absolute top-0 h-5 w-px bg-ink/60"
          style={{ left: `${pos(ref.value)}%` }}
          title={`${ref.label}: ${formatValue(indicator, ref.value)}`}
        />
        <div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{ left: `${pos(value.v)}%`, background: accent }}
        />
      </div>
      <div className="tabular mt-1 flex justify-between text-[10.5px] text-muted">
        <span>{formatValue(indicator, min)}</span>
        <span>
          {ref.label} {formatValue(indicator, ref.value)}
        </span>
        <span>{formatValue(indicator, max)}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] leading-4 text-muted">
        <StatusBadge status={source.status} />
        {rank && (
          <span className="font-semibold text-ink/80">
            #{rank.rank} of {rank.of} most affected
          </span>
        )}
        <span>
          {source.source.replace(/^NISR /, "")} · {source.table} · {source.year}
        </span>
      </div>
      {indicator.note && <p className="mt-2 text-[11px] leading-4 text-muted">{indicator.note}</p>}
    </div>
  );
}
