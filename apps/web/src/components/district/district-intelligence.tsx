import Link from "next/link";
import { ArrowRightIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { ReadMore, ReadMoreSection } from "@/components/ui/read-more";
import { SOURCES, type District } from "@/lib/data";
import { actionsFor, limitationsFor, priorityFor, stepsFor, type Need, type Priority } from "@/lib/district-intelligence";
import { cn } from "@/lib/utils";

/** What a reader should know about each step's measures, beyond the figures. */
const STEP_NOTES: Record<string, string> = {
  access:
    "Formal inclusion counts adults using a bank, a SACCO, mobile money or another formal service. Smartphones matter because most digital finance and payments now run on them.",
  vulnerability: "Child stunting (DHS 2025) and natural hazards (CFSVA 2024) are the two measures of vulnerability.",
  protection:
    "VUP coverage and payment timeliness are not published by district, so health insurance cover sets the level. Older people and persons with disabilities are two groups Direct Support serves: their share shows where its help may be needed most (Census 2022).",
};

const NEED_STYLE: Record<Need, string> = {
  high: "bg-navy-900 text-white",
  moderate: "bg-cyan-soft text-cyan-ink ring-1 ring-inset ring-cyan/40",
  low: "bg-mist text-ink",
};

const PRIORITY_STYLE: Record<Priority["level"], string> = {
  High: "bg-navy-900 text-white",
  Moderate: "bg-cyan-soft text-cyan-ink ring-1 ring-inset ring-cyan/50",
  Lower: "bg-mist text-ink",
};

/** A district's priority level as a badge, for its page and the district directory. */
export function PriorityBadge({ priority, size = "sm" }: { priority: Priority; size?: "sm" | "lg" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-bold",
        size === "lg" ? "px-4 py-2 text-[14px]" : "px-2.5 py-1 text-[11.5px]",
        PRIORITY_STYLE[priority.level],
      )}
      title="Priority under the IMBONIX rule: the 4 core dimensions on which the district is among the 10 most affected"
    >
      {priority.level} priority
    </span>
  );
}

/**
 * District intelligence: how the district compares with the other 29 on financial access, poverty, vulnerability
 * and social protection, the priority that follows, the policy levers the evidence points to, and what the evidence
 * cannot say. Read left to right, then down.
 */
