import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { ArrowRightIcon, ChartBarSquareIcon, CpuChipIcon, MapPinIcon, Squares2X2Icon } from "@heroicons/react/20/solid";

type Step = {
  verb: string;
  question: string;
  body: string;
  href: string;
  linkLabel: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

/** The four things the platform does with NISR data, in order, each opening the page that does it. */
const STEPS: Step[] = [
  {
    verb: "Measure",
    question: "What are the numbers?",
    body: "Financial inclusion, poverty, nutrition, work and social protection, for all 30 districts and 416 sectors, every figure sourced and labelled for trust.",
    href: "/data/key-figures",
    linkLabel: "See the key figures",
    icon: ChartBarSquareIcon,
  },
  {
    verb: "Explain",
    question: "Where do needs overlap?",
    body: "Which needs rise and fall together across districts, and where poverty and poor access to finance meet, so you can see what lies behind the totals, not just the totals.",
    href: "/poverty-dynamics/overlapping-needs",
    linkLabel: "See where needs overlap",
    icon: Squares2X2Icon,
  },
  {
    verb: "Predict",
    question: "Who is most at risk?",
    body: "A clear model of which households are most at risk financially — most likely to struggle when money runs short — built from the NISR figures, showing the reasons behind each result and its limits, in the open.",
    href: "/financial-exclusion/risk-model",
    linkLabel: "See the vulnerability model",
    icon: CpuChipIcon,
  },
  {
    verb: "Prioritise",
    question: "Where should action go first?",
    body: "Districts flagged by transparent rules, targets you can test as scenarios, and an intervention planner that pairs a problem, a group and a place with the evidence.",
    href: "/social-protection/priority-districts",
    linkLabel: "See the priority areas",
    icon: MapPinIcon,
  },
];

/**
 * How the platform turns NISR data into decisions, in four steps, as the Track 2 brief frames it: measure, explain,
 * predict, prioritise. Each step opens the page that does it. Named for the people who act on it.
 */
export function PlatformApproach() {
  return (
    <section className="border-y border-line bg-paper py-16 sm:py-24" aria-labelledby="approach-heading">
      <div className="container-page">
        <p className="eyebrow text-cyan-ink">A decision-support platform</p>
        <h2
          id="approach-heading"
          className="mt-3 max-w-4xl text-balance font-display text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl"
        >
          From data to decisions: measure, explain, predict, prioritise
        </h2>
        <p className="mt-4 max-w-3xl text-pretty text-[16px] leading-7 text-muted sm:text-[17px]">
          IMBONIX brings NISR&apos;s household, financial access and social protection data together so policymakers, development
          partners and financial inclusion teams can target action, not just read statistics.
        </p>

        <ol className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.verb} className="flex">
                <Link
                  href={step.href}
                  className="group flex h-full flex-col rounded-2xl border border-t-4 border-line border-t-cyan bg-white p-6 transition-shadow hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-soft text-cyan-ink ring-1 ring-cyan/30">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span aria-hidden="true" className="tabular font-display text-[13px] font-bold text-muted">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-[20px] font-bold tracking-[-0.01em] text-ink">{step.verb}</h3>
                  <p className="mt-0.5 text-[13.5px] font-semibold text-cyan-ink">{step.question}</p>
                  <p className="mt-2 text-pretty text-[14px] leading-6 text-muted">{step.body}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 pt-1 text-[13.5px] font-bold text-ink group-hover:text-cyan-ink">
                    {step.linkLabel}
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
