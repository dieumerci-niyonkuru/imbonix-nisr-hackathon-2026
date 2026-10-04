import { COMPARE } from "@/lib/palette";

export type ChangeRow = { label: string; before: number; after: number; emphasis?: boolean };

/**
 * Before and after on one line per area: a grey dot for the earlier period, a cyan dot for the later one and a bar
 * between them, each dot with its value beside it. Every row shares one scale from zero, so the rows compare.
 */
export function ChangeDots({
  rows,
  beforeLabel,
  afterLabel,
  max,
  unit = "%",
}: {
  rows: ChangeRow[];
  beforeLabel: string;
  afterLabel: string;
  max: number;
  unit?: string;
}) {
  const position = (value: number) => `${(value / max) * 100}%`;
  return (
    <div>
      <div className="mb-3 flex gap-5 text-[12px] font-semibold text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full" style={{ background: COMPARE.before }} /> {beforeLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full" style={{ background: COMPARE.after }} /> {afterLabel}
        </span>
      </div>
      <ul className="space-y-1.5">
        {rows.map((row) => {
          const low = Math.min(row.before, row.after);
          const high = Math.max(row.before, row.after);
          const lowIsAfter = row.after <= row.before;
          return (
            <li key={row.label} className="grid grid-cols-[96px_1fr] items-center gap-3 sm:grid-cols-[132px_1fr]">
              <span className={row.emphasis ? "text-[13px] font-bold text-ink" : "text-[13px] font-semibold text-ink/85"}>
                {row.label}
              </span>
              <span className="sr-only">
                {beforeLabel} {row.before}
                {unit}, {afterLabel} {row.after}
                {unit}
              </span>
              <div className="relative mx-10 h-9" aria-hidden="true">
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" />
                <div
                  className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-ink/10"
                  style={{ left: position(low), width: `calc(${position(high)} - ${position(low)})` }}
                />
                <Marker
                  value={row.before}
                  left={position(row.before)}
                  color={COMPARE.before}
                  side={lowIsAfter ? "right" : "left"}
                  unit={unit}
                />
                <Marker
                  value={row.after}
                  left={position(row.after)}
                  color={COMPARE.after}
                  side={lowIsAfter ? "left" : "right"}
                  unit={unit}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Marker({
  value,
  left,
  color,
  side,
  unit,
}: {
  value: number;
  left: string;
  color: string;
  side: "left" | "right";
  unit: string;
}) {
  return (
    <>
      <span
        className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
        style={{ left, background: color }}
      />
      <span
        className="tabular absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[12px] font-bold text-ink"
        style={side === "right" ? { left: `calc(${left} + 12px)` } : { right: `calc(100% - ${left} + 12px)` }}
      >
        {value}
        {unit}
      </span>
    </>
  );
}
