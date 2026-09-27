export type GapRow = { label: string; value: number; color: string };

/**
 * The gap in one chart: a statement title, one bar per published measure with its value, and a closing line that
 * spells out the gap. Plain HTML bars, so the chart is readable with or without JavaScript and by screen readers.
 */
export function GapChart({
  title,
  note,
  rows,
  takeaway,
  source,
}: {
  title: string;
  note: string;
  rows: GapRow[];
  takeaway: string;
  source: string;
}) {
  return (
    <figure className="rounded-3xl bg-white p-6 text-ink shadow-lift sm:p-7">
      <figcaption>
        <p className="font-display text-xl font-bold tracking-[-0.015em]">{title}</p>
        <p className="mt-1 text-[13px] leading-5 text-muted">{note}</p>
      </figcaption>
      <ul className="mt-6 space-y-3.5">
        {rows.map((row) => (
          <li key={row.label} className="grid grid-cols-[minmax(0,9.5rem)_minmax(0,1fr)_3rem] items-center gap-3">
            <span className="text-right text-[13.5px] leading-5 text-ink/85">{row.label}</span>
            <span className="relative h-7 overflow-hidden rounded-md bg-mist" aria-hidden="true">
              <span className="absolute inset-y-0 left-0 rounded-md" style={{ width: `${row.value}%`, background: row.color }} />
            </span>
            <span className="tabular text-[15px] font-bold">{row.value}%</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 rounded-xl bg-navy-900 px-4 py-3 text-[14px] font-semibold leading-6 text-white">{takeaway}</p>
      <p className="mt-4 text-[12px] leading-5 text-muted">{source}</p>
    </figure>
  );
}
