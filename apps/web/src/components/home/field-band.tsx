/* eslint-disable @next/next/no-img-element -- documentary photos served as optimised JPGs, not icons to optimise */

/**
 * A short photographic band that grounds the figures in the people behind them: Rwandans managing money day to day, and
 * the survey and record work that turns that reality into published statistics. The photos are illustrative.
 */
const PHOTOS = [
  {
    src: "/photos/inclusion.jpg",
    alt: "Two women looking at savings records on a phone and in a handwritten notebook",
    caption: "Financial inclusion, up close — managing money and savings by phone and by hand.",
  },
  {
    src: "/photos/data-work.jpg",
    alt: "A team entering records into a database on a computer",
    caption: "From records to evidence — the survey and data work behind every figure.",
  },
];

export function FieldBand() {
  return (
    <section id="behind" className="scroll-mt-24 border-t border-line bg-paper py-16 sm:py-24" aria-labelledby="field-heading">
      <div className="container-page">
        <p className="eyebrow text-cyan-ink">Behind the figures</p>
        <h2
          id="field-heading"
          className="mt-3 max-w-3xl text-balance font-display text-3xl font-bold tracking-[-0.025em] text-ink sm:text-4xl"
        >
          Real households, real records
        </h2>
        <p className="mt-4 max-w-3xl text-pretty text-[16px] leading-7 text-muted sm:text-[17px] sm:leading-8">
          Every figure on IMBONIX stands for people — Rwandans saving, borrowing and managing money day to day, and the
          survey and record work that turns their reality into statistics anyone can check.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {PHOTOS.map((photo) => (
            <figure key={photo.src} className="overflow-hidden rounded-2xl bg-white ring-1 ring-line">
              <img src={photo.src} alt={photo.alt} loading="lazy" className="h-56 w-full object-cover sm:h-64" />
              <figcaption className="px-5 py-4 text-[14.5px] leading-6 text-ink/85">{photo.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
