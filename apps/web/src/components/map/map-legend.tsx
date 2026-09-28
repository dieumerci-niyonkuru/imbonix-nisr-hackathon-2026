import { formatValue } from "@/lib/format";
import type { IndicatorMeta } from "@/lib/indicators";
import type { Scale } from "@/lib/scales";

export function MapLegend({ indicator, scale, compact = false }: { indicator: IndicatorMeta; scale: Scale; compact?: boolean }) {
  const classes = indicator.better === "higher" ? [...scale.classes].reverse() : scale.classes;
  const caption =
    indicator.better === "neutral"
      ? "Darker = higher"
      : indicator.better === "higher"
        ? "Darker = lower, so more vulnerable"
        : "Darker = higher, so more vulnerable";
  return (
    <div>
      <div className="flex items-stretch gap-1">
        {classes.map((c) => (
          <div key={`${c.from}-${c.to}`} className="min-w-0 flex-1">
            <div className="h-2.5 rounded-full" style={{ background: c.color }} />
            {!compact && (
              <p className="tabular mt-1.5 text-center text-[10.5px] font-semibold leading-tight text-muted">
                {c.from === c.to
                  ? formatValue(indicator, c.from)
                  : `${formatValue(indicator, c.from)} to ${formatValue(indicator, c.to)}`}
              </p>
            )}
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-[12px] font-semibold text-muted">{caption} · 5 groups of about 6 districts</p>
    </div>
  );
}
