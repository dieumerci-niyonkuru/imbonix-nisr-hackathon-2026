import Link from "next/link";
import { DISTRICTS } from "@/lib/data";
import { sectorsOf } from "@/lib/sectors";
import { RAMPS } from "@/lib/palette";

/**
 * For each district, the range of sector poverty rates (NISR small-area estimates): the poorest and least poor
 * sector. Small-area estimates are meant for comparing sectors within a district, which is what this shows.
 */
export function SectorRange({ limit = 12 }: { limit?: number }) {
  const rows = DISTRICTS.map((d) => {
    const sectors = sectorsOf(d.name).filter((s) => s.povertySae !== null);
    const sorted = [...sectors].sort((a, b) => a.povertySae! - b.povertySae!);
    const low = sorted[0];
    const high = sorted[sorted.length - 1];
    return { district: d, low, high, gap: high.povertySae! - low.povertySae! };
  })
    .sort((a, b) => b.gap - a.gap)
    .slice(0, limit);
  const scale = 75;
  const pos = (v: number) => `${(v / scale) * 100}%`;
  // Keep labels inside the track: near either end they align to the dot's side instead of centring on it.
  const anchor = (v: number) =>
    v / scale < 0.25 ? "translate-x-0" : v / scale > 0.75 ? "-translate-x-full" : "-translate-x-1/2";

  return (
    <div>
      <ol className="space-y-3">
        {rows.map(({ district, low, high, gap }) => (
          <li key={district.slug} className="grid grid-cols-[120px_1fr] items-center gap-3 sm:grid-cols-[150px_1fr_72px]">
            <Link href={`/districts/${district.slug}`} className="truncate text-[13px] font-semibold text-ink hover:text-royal">
              {district.name}
            </Link>
            <div className="relative h-7" title={`${low.sector} ${low.povertySae}% to ${high.sector} ${high.povertySae}%`}>
              <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
              <div
                className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full"
                style={{
                  left: pos(low.povertySae!),
                  width: `calc(${pos(high.povertySae!)} - ${pos(low.povertySae!)})`,
                  background: `linear-gradient(to right, ${RAMPS.navy[0]}, ${RAMPS.navy[3]})`,
                }}
              />
              <span
                className={`absolute -top-0.5 whitespace-nowrap text-[10.5px] text-muted ${anchor(low.povertySae!)}`}
                style={{ left: pos(low.povertySae!) }}
              >
                {low.sector} {low.povertySae}%
              </span>
              <span
                className={`absolute -bottom-1 whitespace-nowrap text-[10.5px] font-semibold text-ink ${anchor(high.povertySae!)}`}
                style={{ left: pos(high.povertySae!) }}
              >
                {high.sector} {high.povertySae}%
              </span>
            </div>
            <span className="tabular hidden text-right text-[12.5px] font-semibold text-ink sm:block">{gap.toFixed(1)} pts</span>
          </li>
        ))}
      </ol>
      <div className="mt-3 grid grid-cols-[120px_1fr] gap-3 sm:grid-cols-[150px_1fr_72px]">
        <span />
        <div className="flex justify-between text-[10.5px] text-muted">
          {[0, 25, 50, 75].map((t) => (
            <span key={t}>{t}%</span>
          ))}
        </div>
      </div>
      <p className="mt-3 text-[12px] leading-5 text-muted">
        Sector poverty rates are NISR small area estimates (EICV7 with the 2022 census), read from the district presentations.
        They are model estimates, not adjusted to the district survey figures, so compare sectors within a district rather than
        across.
      </p>
    </div>
  );
}
