import { TextCard } from "@/components/home/story-cards";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section";

export type WorkStep = { title: string; body: string; href: string; linkLabel: string };

/** How IMBONIX gets from published tables to decisions, as four numbered text cards, each with a page to go deeper. */
export function HowItWorks({ steps }: { steps: WorkStep[] }) {
  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="how-heading">
      <div className="container-page">
        <SectionHeader
          eyebrow="How it works"
          title={<span id="how-heading">From published tables to decisions, in the open</span>}
          intro="No figure is typed in by hand. Each one is transcribed from a named NISR table, rebuilt by a script that the automated checks rerun, and labelled with how far to trust it."
        />

        <ol className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title}>
              <Reveal delay={index * 0.06} className="h-full">
                <TextCard
                  eyebrow={`Step ${index + 1}`}
                  title={step.title}
                  body={step.body}
                  href={step.href}
                  linkLabel={step.linkLabel}
                  tone="paper"
                />
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
