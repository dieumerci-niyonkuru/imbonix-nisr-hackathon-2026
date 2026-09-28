import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { PlaceFinder, type FinderDistrict } from "@/components/district/place-finder";
import { RwandaMap } from "@/components/map/rwanda-map";
import { DISTRICTS } from "@/lib/data";
import { RAMPS, WHITE } from "@/lib/palette";

/** One count of administrative units, as a tile. */
export type UnitCount = { value: number; label: string };

const OUTLINE_FILLS = Object.fromEntries(DISTRICTS.map((district) => [district.slug, WHITE]));

/**
 * The way in by place, set like the government's page on local administration: the outline of Rwanda's districts
 * beside the count of each level of government, then one search box for any district, sector, cell or village.
 */
export function PlaceSection({
  units,
  districts,
  counts,
}: {
  units: UnitCount[];
  districts: FinderDistrict[];
  counts: { sectors: number; cells: number; villages: number };
}) {
  return (
    <section className="border-t border-line bg-paper py-16 sm:py-24" aria-labelledby="place-heading">
      <div className="container-page grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="mx-auto w-full max-w-md lg:max-w-none">
          <RwandaMap fills={OUTLINE_FILLS} stroke={RAMPS.steel[1]} title="Outline of Rwanda's 30 districts" />
        </div>
        <div>
          <p className="eyebrow text-cyan-ink">Start with a place</p>
          <h2
            id="place-heading"
            className="mt-3 text-balance font-display text-3xl font-bold tracking-[-0.025em] text-ink sm:text-4xl"
          >
            Find any place in Rwanda, down to the village
          </h2>
          <dl className="mt-8 grid grid-cols-2 border-l border-t border-line bg-white sm:grid-cols-3">
            {units.map((unit) => (
              <div key={unit.label} className="flex flex-col items-center border-b border-r border-line px-3 py-6 text-center">
                <dt className="order-2 mt-2 text-[14.5px] leading-5 text-ink">{unit.label}</dt>
                <dd className="order-1 font-display text-[30px] font-bold leading-none tracking-[-0.02em] text-cyan-ink sm:text-[34px]">
                  {unit.value.toLocaleString("en-US")}
                </dd>
              </div>
            ))}
          </dl>
          <PlaceFinder className="mt-8" districts={districts} counts={counts} />
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
            <Link
              href="/districts"
              className="group inline-flex items-center gap-1.5 rounded text-[15px] font-bold text-ink underline-offset-4 hover:text-cyan-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
            >
              Browse all 30 districts
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link
              href="/map"
              className="group inline-flex items-center gap-1.5 rounded text-[15px] font-bold text-ink underline-offset-4 hover:text-cyan-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
            >
              Compare the districts on the map
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
