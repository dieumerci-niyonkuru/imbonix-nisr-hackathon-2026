import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { NATIONAL_FRAMEWORKS, TARGET_PROGRESS, TARGETS_SOURCE } from "@/lib/national-targets";

/**
 * How IMBONIX connects to Rwanda's national priorities. It names the frameworks the work serves — Vision 2050, NST2
 * and the financial-inclusion and social-protection strategies — and shows, for each published national target, how
 * far the latest figure is from the goal. Every number is the baseline or target already held in national-targets.ts;
 * nothing here is invented, and the bar shows progress toward a target, never a forecast.
 */
export function NationalPriorities() {
  return (
    <section className="bg-white py-12 sm:py-20" aria-labelledby="priorities-heading">
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
          Rwanda&apos;s goal of a high-income, inclusive economy. IMBONIX tracks the NST2 and Roadmap targets that lead there —
          the near-term milestones on the road to 2050 — district by district, so progress toward where Rwanda wants to be is
          visible where it is won or lost.
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
          {TARGET_PROGRESS.map((target) => {
            const share = Math.min(100, Math.round((target.baseline / target.target) * 100));
            return (
              <li
                key={target.measure}
                className="rounded-2xl border border-t-4 border-line border-t-cyan bg-white p-6 shadow-card"
              >
                <p className="font-display text-[16px] font-bold leading-6 tracking-[-0.01em] text-ink">{target.measure}</p>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <p className="leading-none">
                    <span className="font-display text-[30px] font-bold tracking-[-0.03em] text-cyan-ink">
                      {target.baseline}%
                    </span>
                    <span className="ml-1.5 text-[13px] font-semibold text-muted">now</span>
                  </p>
                  <p className="text-right text-[13px] font-semibold text-ink">
                    Target {target.target}%<span className="block text-[12px] font-normal text-muted">by {target.by}</span>
                  </p>
                </div>
                <div
                  className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-mist"
                  role="img"
                  aria-label={`${target.measure}: ${target.baseline}% now, against a target of ${target.target}% by ${target.by}.`}
                >
                  <div className="h-full rounded-full bg-cyan" style={{ width: `${share}%` }} />
                </div>
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
