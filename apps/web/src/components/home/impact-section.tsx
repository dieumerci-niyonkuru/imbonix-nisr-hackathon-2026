import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRightIcon } from "@heroicons/react/20/solid";

type Outcome = {
  n: string;
  title: string;
  body: ReactNode;
  href: string;
  linkLabel: string;
};

/**
 * The impact, given a section of its own so it carries the same weight as the problem and the solution: the three
 * concrete shifts the platform makes, each tied to a real NISR figure and the working tool that delivers it. The dark
 * cyan fill sets it apart as the payoff of the page. Every claim is a pointer backed by a published figure, not a
 * promise of an outcome — the wording stays inside what the data supports.
 */
export function ImpactSection({
  excludedAdults,
  bestOnTimeShare,
  levers,
}: {
  excludedAdults: number;
  bestOnTimeShare: number;
  levers: number;
}) {
  const outcomes: Outcome[] = [
    {
      n: "01",
      title: "Support finds the right places",
      body: (
        <>
          In place of one national average, a short, defensible list of the highest-need districts for each need — so budgets and
          programmes can reach the <strong className="font-bold text-white">{excludedAdults.toLocaleString("en-US")}</strong>{" "}
          adults outside formal finance and the poorest households where they actually are.
        </>
      ),
      href: "/social-protection/priority-districts",
      linkLabel: "See the priority districts",
    },
    {
      n: "02",
      title: "Problems surface before a shock",
      body: (
        <>
          Late VUP payments — at best <strong className="font-bold text-white">{bestOnTimeShare}%</strong> arrive on time — and
          the households most likely to struggle when money runs short are made visible early, not after the fact.
        </>
      ),
      href: "/financial-exclusion/risk-model",
      linkLabel: "See the vulnerability model",
    },
    {
      n: "03",
      title: "Progress is checkable",
      body: (
        <>
          Every flag rests on a published NISR figure and a rule anyone can test across the{" "}
          <strong className="font-bold text-white">{levers}</strong> policy levers, so the next survey round shows whether
          inclusion, poverty and on-time support improved where action went — impact measured, not assumed.
        </>
      ),
      href: "/poverty-dynamics/trends",
      linkLabel: "See the trends over time",
    },
  ];

  return (
    <section className="border-y border-line bg-cyan-ink py-10 text-white sm:py-14" aria-labelledby="impact-heading">
      <div className="container-page">
        <p className="eyebrow text-white/75">The impact</p>
        <h2
          id="impact-heading"
          className="mt-3 max-w-4xl text-balance font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl"
        >
          What changes on the ground
        </h2>
        <p className="mt-4 max-w-3xl text-pretty text-[16px] leading-7 text-white/85 sm:text-[17px]">
          A statistic only matters if it changes a decision. IMBONIX turns NISR&apos;s figures into three concrete shifts — and
          keeps every one of them checkable.
        </p>

        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {outcomes.map((outcome) => (
            <li key={outcome.n} className="flex">
              <Link
                href={outcome.href}
                className="group flex h-full flex-col rounded-2xl bg-white/[0.06] p-6 ring-1 ring-white/15 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span aria-hidden="true" className="tabular font-display text-[13px] font-bold text-white/60">
                  {outcome.n}
                </span>
                <h3 className="mt-3 font-display text-[20px] font-bold tracking-[-0.01em]">{outcome.title}</h3>
                <p className="mt-2 text-pretty text-[14.5px] leading-6 text-white/85">{outcome.body}</p>
                <span className="mt-5 inline-flex items-center gap-1 pt-1 text-[13.5px] font-bold text-white">
                  {outcome.linkLabel}
                  <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <div className="mt-8">
          <Link
            href="/social-protection/intervention-planner"
            className="inline-flex h-12 items-center gap-1.5 rounded-full bg-white px-6 text-[15px] font-bold text-cyan-ink transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-cyan-ink"
          >
            Plan an intervention for a place
            <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
