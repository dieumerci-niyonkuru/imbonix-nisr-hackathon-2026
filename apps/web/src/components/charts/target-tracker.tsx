import type { Target } from "@/lib/national";
import { LIGHT_GREY, RAMPS } from "@/lib/palette";

function format(value: number, unit: Target["unit"]) {
  return unit === "M" ? `${value}M` : `${value}%`;
}

/**
 * Baseline and target on one scale, with the gap still to close. Only baselines are measured; nothing here
 * is a forecast.
 */
export function TargetTracker({ targets }: { targets: Target[] }) {
  return (
    <ul className="divide-y divide-line">
      {targets.map((t) => {
        const scaleMax = t.unit === "M" ? Math.ceil(t.target * 1.15) : 100;
        const pos = (v: number) => `${(v / scaleMax) * 100}%`;
        const gap = t.target - t.baseline;
        const gapText =
          t.unit === "M"
            ? `${gap > 0 ? "+" : "−"}${Math.abs(gap).toFixed(2)}M members to add`
            : `${gap > 0 ? "+" : "−"}${Math.abs(gap).toFixed(Number.isInteger(gap) ? 0 : 1)} points to ${t.lowerIsBetter ? "cut" : "gain"}`;
        const [from, to] = t.baseline < t.target ? [t.baseline, t.target] : [t.target, t.baseline];
        return (
          <li key={t.label} className="grid gap-2 py-4 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] sm:items-center sm:gap-6">
            <div>
              <p className="text-[13.5px] font-semibold text-ink">{t.label}</p>
              <p className="text-[11.5px] text-muted">{t.source.name}</p>
            </div>
            <div>
              <div className="relative h-6" aria-hidden="true">
                <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-paper" />
                <div
                  className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full"
                  style={{
                    left: pos(from),
                    width: `calc(${pos(to)} - ${pos(from)})`,
                    background: t.lowerIsBetter ? LIGHT_GREY : RAMPS.cyan[0],
                  }}
                />
                <span
                  className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-ink shadow"
                  style={{ left: pos(t.baseline) }}
                />
                <span
                  className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-ink bg-white"
                  style={{ left: pos(t.target) }}
                />
              </div>
              <div className="mt-1 flex flex-wrap justify-between gap-x-3 text-[11.5px]">
                <span className="text-ink">
                  <strong>{format(t.baseline, t.unit)}</strong> in {t.baselineYear}
                </span>
                <span className="font-semibold text-muted">{gapText}</span>
                <span className="text-cyan-ink">
                  Target <strong>{format(t.target, t.unit)}</strong> by {t.targetYear}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
