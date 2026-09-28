/** What IMBONIX adds, each in a short heading and one sentence. */
export type Contribution = { title: string; body: string };

/**
 * Why IMBONIX: a short, serious account of what the platform contributes. The problem it solves on the left, and what
 * it adds on the right, as three plain statements rather than a feature grid.
 */
export function WhySection({ contributions }: { contributions: Contribution[] }) {
  return (
    <section className="bg-paper py-16 sm:py-24" aria-labelledby="why-heading">
      <div className="container-page grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow text-royal">Why IMBONIX</p>
          <h2
            id="why-heading"
            className="mt-3 text-balance font-display text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl"
          >
            One place to see who is left behind, where, and what can be done
          </h2>
          <p className="mt-6 text-pretty text-[16px] leading-8 text-ink/80 sm:text-[17px]">
            Rwanda publishes rich statistics on poverty, finance, nutrition and social protection, but in separate surveys,
            reports and years. Reading them together, district by district, takes days, and it is easy to compare figures that do
            not measure the same thing.
          </p>
          <p className="mt-4 text-pretty text-[16px] leading-8 text-ink/80 sm:text-[17px]">
            IMBONIX does that work in the open, so that a policymaker, a researcher or a community organisation can start from the
            same evidence.
          </p>
        </div>

        <dl className="grid content-start gap-0 border-t border-line">
          {contributions.map((contribution) => (
            <div key={contribution.title} className="border-b border-line py-6">
              <dt className="font-display text-[20px] font-bold tracking-[-0.01em] text-ink">{contribution.title}</dt>
              <dd className="mt-2 text-pretty text-[15.5px] leading-7 text-muted">{contribution.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
