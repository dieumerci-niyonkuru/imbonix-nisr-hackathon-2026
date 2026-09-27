import { meta } from "@/lib/indicators";
import { correlation, formatR } from "@/lib/stats";
import { textOn } from "@/lib/scales";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DIVERGING } from "@/lib/palette";

/** Diverging scale from the logo: blue (negative), neutral grey (near zero), gold (positive). Each half validated as an ordinal ramp. */
const NEGATIVE = DIVERGING.negative;
const NEUTRAL = DIVERGING.neutral;
const POSITIVE = [...DIVERGING.positive].reverse();

function fill(r: number) {
  const a = Math.abs(r);
  if (a < 0.15) return NEUTRAL;
  const step = a >= 0.6 ? 2 : a >= 0.35 ? 1 : 0;
  return r < 0 ? NEGATIVE[2 - step] : POSITIVE[step];
}

/** Critical |r| for p < 0.05 (two-sided) with 30 observations. */
const CRITICAL_R = 0.361;

/**
 * Pearson correlations between district averages (lower triangle). Ecological: it describes districts,
 * not households, and n is only 29 to 30.
 */
export function CorrelationMatrix({ ids }: { ids: string[] }) {
  return (
    <div className="min-w-0">
      <ScrollArea label="Correlation matrix (scrolls sideways)" className="rounded-2xl border border-line bg-white p-3">
        <table className="border-separate border-spacing-[3px] text-[12px]">
          <caption className="sr-only">Correlation between district indicators; values near 1 or −1 are strong.</caption>
          <thead>
            <tr>
              <th scope="col" className="sr-only">
                Indicator
              </th>
              {ids.slice(0, -1).map((id) => (
                <th key={id} scope="col" className="h-28 w-12 align-bottom">
                  <span className="mx-auto block w-4 whitespace-nowrap text-[11px] font-semibold text-muted [transform:rotate(180deg)] [writing-mode:vertical-rl]">
                    {meta(id).short}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ids.slice(1).map((rowId, i) => (
              <tr key={rowId}>
                <th scope="row" className="whitespace-nowrap pr-3 text-right text-[12px] font-semibold text-ink">
                  {meta(rowId).short}
                </th>
                {ids.slice(0, -1).map((colId, j) => {
                  if (j > i) return <td key={colId} />;
                  const { r, n } = correlation(rowId, colId);
                  const bg = fill(r);
                  return (
                    <td
                      key={colId}
                      title={`${meta(rowId).short} × ${meta(colId).short}: r = ${formatR(r)} (n = ${n})`}
                      className="tabular h-11 w-12 rounded-md text-center"
                      style={{
                        background: bg,
                        color: textOn(bg),
                        fontWeight: Math.abs(r) >= CRITICAL_R ? 700 : 400,
                      }}
                    >
                      {formatR(r)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-muted">
        <span className="flex items-center gap-1">
          {[...NEGATIVE, NEUTRAL, ...POSITIVE].map((c) => (
            <span key={c} className="h-3 w-5 rounded-sm" style={{ background: c }} />
          ))}
        </span>
        <span>−1 (move in opposite directions) … +1 (move together)</span>
        <span>
          <strong className="text-ink">Bold</strong>: |r| ≥ {CRITICAL_R}, unlikely to be chance with 30 districts
        </span>
      </div>
    </div>
  );
}
