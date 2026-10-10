import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { ReadMore } from "@/components/ui/read-more";
import { SectionHeader } from "@/components/ui/section";

/** One step: its name, one sentence, and optionally the full explanation shown behind Read more. */
export type JourneyStep = { name: string; body: string; details?: ReactNode };

/**
 * The method in brief, as a journey from data to impact: five numbered steps joined by a line, and a link to the
 * full methods page.
 */
export function MethodologyJourney({ steps }: { steps: JourneyStep[] }) {
  return (
    <section className="bg-white py-12 sm:py-20" aria-labelledby="journey-heading">
      <div className="container-page">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            eyebrow="Methodology"
            title={<span id="journey-heading">From data to impact, in five steps</span>}
            intro="Nothing is hidden: every figure names its table, and every step can be checked against its published source."
          />
          <Link
            href="/data"
            className="group inline-flex shrink-0 items-center gap-1.5 self-start rounded text-[15px] font-bold text-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink lg:self-end"
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
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-cyan-ink bg-white font-display text-[17px] font-bold text-cyan-ink">
                {index + 1}
              </span>
              <p className="mt-5 font-display text-[22px] font-bold tracking-[-0.01em] text-ink">{step.name}</p>
              <p className="mt-2 text-pretty text-[15px] leading-7 text-muted">{step.body}</p>
              {step.details && (
                <ReadMore title={`Step ${index + 1}: ${step.name}`} className="mt-3">
                  {step.details}
                </ReadMore>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
