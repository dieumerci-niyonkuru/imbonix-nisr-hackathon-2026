import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { ReadMore } from "@/components/ui/read-more";

/** One of the three tests a useful answer has to meet, with the figure that shows IMBONIX meets it. */
export type Requirement = {
  name: string;
  figure: string;
  body: string;
  /** The full explanation, shown in a Read more dialog. */
  details: ReactNode;
  href: string;
  linkLabel: string;
};

/**
 * How IMBONIX answers the challenge: the three tests a useful answer has to meet (a real gap, evidence from NISR data,
 * practical impact) as plain ruled tiles, each with the figure that shows IMBONIX meets it, a Read more dialog with
 * the full explanation and sources, and a link to the page that goes further.
 */
export function ChallengeStatement({ requirements }: { requirements: Requirement[] }) {
  return (
    <section className="border-t border-line bg-white py-16 sm:py-24" aria-labelledby="challenge-statement-heading">
      <div className="container-page">
        <p className="eyebrow text-cyan-ink">Three tests</p>
        <h2
          id="challenge-statement-heading"
          className="mt-3 max-w-3xl text-balance font-display text-3xl font-bold tracking-[-0.025em] text-ink sm:text-4xl"
        >
          How IMBONIX answers the challenge
        </h2>
        <p className="mt-4 max-w-3xl text-pretty text-[16px] leading-7 text-muted sm:text-[17px] sm:leading-8">
          A useful answer has to show a real gap, rest on NISR evidence and lead to something vulnerable households, policymakers
          and civil society can act on.
        </p>

        <ol className="mt-10 grid border-l border-t border-line md:grid-cols-3">
          {requirements.map((requirement, index) => (
            <li key={requirement.name} className="flex flex-col border-b border-r border-line px-7 py-8 sm:px-8 sm:py-10">
              <p className="text-[14px] font-semibold text-muted">
                {index + 1}. {requirement.name}
              </p>
              <p className="mt-3 text-balance font-display text-[30px] font-bold leading-[1.1] tracking-[-0.025em] text-cyan-ink sm:text-[34px]">
                {requirement.figure}
              </p>
              <p className="mt-4 text-pretty text-[16px] leading-7 text-ink/85">{requirement.body}</p>
              <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-2 pt-6">
                <ReadMore title={`${requirement.name}: ${requirement.figure}`}>{requirement.details}</ReadMore>
                <Link
                  href={requirement.href}
                  className="group inline-flex items-center gap-1 rounded text-[14px] font-bold text-ink underline-offset-4 hover:text-cyan-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
                >
                  {requirement.linkLabel}
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
