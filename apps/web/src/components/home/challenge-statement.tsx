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
 * The challenge as an editorial statement: what has to be understood, in large type, then the three tests a useful
 * answer has to meet (a real gap, evidence from NISR data, practical impact) as cards, each with its figure, a Read
 * more dialog with the full explanation and sources, and a link to the page that goes further.
 */
export function ChallengeStatement({ requirements }: { requirements: Requirement[] }) {
  return (
    <section className="bg-white py-16 sm:py-24" aria-labelledby="challenge-statement-heading">
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
          <div>
            <p className="eyebrow text-royal">The challenge</p>
            <h2
              id="challenge-statement-heading"
              className="mt-3 text-balance font-display text-2xl font-bold tracking-[-0.02em] text-ink sm:text-3xl"
            >
              Financial inclusion and poverty reduction
            </h2>
          </div>
          <div>
            <p className="text-balance font-display text-[26px] font-semibold leading-[1.25] tracking-[-0.02em] text-ink sm:text-[34px]">
              Use data to understand financial exclusion, poverty dynamics and the impact of social protection programmes in
              Rwanda.
            </p>
            <p className="mt-5 max-w-2xl text-pretty text-[16px] leading-7 text-muted sm:text-[17px] sm:leading-8">
              A useful answer has to meet three tests: show a real gap, rest on NISR evidence, and lead to something people can
              act on. This is how IMBONIX meets each one.
            </p>
          </div>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {requirements.map((requirement, index) => (
            <li key={requirement.name} className="flex flex-col rounded-xl border border-line bg-paper p-7 sm:p-8">
              <p className="eyebrow text-royal">
                {index + 1}. {requirement.name}
              </p>
              <p className="mt-3 text-balance font-display text-[30px] font-bold leading-[1.1] tracking-[-0.025em] text-ink sm:text-[34px]">
                {requirement.figure}
              </p>
              <p className="mt-4 text-pretty text-[16px] leading-7 text-ink/80">{requirement.body}</p>
              <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-5">
                <ReadMore title={`${requirement.name}: ${requirement.figure}`}>{requirement.details}</ReadMore>
                <Link
                  href={requirement.href}
                  className="group inline-flex items-center gap-1 rounded text-[14px] font-bold text-royal underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal"
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
