import { cn } from "@/lib/utils";

export type ShareSegment = { label: string; share: number; color: string };

/**
 * Parts of a whole. A strip at the top shows the whole split into its parts; below it each part has its own bar on a
 * 0 to 100% scale, with its name and share written beside it, so parts are compared by length and read from their
 * labels rather than judged by angle. `highlight` names the part the chart is about, which is set larger.
 */
export function ShareBars({ segments, highlight }: { segments: ShareSegment[]; highlight?: string }) {
  // Published shares are rounded and can add up to 99% or 101%; the strip always fills its width.
  const total = segments.reduce((sum, segment) => sum + segment.share, 0) || 1;
  return (
    <div>
      <div className="flex h-4 w-full overflow-hidden rounded-[4px]" aria-hidden="true">
        {segments.map((segment, index) => (
          <span
            key={segment.label}
            className={cn("h-full", index > 0 && "border-l-2 border-white")}
            style={{ width: `${(segment.share / total) * 100}%`, background: segment.color }}
          />
        ))}
      </div>
      <ul className="mt-6 space-y-4">
        {segments.map((segment) => {
          const emphasised = segment.label === highlight;
          return (
            <li key={segment.label}>
              <div className="flex items-baseline justify-between gap-3">
                <span
                  className={cn("flex items-center gap-2 text-[14px]", emphasised ? "font-semibold text-ink" : "text-ink/85")}
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: segment.color }} aria-hidden="true" />
                  {segment.label}
                </span>
                <span
                  className={cn(
                    "tabular font-display font-bold tracking-[-0.01em] text-ink",
                    emphasised ? "text-[22px] leading-none" : "text-[15px]",
                  )}
                >
                  {segment.share}%
                </span>
              </div>
              <div className="mt-1.5 h-2.5 border-l border-line" aria-hidden="true">
                <div
                  className="h-full rounded-r-[4px]"
                  style={{ width: `${Math.min(100, segment.share)}%`, background: segment.color }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 flex justify-between text-[11.5px] text-muted" aria-hidden="true">
        <span>0%</span>
        <span>100%</span>
      </p>
    </div>
  );
}
