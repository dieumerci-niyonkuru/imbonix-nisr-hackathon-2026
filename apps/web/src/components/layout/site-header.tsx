import { SiteHeaderNav, type HeaderData } from "@/components/layout/site-header-nav";
import { DISTRICTS, PROVINCE_LABEL, SOURCES } from "@/lib/data";
import { DIMENSIONS, MAP_LAYERS } from "@/lib/indicators";
import { sectorsOf } from "@/lib/sectors";

/**
 * The site header. The coverage figures and the search lists (districts and map measures) are worked out here on the
 * server, so the browser only receives the small lists it needs.
 */
export function SiteHeader() {
  const data: HeaderData = {
    coverage: [
      { value: DISTRICTS.length, label: "districts" },
      { value: DISTRICTS.reduce((count, district) => count + sectorsOf(district.name).length, 0), label: "sectors" },
      { value: Object.keys(SOURCES).length, label: "indicators" },
      { value: new Set(Object.values(SOURCES).map((source) => source.source)).size, label: "publications" },
    ],
    search: {
      districts: DISTRICTS.map((district) => ({
        name: district.name,
        slug: district.slug,
        province: PROVINCE_LABEL[district.province] ?? district.province,
      })),
      measures: MAP_LAYERS.map((layer) => {
        const dimension = DIMENSIONS[layer.dimension];
        const source = SOURCES[layer.id];
        return {
          id: layer.id,
          label: layer.short,
          hint: source ? `${dimension.label} · ${source.source}, ${source.year}` : dimension.label,
          terms: `${source?.label ?? ""} ${source?.source ?? ""} ${dimension.label}`,
          accent: dimension.accent,
        };
      }),
    },
  };

  return <SiteHeaderNav data={data} />;
}
