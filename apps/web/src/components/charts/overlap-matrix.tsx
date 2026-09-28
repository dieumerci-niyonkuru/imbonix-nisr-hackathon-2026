import Link from "next/link";
import { worstThirdCount } from "@/components/charts/fingerprint";
import { DISTRICTS, PROVINCE_LABEL, rankOf } from "@/lib/data";
import { formatValue } from "@/lib/format";
import { CORE_DIMENSIONS, DIMENSIONS, meta } from "@/lib/indicators";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WHITE } from "@/lib/palette";
import { textOn } from "@/lib/scales";

/**
 * Districts x the four core dimensions. Cells are shaded by tercile of rank (most affected third darkest), and
 * rows are ordered by how many dimensions fall in the most-affected third. It is a table, so it doubles as the
 * accessible view of the four maps.
 */
export function OverlapMatrix() {
  const rows = DISTRICTS.map((district) => {
    const cells = CORE_DIMENSIONS.map((dimension) => {
      const indicator = meta(DIMENSIONS[dimension].headline!);
      const rank = rankOf(district, indicator);
      const tercile = rank ? Math.min(2, Math.floor(((rank.rank - 1) * 3) / rank.of)) : undefined; // 0 = most affected
      return { dimension, indicator, value: district.values[indicator.id]?.v, rank, tercile };
    });
    return { district, cells, overlap: worstThirdCount(district), rankSum: cells.reduce((s, c) => s + (c.rank?.rank ?? 30), 0) };
  }).sort((a, b) => b.overlap - a.overlap || a.rankSum - b.rankSum);

  return (
    <div className="min-w-0">
      <ScrollArea
        label="Overlap of the four dimensions by district (scrolls sideways)"
        className="rounded-2xl border border-line bg-white"
      >
        <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
          <caption className="sr-only">
            Rank of each district on poverty, financial access, nutrition and shocks; 1 is the most affected of 30.
          </caption>
          <thead className="bg-paper text-[12.5px] text-muted">
            <tr>
              <th scope="col" className="px-4 py-3">
                District
              </th>
              {CORE_DIMENSIONS.map((dimension) => (
                <th key={dimension} scope="col" className="px-3 py-3">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: DIMENSIONS[dimension].accent }} />
                    {DIMENSIONS[dimension].label}
                  </span>
                  <span className="block font-normal normal-case tracking-normal">
                    {meta(DIMENSIONS[dimension].headline!).short}
                  </span>
                </th>
              ))}
              <th scope="col" className="px-4 py-3 text-right">
                In worst third
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ district, cells, overlap }) => (
              <tr key={district.slug} className="border-t border-line">
                <th scope="row" className="px-4 py-2 font-semibold">
                  <Link href={`/districts/${district.slug}`} className="text-ink hover:text-royal">
                    {district.name}
                  </Link>
                  <span className="block text-[11px] font-normal text-muted">{PROVINCE_LABEL[district.province]}</span>
                </th>
                {cells.map((cell) => {
                  const ramp = DIMENSIONS[cell.dimension].ramp;
                  const bg = cell.tercile === 0 ? ramp[4] : cell.tercile === 1 ? ramp[1] : WHITE;
                  const fg = textOn(bg);
                  return (
                    <td key={cell.dimension} className="p-1">
                      <div className="rounded-lg px-2.5 py-1.5" style={{ background: bg, color: fg }}>
                        <span className="tabular font-semibold">{formatValue(cell.indicator, cell.value)}</span>
                        {cell.rank && <span className="tabular ml-1.5 text-[11px] font-semibold">#{cell.rank.rank}</span>}
                      </div>
                    </td>
                  );
                })}
                <td className="px-4 py-2 text-right">
                  <span
                    className={`tabular inline-flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold ${
                      overlap >= 3
                        ? "bg-cyan-ink text-white"
                        : overlap === 2
                          ? "bg-cyan-soft text-cyan-ink ring-1 ring-inset ring-cyan/50"
                          : "bg-paper text-ink"
                    }`}
                  >
                    {overlap}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
      <p className="mt-3 text-[12px] leading-5 text-muted">
        Dark cell: among the 10 most affected districts on that dimension. Light cell: middle third. White: least affected third.
        Ranks are indicative; neighbouring ranks often overlap within survey error.
      </p>
    </div>
  );
}
