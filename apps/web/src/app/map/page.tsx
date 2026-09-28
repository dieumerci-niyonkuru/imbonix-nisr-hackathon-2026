import type { Metadata } from "next";
import { MapExplorer } from "@/components/map/map-explorer";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BarsMotif } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Map of every district",
  description:
    "Explore 30 Rwandan districts across poverty, financial access, digital readiness, nutrition, shocks, work and health cover.",
};

type SearchParams = Promise<{ layer?: string; district?: string }>;

export default async function MapPage({ searchParams }: { searchParams: SearchParams }) {
  const { layer, district } = await searchParams;
  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-page pb-10 pt-6 sm:pb-12 sm:pt-8">
          <Breadcrumbs />
          <p className="eyebrow mt-8 flex items-center gap-2.5 text-royal">
            <BarsMotif /> Map of every district
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
            <h1 className="max-w-3xl text-balance font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
              Where are households vulnerable, and on which dimension?
            </h1>
            <p className="max-w-md text-[15px] leading-7 text-muted">
              Choose a dimension, then a measure. Darker districts are more affected. Select a district to compare its four core
              dimensions.
            </p>
          </div>
        </div>
      </section>
      <section className="container-page py-8 sm:py-10">
        {/* Keyed on the address, so a link to another layer (from the header, say) resets the explorer even when the
            map is already open. The explorer's own choices only rewrite the address, so they do not remount it. */}
        <MapExplorer key={`${layer ?? ""}:${district ?? ""}`} initialLayer={layer} initialDistrict={district} />
      </section>
    </>
  );
}
