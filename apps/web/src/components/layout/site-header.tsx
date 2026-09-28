import { SiteHeaderNav, type HeaderData } from "@/components/layout/site-header-nav";
import { DISTRICTS, PROVINCE_LABEL, SOURCES } from "@/lib/data";
import { CHART_INDEX } from "@/lib/chart-index";
import { DIMENSIONS, INDICATORS } from "@/lib/indicators";
import { LEVERS } from "@/lib/priorities";
import { SITE_FACTS } from "@/lib/site-facts";

/**
 * The site header. The coverage figures and the search lists (districts, indicators, charts and policy levers) are
 * worked out here on the server, so the browser only receives the small lists it needs.
 */
export function SiteHeader() {
  const data: HeaderData = {
    coverage: [
      { value: SITE_FACTS.districts, label: "districts" },
      { value: SITE_FACTS.sectors, label: "sectors" },
      { value: SITE_FACTS.indicators, label: "indicators" },
      { value: SITE_FACTS.publications, label: "publications" },
    ],
    search: {
      districts: DISTRICTS.map((district) => ({
        name: district.name,
        slug: district.slug,
        province: PROVINCE_LABEL[district.province] ?? district.province,
      })),
      // Every indicator: those on the map open it there, the others open their row in the catalogue.
      measures: INDICATORS.filter((indicator) => SOURCES[indicator.id]).map((indicator) => {
        const dimension = DIMENSIONS[indicator.dimension];
        const source = SOURCES[indicator.id];
        return {
          id: indicator.id,
          label: indicator.short,
          hint: `${dimension.label} · ${source.source}, ${source.year}${indicator.layer ? " · on the map" : ""}`,
          terms: `${source.label} ${source.source} ${dimension.label} indicator`,
          href: indicator.layer ? `/map?layer=${indicator.id}` : `/data#indicator-${indicator.id}`,
        };
      }),
      charts: CHART_INDEX,
      levers: LEVERS.map((lever) => ({ title: lever.title, question: lever.question })),
    },
  };

  return <SiteHeaderNav data={data} />;
}
