import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { BuildingLibraryIcon, HomeIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

export type ChallengePart = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  area: string;
  value: string;
  valueLabel: string;
  body: string;
  source: string;
  href: string;
  cta: string;
};

/** The three groups the brief asks solutions to serve, and what IMBONIX gives each of them. */
const AUDIENCES = [
  {
    icon: HomeIcon,
    title: "Vulnerable households",
    body: "Shows where payments arrive late and formal finance is far, so support can reach them sooner.",
  },
  {
    icon: BuildingLibraryIcon,
    title: "Policymakers",
    body: "Seven policy levers, each flagged district by district by one figure and a rule anyone can check.",
  },
  {
    icon: UserGroupIcon,
    title: "Civil society",
    body: "Open figures with their sources, to follow programmes and speak up for the places left behind.",
  },
];

/**
 * The Track 2 brief in three parts (financial exclusion, poverty dynamics, social protection impact), each answered by
 * one published figure and a page to read more, then the three groups the brief asks solutions to serve.
 */
export function ChallengeSection({ parts }: { parts: ChallengePart[] }) {
  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="challenge-heading">
      <div className="container-page">
        <SectionHeader
          eyebrow="The Track 2 challenge"
          title={<span id="challenge-heading">Understand exclusion, poverty and social protection, then act</span>}
          intro="The NISR 2026 Big Data Hackathon asks teams to use data to understand financial exclusion, poverty dynamics and the impact of social protection programmes in Rwanda, with practical value for vulnerable households, policymakers and civil society. IMBONIX answers each part with NISR data."
        />

        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {parts.map((part, index) => (
            <li key={part.area}>
              <Reveal delay={index * 0.06} className="h-full">
                <article className="flex h-full flex-col rounded-3xl border border-line bg-white p-6 shadow-card">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-sun">
                      <part.icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h3 className="eyebrow text-royal">{part.area}</h3>
                  </div>
                  <p className="mt-5 font-display text-4xl font-bold tracking-[-0.03em] text-ink">{part.value}</p>
                  <p className="mt-1 text-[14px] leading-5 text-muted">{part.valueLabel}</p>
                  <p className="mt-4 flex-1 text-[14.5px] leading-6 text-ink/80">{part.body}</p>
                  <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-4">
                    <span className="text-[11.5px] leading-4 text-muted">{part.source}</span>
                    <Link
                      href={part.href}
                      className="group inline-flex shrink-0 items-center gap-1.5 rounded text-[14px] font-bold text-royal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal"
                    >
                      {part.cta}
                      <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>

        <div className="mt-12 rounded-3xl bg-paper p-6 sm:p-8">
          <h3 className="eyebrow text-royal">Built for</h3>
          <ul className="mt-5 grid gap-6 sm:grid-cols-3">
            {AUDIENCES.map((audience) => (
              <li key={audience.title} className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-royal ring-1 ring-line">
                  <audience.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-[16px] font-bold text-ink">{audience.title}</p>
                  <p className="mt-1 text-[13.5px] leading-6 text-muted">{audience.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
