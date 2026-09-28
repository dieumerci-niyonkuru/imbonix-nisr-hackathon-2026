import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { SectionHeader } from "@/components/ui/section";

export type JourneyStep = { name: string; body: string };

/**
 * The method in brief, as a journey from data to impact: five numbered steps joined by a line, and a link to the
 * full methods page.
 */
export function MethodologyJourney({ steps }: { steps: JourneyStep[] }) {
  return (
    <section className="bg-white py-16 sm:py-24" aria-labelledby="journey-heading">
      <div className="container-page">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            eyebrow="Methodology"
            title={<span id="journey-heading">From data to impact, in five steps</span>}
            intro="No figure is typed in by hand, and nothing is hidden: every step can be checked against its published source."
          />
          <Link
            href="/data"
            className="group inline-flex shrink-0 items-center gap-1.5 self-start rounded text-[15px] font-bold text-royal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal lg:self-end"
          >
            Read the full methodology
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        <ol className="mt-12 grid gap-8 md:grid-cols-5 md:gap-6">
          {steps.map((step, index) => (
            <li key={step.name} className="relative">
              {/* The line joining each step to the next, on wide screens only. */}
              {index < steps.length - 1 && (
                <span aria-hidden="true" className="absolute left-14 right-0 top-6 hidden h-px bg-line md:block" />
              )}
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-royal bg-white font-display text-[17px] font-bold text-royal">
                {index + 1}
              </span>
              <p className="mt-5 font-display text-[22px] font-bold tracking-[-0.01em] text-ink">{step.name}</p>
              <p className="mt-2 text-pretty text-[15px] leading-7 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
