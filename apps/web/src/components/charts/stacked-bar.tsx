import { textOn } from "@/lib/scales";

export type Segment = { label: string; value: number; color: string };

/** A 100% bar with labelled segments and a legend underneath. */
export function StackedBar({
  segments,
  height = "h-8",
  showLegend = true,
  suffix = "%",
}: {
  segments: Segment[];
  height?: string;
  showLegend?: boolean;
  suffix?: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  return (
    <div>
      <div className={`flex ${height} w-full gap-[2px] overflow-hidden rounded-lg`}>
        {segments.map((segment) => {
          const share = (segment.value / total) * 100;
          return (
            <div
              key={segment.label}
              className="flex items-center justify-center overflow-hidden text-[11px] font-bold transition-[width] duration-500"
              style={{ width: `${share}%`, background: segment.color, color: textOn(segment.color) }}
              title={`${segment.label}: ${formatShare(segment.value)}${suffix}`}
            >
              {share >= 9 ? `${formatShare(segment.value)}${suffix}` : ""}
            </div>
          );
        })}
      </div>
      {showLegend && (
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {segments.map((segment) => (
            <li key={segment.label} className="flex items-center gap-1.5 text-[11.5px] text-muted">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: segment.color }} />
              {segment.label}{" "}
              <span className="tabular font-semibold text-ink">
                {formatShare(segment.value)}
                {suffix}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatShare(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
