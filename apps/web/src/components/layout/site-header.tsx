import { SiteHeaderNav, type HeaderData } from "@/components/layout/site-header-nav";
import { DISTRICTS, PROVINCE_LABEL, SOURCES } from "@/lib/data";
import { DIMENSIONS, MAP_LAYERS } from "@/lib/indicators";

/**
 * The site header. The search lists (districts and map measures) are worked out here on the server, so the browser
 * only receives the small lists it needs.
 */
export function SiteHeader() {
  const data: HeaderData = {
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
