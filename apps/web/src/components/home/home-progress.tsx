import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { ChangeDots, type ChangeRow } from "@/components/charts/change-dots";
import { ChartCard } from "@/components/ui/chart-card";
import { PROVINCE_LABEL, PROVINCES } from "@/lib/data";
import { nationalSeries } from "@/lib/timeline";

const POVERTY_SOURCE = "NISR, EICV7 Rwanda Poverty Profile 2023/24, Table 5.1";

/** Province or Rwanda, short. */
const areaName = (area: string) =>
  area === "Rwanda" ? "Rwanda" : PROVINCE_LABEL[area].replace(" Province", "").replace("City of ", "");

const oneDp = (value: number) => Math.round(value * 10) / 10;

const linkStyle =
  "inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-[14px] font-bold text-cyan-ink ring-1 ring-cyan/30 transition-colors hover:bg-cyan hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink";

/**
 * Progress over time: poverty fell in every province between 2016/17 and 2023/24. A before-and-after chart (the two
 * rounds NISR compares on one method) shows the change at a glance, and the section ties it to the solution — IMBONIX
 * maps where poverty is still highest, so support goes there. The full year-by-year trends are on the trends page. All
 * figures are read from the same NISR series the trends page uses, so the homepage can never drift from it.
 */
export function HomeProgress() {
  const rows: ChangeRow[] = ["Rwanda", ...PROVINCES]
    .map((area) => {
      const [before, after] = nationalSeries("poverty_rate", area).points;
      return { label: areaName(area), before: before.value, after: after.value, emphasis: area === "Rwanda" };
    })
    .sort((first, second) => Number(second.emphasis) - Number(first.emphasis) || second.after - first.after);
  const rwanda = rows[0];
  const drop = oneDp(rwanda.before - rwanda.after);

  return (
    <section className="border-y border-line bg-white py-10 sm:py-14" aria-labelledby="progress-heading">
      <div className="container-page">
        <p className="eyebrow text-cyan-ink">The progress</p>
        <h2
          id="progress-heading"
          className="mt-3 max-w-4xl text-balance font-display text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl"
        >
          Poverty is falling — IMBONIX shows where to finish the job
        </h2>
        <p className="mt-4 max-w-3xl text-pretty text-[16px] leading-7 text-muted sm:text-[17px]">
          Between 2016/17 and 2023/24, poverty fell <strong className="font-bold text-ink">{drop} points</strong> nationally —
          from {rwanda.before}% to {rwanda.after}% — and it fell in <strong className="font-bold text-ink">every province</strong>
          . The job now is to reach the places left behind, and IMBONIX maps exactly where poverty is still highest.
        </p>

        <div className="mt-8 max-w-3xl">
          <ChartCard
            id="chart-home-poverty-change"
            title="Poverty fell in every province, 2016/17 → 2023/24"
            howToRead="Each line is one area. The grey dot is 2016/17 and the cyan dot 2023/24; the further left the cyan dot, the lower poverty is now."
            source={POVERTY_SOURCE}
            status="model_estimate"
          >
            <ChangeDots rows={rows} beforeLabel="2016/17" afterLabel="2023/24" max={60} />
          </ChartCard>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/poverty-dynamics/trends" className={linkStyle}>
            See how Rwanda has changed, year by year
            <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/poverty-dynamics/district-map" className={linkStyle}>
            See where poverty is still highest
            <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
