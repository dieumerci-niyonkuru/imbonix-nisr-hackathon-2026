import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { MapLegend } from "@/components/map/map-legend";
import { RwandaMap } from "@/components/map/rwanda-map";
import { DISTRICTS, PROVINCE_LABEL, valueOf, valuesFor } from "@/lib/data";
import { formatValue } from "@/lib/format";
import { meta } from "@/lib/indicators";
import { scaleFor, textOn } from "@/lib/scales";

const RANKED_COUNT = 5;
const HEADLINE_COUNT = 10;

/**
 * Where poverty is deepest: the district map of EICV7 poverty rates beside the poorest districts, ranked. The headline
 * is worked out from the data, so it stays true if the figures change.
 */
export function PovertyMapSection() {
  const poverty = meta("eicv7_poverty_rate");
  const scale = scaleFor(poverty, valuesFor(poverty.id));
  const fills = Object.fromEntries(DISTRICTS.map((district) => [district.slug, scale.color(valueOf(district, poverty.id))]));
  const ranked = DISTRICTS.filter((district) => valueOf(district, poverty.id) !== undefined).sort(
    (first, second) => valueOf(second, poverty.id)! - valueOf(first, poverty.id)!,
  );
  const poorestProvinces = [...new Set(ranked.slice(0, HEADLINE_COUNT).map((district) => district.province))];
  const provinceNames = poorestProvinces.map((province) => PROVINCE_LABEL[province].replace(" Province", ""));
  const headline =
    provinceNames.length === 1
      ? `The ${HEADLINE_COUNT} poorest districts are all in the ${provinceNames[0]} Province`
      : provinceNames.length === 2
        ? `The ${HEADLINE_COUNT} poorest districts are all in the ${provinceNames[0]} and ${provinceNames[1]} provinces`
        : "Where poverty is deepest";
  const highest = valueOf(ranked[0], poverty.id)!;

  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="poverty-map-heading">
      <div className="container-page grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
        <figure className="rounded-3xl border border-line bg-white p-5 sm:p-7">
          <figcaption>
            <p className="font-display text-lg font-bold tracking-[-0.01em] text-ink">Poverty rate by district</p>
            <p className="mt-0.5 text-[13px] text-muted">EICV7 2023/24, share of people living in poverty</p>
          </figcaption>
          <div className="mx-auto mt-4 max-w-lg">
            <RwandaMap fills={fills} title="Poverty rate by district, EICV7 2023/24" />
          </div>
          <div className="mt-4">
            <MapLegend indicator={poverty} scale={scale} />
          </div>
          <p className="mt-4 border-t border-line pt-3 text-[12px] text-muted">Source: NISR, EICV7 Main Indicators</p>
        </figure>

        <div>
          <p className="eyebrow text-royal">Where poverty is deepest</p>
          <h2
            id="poverty-map-heading"
            className="mt-3 text-balance font-display text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl"
          >
            {headline}
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-muted">
            Poverty is not spread evenly: in {ranked[0].name} it reaches {formatValue(poverty, highest)}, against{" "}
            {formatValue(poverty, valueOf(ranked[ranked.length - 1], poverty.id))} in {ranked[ranked.length - 1].name}. These are
            the {RANKED_COUNT} poorest districts.
          </p>
          <ol className="mt-6 space-y-2.5">
            {ranked.slice(0, RANKED_COUNT).map((district, index) => {
              const value = valueOf(district, poverty.id)!;
              const fill = scale.color(value);
              return (
                <li key={district.slug}>
                  <Link
                    href={`/districts/${district.slug}`}
                    className="group grid grid-cols-[1.75rem_minmax(0,7.5rem)_minmax(0,1fr)] items-center gap-3 rounded-xl bg-white px-3 py-2.5 ring-1 ring-line transition-colors hover:ring-royal/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal"
                  >
                    <span className="tabular text-[13px] font-bold text-muted">{index + 1}</span>
                    <span className="truncate text-[14.5px] font-semibold text-ink group-hover:text-royal">{district.name}</span>
                    <span className="relative h-6 overflow-hidden rounded-md bg-mist">
                      <span
                        className="absolute inset-y-0 left-0 flex items-center justify-end rounded-md pr-2 text-[12px] font-bold"
                        style={{ width: `${(value / highest) * 100}%`, background: fill, color: textOn(fill) }}
                      >
                        {formatValue(poverty, value)}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
            <Link
              href="/map"
              className="group inline-flex items-center gap-1.5 rounded text-[15px] font-bold text-royal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal"
            >
              Open the district map
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link
              href="/districts"
              className="group inline-flex items-center gap-1.5 rounded text-[15px] font-bold text-royal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal"
            >
              Compare all {DISTRICTS.length} districts
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
