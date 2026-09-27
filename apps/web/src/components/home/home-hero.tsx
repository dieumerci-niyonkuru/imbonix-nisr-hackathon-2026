import Link from "next/link";
import { ArrowRightIcon, CheckBadgeIcon } from "@heroicons/react/20/solid";
import { MapLegend } from "@/components/map/map-legend";
import { RwandaMap } from "@/components/map/rwanda-map";
import { HeroRings } from "@/components/ui/section";
import { StatTile } from "@/components/ui/stat-tile";
import { DISTRICTS, valueOf, valuesFor } from "@/lib/data";
import { formatValue } from "@/lib/format";
import { meta } from "@/lib/indicators";
import { scaleFor } from "@/lib/scales";

export type HeroFigure = { value: string; label: string; source: string; status?: string; accent: string };

const PRIMARY_BUTTON =
  "inline-flex h-12 items-center gap-2 rounded-xl bg-cyan px-5 text-[15px] font-bold text-navy-900 transition-colors hover:bg-cyan-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900";
const SECONDARY_BUTTON =
  "inline-flex h-12 items-center gap-2 rounded-xl px-5 text-[15px] font-bold text-white ring-1 ring-white/30 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";

/**
 * The opening of the homepage: the Track 2 question and IMBONIX's answer, a district poverty map drawn from the
 * published EICV7 rates, and four key figures, each with its source.
 */
export function HomeHero({
  figures,
  districtCount,
  sectorCount,
}: {
  figures: HeroFigure[];
  districtCount: number;
  sectorCount: number;
}) {
  const poverty = meta("eicv7_poverty_rate");
  const scale = scaleFor(poverty, valuesFor(poverty.id));
  const fills = Object.fromEntries(DISTRICTS.map((district) => [district.slug, scale.color(valueOf(district, poverty.id))]));
  const ranked = DISTRICTS.filter((district) => valueOf(district, poverty.id) !== undefined).sort(
    (first, second) => valueOf(second, poverty.id)! - valueOf(first, poverty.id)!,
  );
  const poorest = ranked[0];
  const leastPoor = ranked[ranked.length - 1];

  return (
    <section className="relative overflow-hidden bg-navy-900 text-white">
      <HeroRings className="-right-40 -top-48 text-white/10" />
      <div className="container-page relative grid items-center gap-12 pt-12 sm:pt-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:pt-20">
        <div>
          <p className="eyebrow text-cyan">NISR Big Data Hackathon 2026 · Track 2</p>
          <h1 className="mt-4 text-balance font-display text-4xl font-bold leading-[1.05] tracking-[-0.035em] sm:text-5xl xl:text-[3.5rem]">
            Almost every adult is included. Few are financially healthy.
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
            IMBONIX brings NISR&apos;s published statistics together for all {districtCount} districts and {sectorCount} sectors,
            to show where financial exclusion, poverty and gaps in social protection overlap, and which policy levers the evidence
            points to.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {/* A plain anchor: the homepage tabs follow the hash, so this opens the first part of the challenge below. */}
            <a href="#exclusion" className={PRIMARY_BUTTON}>
              Explore the evidence
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link href="/map" className={SECONDARY_BUTTON}>
              Open the resilience map
            </Link>
          </div>
          <ul className="mt-8 grid gap-2.5 text-[13.5px] text-white/75 sm:grid-cols-2">
            <li className="flex items-start gap-2">
              <CheckBadgeIcon className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
              Every figure names its NISR source and table
            </li>
            <li className="flex items-start gap-2">
              <CheckBadgeIcon className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
              Independent project, not an official NISR product
            </li>
          </ul>
        </div>

        <figure className="rounded-3xl bg-white p-5 text-ink shadow-lift sm:p-6">
          <figcaption className="flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-lg font-bold tracking-[-0.01em]">Poverty rate by district</p>
              <p className="mt-0.5 text-[13px] text-muted">EICV7 2023/24, share of people living in poverty</p>
            </div>
            <Link
              href="/map"
              className="inline-flex shrink-0 items-center gap-1 rounded text-[13px] font-bold text-royal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal"
            >
              Open map
              <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </figcaption>
          <div className="mx-auto mt-4 max-w-md">
            <RwandaMap fills={fills} title="Poverty rate by district, EICV7 2023/24" />
          </div>
          <div className="mt-4">
            <MapLegend indicator={poverty} scale={scale} />
          </div>
          <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-line pt-3 text-[12.5px] leading-5">
            <p className="text-ink/80">
              Highest: <strong className="font-semibold text-ink">{poorest.name}</strong>{" "}
              {formatValue(poverty, valueOf(poorest, poverty.id))} · Lowest:{" "}
              <strong className="font-semibold text-ink">{leastPoor.name}</strong>{" "}
              {formatValue(poverty, valueOf(leastPoor, poverty.id))}
            </p>
            <p className="text-muted">Source: NISR, EICV7 Main Indicators</p>
          </div>
        </figure>
      </div>

      <div className="container-page relative pb-14 pt-12 sm:pb-16">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {figures.map((figure) => (
            <li key={figure.label}>
              <StatTile
                value={figure.value}
                label={figure.label}
                source={figure.source}
                status={figure.status}
                accent={figure.accent}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
