import type { Metadata } from "next";
import Link from "next/link";
import { PriorityExplorer, PriorityMatrix } from "@/components/priorities/priority-explorer";
import { Callout, PageHero, SectionHeader } from "@/components/ui/section";
import { allFlags, LEVERS } from "@/lib/priorities";

export const metadata: Metadata = {
  title: "Intervention priorities",
  description: "Where NISR evidence points for seven policy levers, district by district, with every rule stated.",
};

export default function PrioritiesPage() {
  const districts = allFlags();
  const counts = LEVERS.map((l) => ({ lever: l, count: districts.filter((d) => d.flags.some((f) => f.lever === l.id)).length }));
  const most = districts.filter((d) => d.flags.length === districts[0].flags.length);

  return (
    <>
      <PageHero
        eyebrow="Intervention priorities"
        title="Where the evidence points, lever by lever"
        intro="Seven policy levers, each tied to one published indicator and a stated rule. A district is flagged for a lever when its NISR evidence crosses that rule. The flags show where a lever deserves a closer look; they do not decide budgets or who is eligible."
      />

      <section className="container-page py-10" aria-labelledby="lever-overview">
        <h2 id="lever-overview" className="sr-only">
          The seven levers
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {counts.map(({ lever, count }) => (
            <div key={lever.id} className="relative overflow-hidden rounded-2xl border border-line bg-white p-5">
              <span className="absolute inset-x-0 top-0 h-1" style={{ background: lever.color }} aria-hidden="true" />
              <p className="font-display text-[15px] font-semibold text-ink">{lever.title}</p>
              <p className="mt-1 text-[12.5px] leading-5 text-muted">{lever.question}</p>
              <p className="mt-3 font-display text-3xl font-semibold text-ink">{count}</p>
              <p className="text-[12px] text-muted">districts flagged</p>
            </div>
          ))}
          <div className="rounded-2xl border border-sun/60 bg-sun-soft p-5">
            <p className="font-display text-[15px] font-semibold text-ink">Most levers flagged</p>
            <p className="mt-1 text-[12.5px] leading-5 text-muted">
              {districts[0].flags.length} of 7 levers in{" "}
              {most.map((d, i) => (
                <span key={d.slug}>
                  <Link href={`/districts/${d.slug}`} className="font-semibold text-ink hover:text-royal">
                    {d.name}
                  </Link>
                  {i < most.length - 1 ? ", " : ""}
                </span>
              ))}
              .
            </p>
          </div>
        </div>
      </section>

      <section className="container-page pb-14" aria-labelledby="explorer-heading">
        <SectionHeader
          eyebrow="Explore a lever"
          title={<span id="explorer-heading">Which districts, and on what evidence?</span>}
          intro="Choose a lever to see the districts it flags, ordered by the strength of the evidence, and the programmes that already exist for it."
        />
        <div className="mt-8">
          <PriorityExplorer levers={LEVERS} districts={districts} />
        </div>
      </section>

      <section className="border-y border-line bg-white py-14" aria-labelledby="matrix-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="All districts, all levers"
            title={<span id="matrix-heading">The full picture in one table</span>}
            intro="Hover a tick to see the evidence behind it. Districts flagged for several levers may need a coordinated response across ministries."
          />
          <div className="mt-8">
            <PriorityMatrix levers={LEVERS} districts={districts} />
          </div>
        </div>
      </section>

      <section className="container-page grid gap-4 py-14 md:grid-cols-3">
        <Callout title="How the flags are made">
          Six levers flag the 10 most affected districts on one indicator (11 where values tie). &quot;Deepen use&quot; flags
          districts poorer than the national rate where fewer adults than nationally lack formal finance. Every rule is shown
          above and in the source code.
        </Callout>
        <Callout title="What they are not">
          Not a ranking of need, a budget formula or an eligibility tool, and not evidence that a programme works. Household
          targeting in Rwanda runs through the Imibereho social registry.
        </Callout>
        <Callout title="Next step">
          With household microdata, flags can move from district averages to the groups within districts that each lever should
          reach, with uncertainty attached.
        </Callout>
      </section>
    </>
  );
}
