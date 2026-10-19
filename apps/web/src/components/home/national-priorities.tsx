import Link from "next/link";
import { ArrowRightIcon, FlagIcon } from "@heroicons/react/20/solid";
import { NATIONAL_FRAMEWORKS, TARGET_PROGRESS, TARGETS_SOURCE } from "@/lib/national-targets";

/** A short, data-driven label for how close the latest figure sits to its target — gives each card its own read. */
function progressBand(share: number): string {
  if (share >= 85) return "Nearly at target";
  if (share >= 60) return "Over halfway";
  if (share >= 40) return "Halfway there";
  return "Early progress";
}

/**
 * How IMBONIX connects to Rwanda's national priorities. It names the frameworks the work serves — Vision 2050, NST2
 * and the financial-inclusion and social-protection strategies — and shows, for each published national target, how
 * far the latest figure is from the goal. Every number is the baseline or target already held in national-targets.ts;
 * nothing here is invented, and the bar shows progress toward a target, never a forecast.
 *
 * The first card — financial health, the platform's headline gap — is rendered as a strong filled card so it leads the
 * eye; the rest are crisp white cards. Each carries a progress badge derived from its own figure, so no two cards read
 * the same.
 */
export function NationalPriorities() {
  return (
    <section className="bg-white py-10 sm:py-14" aria-labelledby="priorities-heading">
      <div className="container-page">
        <p className="eyebrow text-cyan-ink">Aligned to national priorities</p>
        <h2
          id="priorities-heading"
          className="mt-3 max-w-4xl text-balance font-display text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl"
        >
          Measuring progress toward Vision 2050 and NST2
        </h2>
        <p className="mt-4 max-w-3xl text-pretty text-[16px] leading-7 text-muted sm:text-[17px]">
          Financial inclusion and social protection are central to <span className="font-semibold text-ink">Vision 2050</span>,
          Rwanda&apos;s goal of a high-income, inclusive economy. IMBONIX tracks the NST2 and Roadmap targets that lead there, the
          near-term milestones on the road to 2050, district by district.
        </p>

        <ul className="mt-6 flex flex-wrap gap-2" aria-label="National frameworks IMBONIX supports">
          {NATIONAL_FRAMEWORKS.map((framework) => (
            <li
              key={framework}
              className="rounded-full bg-cyan-soft px-3.5 py-1.5 text-[13px] font-bold text-cyan-ink ring-1 ring-cyan/30"
            >
              {framework}
            </li>
          ))}
        </ul>

        <ol className="mt-10 grid gap-5 sm:grid-cols-2">
          {TARGET_PROGRESS.map((target, index) => {
            const ratio = (target.baseline / target.target) * 100;
            const share = Math.min(100, Math.round(ratio));
            const gap = Math.round((target.target - target.baseline) * 10) / 10;
            const band = progressBand(ratio);
            const isPrimary = index === 0;
            const ariaLabel = `${target.measure}: ${target.baseline}% now, against a target of ${target.target}% by ${target.by} — ${gap} percentage points to go.`;

            if (isPrimary) {
              // The headline gap, rendered as a strong filled card so it leads the grid.
              return (
                <li
                  key={target.measure}
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-cyan-ink p-6 text-white shadow-lift transition duration-200 hover:-translate-y-1"
                >
                  <span
                    className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-gradient-to-br from-white/25 to-transparent blur-2xl"
                    aria-hidden="true"
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">Headline metric</p>
                      <p className="mt-1 font-display text-[16px] font-bold leading-6 tracking-[-0.01em] text-white">
                        {target.measure}
                      </p>
                    </div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/30">
                      <FlagIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="relative mt-5 flex items-end justify-between gap-3">
                    <p className="leading-none">
                      <span className="font-display text-[34px] font-bold tracking-[-0.03em] text-white">{target.baseline}%</span>
                      <span className="ml-1.5 text-[13px] font-semibold text-white/70">now</span>
                    </p>
                    <p className="text-right text-[13px] font-semibold leading-tight text-white">
                      Target {target.target}%<span className="block text-[12px] font-normal text-white/70">by {target.by}</span>
                    </p>
                  </div>
                  <span className="relative mt-3 inline-flex w-fit items-center rounded-full bg-white/15 px-2.5 py-0.5 text-[11.5px] font-bold text-white ring-1 ring-white/25">
                    {band}
                  </span>
                  <div
                    className="relative mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/25"
                    role="img"
                    aria-label={ariaLabel}
                  >
                    <div className="h-full rounded-full bg-white" style={{ width: `${share}%` }} />
                  </div>
                  <p className="relative mt-2.5 text-[12.5px] font-semibold text-white/80">
                    <span className="font-bold text-white">{gap} points to go</span> to the {target.by} target — a step toward
                    Vision 2050
                  </p>
                </li>
              );
            }

            return (
              <li
                key={target.measure}
                className="group relative flex flex-col rounded-2xl border border-t-4 border-line border-t-cyan bg-white p-6 shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-display text-[16px] font-bold leading-6 tracking-[-0.01em] text-ink">{target.measure}</p>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-soft text-cyan-ink ring-1 ring-cyan/30">
                    <FlagIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-5 flex items-end justify-between gap-3">
                  <p className="leading-none">
                    <span className="font-display text-[32px] font-bold tracking-[-0.03em] text-cyan-ink">
                      {target.baseline}%
                    </span>
                    <span className="ml-1.5 text-[13px] font-semibold text-muted">now</span>
                  </p>
                  <p className="text-right text-[13px] font-semibold leading-tight text-ink">
                    Target {target.target}%<span className="block text-[12px] font-normal text-muted">by {target.by}</span>
                  </p>
                </div>
                <span className="mt-3 inline-flex w-fit items-center rounded-full bg-cyan-soft px-2.5 py-0.5 text-[11.5px] font-bold text-cyan-ink ring-1 ring-cyan/20">
                  {band}
                </span>
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-mist" role="img" aria-label={ariaLabel}>
                  <div className="h-full rounded-full bg-cyan" style={{ width: `${share}%` }} />
                </div>
                <p className="mt-2.5 text-[12.5px] font-semibold text-muted">
                  <span className="text-cyan-ink">{gap} points to go</span> to the {target.by} target — a step toward Vision 2050
                </p>
              </li>
            );
          })}
        </ol>

        <p className="mt-6 text-[13px] leading-6 text-muted">
          Targets: {TARGETS_SOURCE}. Each bar shows how far the latest published figure is from the target, not a forecast.
        </p>
        <Link
          href="/social-protection/policy-scenarios"
          className="group mt-4 inline-flex items-center gap-1.5 rounded text-[15px] font-bold text-ink underline-offset-4 hover:text-cyan-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
        >
          Test a target as a scenario
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
