import Link from "next/link";
import { DISTRICTS, reference, sortedDistricts } from "@/lib/data";
import { formatValue } from "@/lib/format";
import { DIMENSIONS, meta } from "@/lib/indicators";

/**
 * All 30 districts as dots on one axis, with the national (or median) reference marked and the extremes named:
 * shows how much the average hides.
 */
export function DistrictStrip({ id }: { id: string }) {
  const indicator = meta(id);
  const ref = reference(id);
  const rows = DISTRICTS.filter((d) => d.values[id]).map((d) => ({ name: d.name, slug: d.slug, value: d.values[id]!.v }));
  const max = Math.max(...rows.map((r) => r.value));
  const top = Math.ceil((max * 1.05) / 10) * 10 || 10;
  const pos = (v: number) => `${(v / top) * 100}%`;
  const sorted = sortedDistricts(id, indicator.better);
  const worst = sorted[0];
  const best = sorted[sorted.length - 1];
  const accent = DIMENSIONS[indicator.dimension].accent;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <Link href={`/map?layer=${id}`} className="text-[13.5px] font-semibold text-ink hover:text-royal">
          {indicator.short}
        </Link>
        <span className="text-[12px] text-muted">
          {ref.label} {formatValue(indicator, ref.value)}
        </span>
      </div>
      <div
        className="relative mt-2 h-8"
        role="img"
        aria-label={`${indicator.short} across 30 districts: from ${formatValue(indicator, best.values[id]?.v)} in ${best.name} to ${formatValue(indicator, worst.values[id]?.v)} in ${worst.name}.`}
      >
        <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
        <div className="absolute top-0 h-8 w-0.5 -translate-x-1/2 rounded bg-ink/70" style={{ left: pos(ref.value) }} />
        {rows.map((r) => (
          <span
            key={r.slug}
            title={`${r.name}: ${formatValue(indicator, r.value)}`}
            className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
            style={{ left: pos(r.value), background: accent, opacity: 0.85 }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[11.5px] text-muted">
        <span>
          {indicator.better === "higher" ? "Most affected" : "Least affected"}:{" "}
          <strong className="text-ink">{(indicator.better === "higher" ? worst : best).name}</strong>{" "}
          {formatValue(indicator, (indicator.better === "higher" ? worst : best).values[id]?.v)}
        </span>
        <span>
          {indicator.better === "higher" ? "Least affected" : "Most affected"}:{" "}
          <strong className="text-ink">{(indicator.better === "higher" ? best : worst).name}</strong>{" "}
          {formatValue(indicator, (indicator.better === "higher" ? best : worst).values[id]?.v)}
        </span>
      </div>
    </div>
  );
}