export function DistrictIntelligence({ district }: { district: District }) {
  const steps = stepsFor(district);
  const priority = priorityFor(district);
  const actions = actionsFor(district);
  const limitations = limitationsFor(district);

  return (
    <section className="border-b border-line bg-white py-12 sm:py-16" aria-labelledby="intelligence-heading">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            <p className="eyebrow text-royal">District intelligence</p>
            <h2
              id="intelligence-heading"
              className="mt-2 text-balance font-display text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl"
            >
              From evidence to action in {district.name}
            </h2>
            <p className="mt-3 text-pretty text-[15.5px] leading-7 text-muted">
              Read left to right: how {district.name} compares with the other 29 districts on financial access, poverty,
              vulnerability and social protection, the priority that follows, and the options the evidence points to.
            </p>
          </div>
          <PriorityBadge priority={priority} size="lg" />
        </div>

        <ol className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => {
            const [main, ...others] = step.readings;
            return (
              <li key={step.id} className="relative">
                <article className="flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-card">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-bold text-royal">
                      {index + 1}. {step.title}
                    </p>
                    <span className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-bold", NEED_STYLE[step.need])}>
                      {step.level}
                    </span>
                  </div>
                  {main && (
                    <div className="mt-4">
                      <p className="font-display text-3xl font-bold tracking-[-0.02em] text-ink">{main.value}</p>
                      <p className="mt-0.5 text-[13.5px] leading-5 text-ink/80">{main.label}</p>
                      <p className="mt-1 text-[12.5px] text-muted">
                        {main.comparison}
                        {main.rank ? `, rank ${main.rank.rank} of ${main.rank.of}` : ""}
                      </p>
                    </div>
                  )}
                  {others.map((other) => (
                    <p key={other.indicatorId} className="mt-3 border-t border-line pt-3 text-[13px] leading-5 text-ink/80">
                      <span className="font-semibold text-ink">{other.value}</span> {other.label.toLowerCase()}
                      <span className="text-muted">
                        {" "}
                        ({other.comparison}
                        {other.rank ? `, rank ${other.rank.rank} of ${other.rank.of}` : ""})
                      </span>
                    </p>
                  ))}
                  <p className="mt-auto text-pretty pt-4 text-[13.5px] font-semibold leading-5 text-ink">{step.summary}</p>
                  <div className="mt-4 border-t border-line pt-3">
                    <ReadMore
                      title={`${step.title} in ${district.name}`}
                      subtitle={`Level: ${step.level.toLowerCase()}, compared with the other 29 districts`}
                    >
                      {step.readings.map((item) => {
                        const source = SOURCES[item.indicatorId];
                        return (
                          <ReadMoreSection key={item.indicatorId} title={item.label}>
                            <p>
                              <span className="font-semibold text-ink">{item.value}</span> in {district.name}, {item.comparison}
                              {item.rank ? `, rank ${item.rank.rank} of ${item.rank.of} (1 is the most affected)` : ""}.
                            </p>
                            {source && (
                              <p className="text-[13.5px] text-muted">
                                Measure: {source.label}. Source: {source.source}, {source.year}
                                {source.table ? `, ${source.table}` : ""}.
                              </p>
                            )}
                          </ReadMoreSection>
                        );
                      })}
                      <ReadMoreSection title="How the level is set">
                        <p>
                          The 30 districts are ranked on each measure, 1 being the most affected. The 10 most affected are the
                          high need third, the next 10 the middle third and the last 10 the lowest need.
                          {step.readings.length > 1 ? " With two measures, the step takes the level of the weaker one." : ""}
                        </p>
                        {STEP_NOTES[step.id] && <p>{STEP_NOTES[step.id]}</p>}
                      </ReadMoreSection>
                    </ReadMore>
                  </div>
                </article>
                {index < steps.length - 1 && (
                  <ChevronRightIcon
                    className="absolute -right-4 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 text-royal xl:block"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-[12.5px] text-muted">
          Levels compare {district.name} with the other 29 districts: the 10 most affected are the high need third. Rank 1 is the
          most affected.
        </p>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="rounded-2xl bg-navy-900 p-6 text-white sm:p-7">
            <p className="eyebrow text-cyan">Why this priority</p>
            <p className="mt-3 font-display text-3xl font-bold">{priority.level} priority</p>
            <p className="mt-3 text-pretty text-[15px] leading-7 text-white/85">{priority.reason}</p>
            <p className="mt-5 border-t border-white/15 pt-4 text-[13px] leading-6 text-white/70">
              The rule: high when a district is among the 10 most affected on at least 2 of the 4 core dimensions (poverty,
              financial access, child stunting, natural hazards), moderate on 1, lower on none.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-white p-6 sm:p-7">
            <p className="eyebrow text-royal">What decision makers can consider</p>
            {actions.length ? (
              <ul className="mt-4 divide-y divide-line">
                {actions.map((action) => (
                  <li key={action.lever.id} className="py-4 first:pt-0 last:pb-0">
                    <p className="font-display text-[17px] font-bold text-ink">{action.lever.title}</p>
                    <p className="mt-1 text-[13.5px] leading-5 text-ink/80">
                      <span className="font-semibold text-ink">Evidence: </span>
                      {action.evidence}
                    </p>
                    <ReadMore
                      title={action.lever.title}
                      subtitle={`Why this lever is flagged for ${district.name}`}
                      className="mt-2"
                    >
                      <ReadMoreSection title="The question">
                        <p>{action.lever.question}</p>
                      </ReadMoreSection>
                      <ReadMoreSection title="The rule">
                        <p>{action.lever.rule}</p>
                      </ReadMoreSection>
                      <ReadMoreSection title={`The evidence for ${district.name}`}>
                        <p>{action.evidence}</p>
                      </ReadMoreSection>
                      <ReadMoreSection title="Programmes that already exist">
                        <p>{action.lever.programmes}</p>
                      </ReadMoreSection>
                      <ReadMoreSection title="What the flag does not mean">
                        <p>
                          It points to where the evidence suggests this lever deserves attention. It is not a budget allocation,
                          an eligibility decision or a prediction that the programme will work in {district.name}.
                        </p>
                      </ReadMoreSection>
                    </ReadMore>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-[14.5px] leading-6 text-ink/80">
                No policy lever flags {district.name}: it is not among the 10 most affected districts on any lever&apos;s measure.
                Keep monitoring, and look at its sectors below, where needs can be higher than the average.
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <p className="text-[12.5px] text-muted">Options the evidence points to, not proven effects.</p>
              <Link
                href={`/interventions?place=district:${district.slug}`}
                className="group inline-flex items-center gap-1.5 rounded text-[14px] font-bold text-royal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal"
              >
                Plan an intervention in {district.name}
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-paper p-6 sm:p-7">
          <p className="eyebrow text-royal">What the evidence cannot tell us</p>
          <ul className="mt-3 grid gap-x-8 gap-y-2 text-[14px] leading-6 text-ink/80 md:grid-cols-2">
            {limitations.map((limitation) => (
              <li key={limitation} className="border-l-2 border-cyan pl-3">
                {limitation}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
