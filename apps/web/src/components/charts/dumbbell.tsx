import { PAIR } from "@/lib/palette";
export type DumbbellRow = { label: string; women?: number; men?: number };

export const WOMEN = PAIR.a;
export const MEN = PAIR.b;

/** Women and men on one line per group, 0–100%. */
export function Dumbbell({ rows, max = 100 }: { rows: DumbbellRow[]; max?: number }) {
  const pct = (v: number) => `${(v / max) * 100}%`;
  return (
    <div>
      <div className="mb-3 flex gap-5 text-[12px] font-semibold text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full" style={{ background: WOMEN }} /> Women
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full" style={{ background: MEN }} /> Men
        </span>
      </div>
      <div className="space-y-2.5">
        {rows.map((row) => {
          const values = [row.women, row.men].filter((v): v is number => v !== undefined);
          const low = Math.min(...values);
          const high = Math.max(...values);
          return (
            <div key={row.label} className="grid grid-cols-[112px_1fr] items-center gap-3 sm:grid-cols-[150px_1fr]">
              <span className="truncate text-[12.5px] font-semibold text-ink">{row.label}</span>
              <div className="relative h-7">
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" />
                {values.length === 2 && (
                  <div
                    className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-ink/15"
                    style={{ left: pct(low), width: `calc(${pct(high)} - ${pct(low)})` }}
                  />
                )}
                {row.women !== undefined && <Dot value={row.women} color={WOMEN} left={pct(row.women)} label="Women" below />}
                {row.men !== undefined && <Dot value={row.men} color={MEN} left={pct(row.men)} label="Men" />}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 grid grid-cols-[112px_1fr] gap-3 sm:grid-cols-[150px_1fr]">
        <span />
        <div className="flex justify-between text-[10.5px] font-semibold text-muted">
          {[0, 25, 50, 75, 100].map((t) => (
            <span key={t}>{t}%</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Dot({
  value,
  color,
  left,
  label,
  below = false,
}: {
  value: number;
  color: string;
  left: string;
  label: string;
  below?: boolean;
}) {
  return (
    <span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left }} title={`${label}: ${value}%`}>
      <span className="block h-3.5 w-3.5 rounded-full border-2 border-white shadow" style={{ background: color }} />
      <span
        className={`tabular absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[10.5px] font-bold text-ink/75 ${below ? "top-4" : "-top-4"}`}
      >
        {value.toFixed(1)}
      </span>
    </span>
  );
}
