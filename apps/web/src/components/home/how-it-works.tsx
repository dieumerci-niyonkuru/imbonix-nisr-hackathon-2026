import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

export type WorkStep = { title: string; body: string };

/** How IMBONIX gets from published tables to decisions, as four numbered steps, with a link to the full methods. */
export function HowItWorks({ steps }: { steps: WorkStep[] }) {
  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="how-heading">
      <div className="container-page">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            eyebrow="How it works"
            title={<span id="how-heading">From published tables to decisions, in the open</span>}
            intro="No figure is typed in by hand. Each one is transcribed from a named NISR table, rebuilt by a script that the automated checks rerun, and labelled with how far to trust it."
          />
          <Link
            href="/data"
            className="group inline-flex shrink-0 items-center gap-1.5 self-start rounded text-[15px] font-bold text-royal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal lg:self-end"
          >
            Read the methods
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title}>
              <Reveal delay={index * 0.06} className="h-full">
                <div className="flex h-full flex-col rounded-3xl border border-line bg-paper p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-royal font-display text-[15px] font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="mt-5 font-display text-lg font-bold text-ink">{step.title}</p>
                  <p className="mt-2 text-[14px] leading-6 text-muted">{step.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
