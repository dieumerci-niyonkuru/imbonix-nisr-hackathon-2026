import Link from "next/link";
import { rankOf, type District } from "@/lib/data";
import { formatValue } from "@/lib/format";
import { CORE_DIMENSIONS, DIMENSIONS, meta } from "@/lib/indicators";

/** Where a district sits on the four core dimensions. Rank 1 = most affected. No composite score. */
export function Fingerprint({ district, compact = false }: { district: District; compact?: boolean }) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {CORE_DIMENSIONS.map((dimension) => {
        const info = DIMENSIONS[dimension];
        const indicator = meta(info.headline!);
        const value = district.values[indicator.id]?.v;
        const rank = rankOf(district, indicator);
        const share = rank ? (rank.of - rank.rank + 1) / rank.of : 0;
        return (
          <div key={dimension}>
            <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
              <span className="font-semibold text-ink">
                {info.label}
                {!compact && <span className="font-normal text-muted"> · {indicator.short.toLowerCase()}</span>}
              </span>
              <span className="tabular shrink-0 font-semibold text-ink">
                {formatValue(indicator, value)}
                {rank && (
                  <span className="ml-1.5 font-normal text-muted">
                    #{rank.rank}/{rank.of}
                  </span>
                )}
              </span>
            </div>
            <div
              className="mt-1 h-1.5 overflow-hidden rounded-full bg-paper"
              title={rank ? `Rank ${rank.rank} of ${rank.of} (1 = most affected)` : "No data"}
            >
              <div className="h-full rounded-full" style={{ width: `${Math.max(4, share * 100)}%`, background: info.accent }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** How many of the four dimensions put the district in the most-affected third (rank 1–10). */
export function worstThirdCount(district: District): number {
  return CORE_DIMENSIONS.filter((dimension) => {
    const rank = rankOf(district, meta(DIMENSIONS[dimension].headline!));
    return rank !== undefined && rank.rank <= Math.ceil(rank.of / 3);
  }).length;
}

export function OverlapBadge({ district }: { district: District }) {
  const count = worstThirdCount(district);
  const tone =
    count >= 3
      ? "bg-sun-ink text-white"
      : count === 2
        ? "bg-sun-soft text-sun-ink ring-1 ring-inset ring-sun/50"
        : count === 1
          ? "bg-paper text-ink"
          : "bg-brand-50 text-brand-700";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${tone}`}
      title="Dimensions where the district is among the 10 most affected"
    >
      {count} of 4 in the most affected third
    </span>
  );
}

export function DistrictLink({ district, className = "" }: { district: District; className?: string }) {
  return (
    <Link href={`/districts/${district.slug}`} className={`link ${className}`}>
      {district.name}
    </Link>
  );
}
