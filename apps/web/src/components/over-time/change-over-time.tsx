import { ChangeDots, type ChangeRow } from "@/components/charts/change-dots";
import { DistrictSpreadChart, TrendLines, TrendMultiples, type TrendMultiple } from "@/components/charts/recharts/trend-charts";
import { Finding } from "@/components/focus/finding";
import { oneDecimal } from "@/components/focus/focus-shared";
import { FigureTiles, type FigureTile } from "@/components/home/figure-tiles";
import { ChartCard } from "@/components/ui/chart-card";
import { SectionHeader } from "@/components/ui/section";
import { SectionNav, type PageSection } from "@/components/ui/section-nav";
import { DISTRICTS, PROVINCE_LABEL, PROVINCES } from "@/lib/data";
import { CORE, MID_GREY } from "@/lib/palette";
import {
  districtSpread,
  firstAndLatest,
  formatPoint,
  nationalSeries,
  projectedNationalPopulation,
  type TrendSeries,
} from "@/lib/timeline";

const SECTIONS: PageSection[] = [
  { id: "key-figures", label: "Key figures" },
  { id: "poverty", label: "Poverty" },
  { id: "people", label: "People" },
  { id: "homes", label: "Homes" },
  { id: "services", label: "Services" },
  { id: "health", label: "Health" },
  { id: "work", label: "Work" },
];

const YEARBOOK = "NISR, Statistical Yearbook 2025";
const EICV_SOURCE = `${YEARBOOK}, Table 1.1 (EICV rounds 2005/06 to 2023/24)`;
const DHS_SOURCE = `${YEARBOOK}, Table 1.2 (DHS rounds 1992 to 2025)`;
const LFS_SOURCE = `${YEARBOOK}, Table 1.3 (Labour Force Survey 2019 to 2024)`;
const POVERTY_SOURCE = "NISR, EICV7 Rwanda Poverty Profile 2023/24, Table 5.1";
const DHS_TIMING = "Mortality rates cover the years before each survey, so a round describes the period leading up to it.";

/** The unit is shown with each value, so labels drop it. */
const plainLabel = (series: TrendSeries) =>
  series.label.replace(/ \((%|minutes|per 1,000 live births|per 100,000 live births|children per woman)\)$/, "");

/** A small multiple for one national series. */
function multiple(id: string, better: TrendMultiple["better"], label?: string): TrendMultiple {
  const series = nationalSeries(id);
  return { id, label: label ?? plainLabel(series), unit: series.unit, better, points: series.points };
}

/** "up 67.7 points" or "down 63 minutes": the change between the first and latest round of a series. */
function describeChange(series: TrendSeries) {
  const [first, latest] = firstAndLatest(series);
  return { first, latest, change: latest.value - first.value };
}

/** Whether a series moved the same way in every round: up for "higher", down for "lower". */
function everyRound(series: TrendSeries, direction: "higher" | "lower") {
  return series.points.every(
    (point, index) =>
      index === 0 ||
      (direction === "higher" ? point.value > series.points[index - 1].value : point.value < series.points[index - 1].value),
  );
}

/** The round from which a series has fallen in every round since, up to the latest. */
function fallingSince(series: TrendSeries) {
  let start = series.points.length - 1;
  while (start > 0 && series.points[start - 1].value > series.points[start].value) start -= 1;
  return series.points[start];
}

/** The round from which a series has risen in every round since, up to the latest. */
function risingSince(series: TrendSeries) {
  let start = series.points.length - 1;
  while (start > 0 && series.points[start - 1].value < series.points[start].value) start -= 1;
  return series.points[start];
}

/**
 * Rwanda over time, from the first census in 1978 to the latest surveys: poverty by province, population, homes,
 * services, health and work, each as a claim beside the charts that back it. Every heading is worked out from the
 * data, so it stays true if the figures are updated.
 */
export function ChangeOverTime() {
  // Poverty: Rwanda and the five provinces, 2016/17 (NISR's estimate on the EICV7 method) and 2023/24.
  const provinceName = (area: string) =>
    area === "Rwanda" ? "Rwanda" : PROVINCE_LABEL[area].replace(" Province", "").replace("City of ", "");
  const povertyRows = (id: string): ChangeRow[] =>
    ["Rwanda", ...PROVINCES]
      .map((area) => {
        const [before, after] = nationalSeries(id, area).points;
        return { label: provinceName(area), before: before.value, after: after.value, emphasis: area === "Rwanda" };
      })
      .sort((first, second) => Number(second.emphasis) - Number(first.emphasis) || second.after - first.after);
  const poverty = povertyRows("poverty_rate");
  const extremePoverty = povertyRows("extreme_poverty_rate");
  const provinces = poverty.filter((row) => !row.emphasis);
  const fellEverywhere = provinces.every((row) => row.after < row.before);
  const biggestFall = [...provinces].sort((first, second) => second.before - second.after - (first.before - first.after))[0];
  const fullName = (label: string) => PROVINCE_LABEL[PROVINCES.find((province) => provinceName(province) === label)!];
  const poorestTwo = [...provinces].sort((first, second) => second.after - first.after).slice(0, 2);
  const rwandaPoverty = poverty[0];
  const rwandaExtreme = extremePoverty[0];

  // People.
  const census = nationalSeries("census_population");
  const [firstCensus, latestCensus] = firstAndLatest(census);
  const growth = latestCensus.value / firstCensus.value;
  const projected = projectedNationalPopulation();
  const projectedLatest = projected[projected.length - 1];
  const millions = (value: number) => `${oneDecimal(value / 1_000_000)} million`;
  const householdSeries = nationalSeries("household_size");
  const householdSize = describeChange(householdSeries);

  // Homes and services.
  const electricity = describeChange(nationalSeries("electricity_lighting"));
  const homeMeasures = ["electricity_lighting", "improved_water", "improved_sanitation", "metal_roof", "cement_floor"].map((id) =>
    nationalSeries(id),
  );
  const homesImprovedEveryRound = homeMeasures.every((series) => everyRound(series, "higher"));
  const biggestHomeGain = homeMeasures
    .map((series) => ({ series, gain: describeChange(series).change }))
    .sort((first, second) => second.gain - first.gain)[0].series;
  const firewood = describeChange(nationalSeries("firewood_cooking"));
  const walk = describeChange(nationalSeries("minutes_to_health_centre"));
  const insurance = describeChange(nationalSeries("health_insurance"));
  const internet = describeChange(nationalSeries("internet_home"));

  // Health.
  const infant = nationalSeries("infant_mortality");
  const underFive = nationalSeries("under_five_mortality");
  const underFivePeak = underFive.points.reduce((peak, point) => (point.value > peak.value ? point : peak));
  const underFiveLatest = underFive.points[underFive.points.length - 1];
  const stunting = nationalSeries("stunting");
  const underweight = nationalSeries("underweight");
  const wasting = nationalSeries("wasting");
  const stuntingChange = describeChange(stunting);
  const stuntingFallingSince = fallingSince(stunting);
  const maternal = nationalSeries("maternal_mortality");
  const maternalChange = describeChange(maternal);

  // Work.
  const unemployment = nationalSeries("unemployment");
  const participation = nationalSeries("labour_force_participation");
  const employment = nationalSeries("employment_to_population");
  const unemploymentPeak = unemployment.points.reduce((peak, point) => (point.value > peak.value ? point : peak));
  const unemploymentLatest = unemployment.points[unemployment.points.length - 1];
  const districtNames = Object.fromEntries(DISTRICTS.map((district) => [district.slug, district.name]));
  const spread = districtSpread("lfs_unemployment", districtNames);
  const latestSpread = spread[spread.length - 1];
  const employmentRisingSince = risingSince(employment);
  const participationRisingSince = risingSince(participation);

  const tiles: FigureTile[] = [
    {
      value: `${rwandaPoverty.after}%`,
      label: `of people live in poverty in 2023/24, down from ${rwandaPoverty.before}% in 2016/17`,
      source: POVERTY_SOURCE,
    },
    {
      value: `${oneDecimal(electricity.latest.value)}%`,
      label: `of households are lit mainly by electricity in ${electricity.latest.period}, up from ${oneDecimal(electricity.first.value)}% in ${electricity.first.period}`,
      source: EICV_SOURCE,
    },
    {
      value: formatPoint(underFiveLatest.value, "persons"),
      label: `deaths before age five per 1,000 live births in ${underFiveLatest.period}, down from ${underFivePeak.value} in ${underFivePeak.period}`,
      source: DHS_SOURCE,
    },
    {
      value: millions(latestCensus.value),
      label: `people counted at the ${latestCensus.period} census, ${oneDecimal(growth)} times the ${millions(firstCensus.value)} of ${firstCensus.period}`,
      source: "NISR, RPHC5 Main Indicators, Table 4",
    },
  ];

  return (
    <>
      <SectionNav label="Change over time" sections={SECTIONS} />

      <div id="key-figures" className="scroll-mt-36">
        <FigureTiles
          id="key-figures-heading"
          eyebrow="Key figures"
          title="Rwanda has changed fast, and the change is measured"
          intro="NISR has counted Rwanda's people in five censuses since 1978 and surveyed its households, health and work in regular rounds. Put side by side, the rounds show how poverty, homes, health and work have changed."
          tiles={tiles}
          columns={4}
        />
      </div>

      <section id="poverty" className="scroll-mt-36 bg-paper py-16 sm:py-20" aria-labelledby="poverty-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="Poverty"
            title={
              <span id="poverty-heading">
                {fellEverywhere ? "Poverty fell in every province" : "Poverty fell in most provinces"}
              </span>
            }
          />
          <div className="mt-10">
            <Finding
              title={`Rwanda's poverty rate fell from ${rwandaPoverty.before}% to ${rwandaPoverty.after}%`}
              body={`Between 2016/17 and 2023/24 poverty fell ${oneDecimal(rwandaPoverty.before - rwandaPoverty.after)} points nationally and extreme poverty from ${rwandaExtreme.before}% to ${rwandaExtreme.after}%. The biggest fall was in the ${fullName(biggestFall.label)} (${oneDecimal(biggestFall.before - biggestFall.after)} points), but the ${poorestTwo[0].label} and ${poorestTwo[1].label} provinces are still the poorest. 2016/17 is NISR's estimate on the EICV7 method, so it compares directly with 2023/24; earlier rounds used another method and are not comparable.`}
              stats={[
                { value: `${rwandaPoverty.after}%`, label: "poverty rate, 2023/24", color: CORE.cyan },
                { value: `${rwandaExtreme.after}%`, label: "extreme poverty rate, 2023/24", color: CORE.deep },
              ]}
              links={[
                { href: "/poverty-dynamics", label: "Poverty dynamics at a glance" },
                { href: "/poverty-dynamics/district-map", label: "Poverty district by district" },
              ]}
            >
              <ChartCard
                id="chart-poverty-by-province-change"
                title={`Poverty fell ${fellEverywhere ? "in every province" : "in most provinces"}`}
                howToRead="Each line is one area. The grey dot is 2016/17 and the cyan dot 2023/24; the further left the cyan dot, the lower poverty is now."
                source={POVERTY_SOURCE}
                status="model_estimate"
              >
                <ChangeDots rows={poverty} beforeLabel="2016/17" afterLabel="2023/24" max={60} />
              </ChartCard>
              <ChartCard
                id="chart-extreme-poverty-by-province-change"
                title={`Extreme poverty fell from ${rwandaExtreme.before}% to ${rwandaExtreme.after}% nationally`}
                note="Extreme poverty is living below the food poverty line."
                howToRead="The grey dot is 2016/17 and the cyan dot 2023/24, on the same kind of scale as the chart above."
                source={POVERTY_SOURCE}
                status="model_estimate"
              >
                <ChangeDots rows={extremePoverty} beforeLabel="2016/17" afterLabel="2023/24" max={20} />
              </ChartCard>
            </Finding>
          </div>
        </div>
      </section>

      <section id="people" className="scroll-mt-36 bg-white py-16 sm:py-20" aria-labelledby="people-heading">
        <div className="container-page">
          <SectionHeader eyebrow="People" title={<span id="people-heading">More people, in smaller households</span>} />
          <div className="mt-10">
            <Finding
              title={`Rwanda's population grew ${oneDecimal(growth)} times between the ${firstCensus.period} and ${latestCensus.period} censuses`}
              body={`The censuses counted ${millions(firstCensus.value)} people in ${firstCensus.period} and ${millions(latestCensus.value)} in ${latestCensus.period}. Adding up NISR's projections for the 30 districts gives ${millions(projectedLatest.value)} by ${projectedLatest.period}. Households have become smaller, from ${householdSize.first.value} people on average in ${householdSize.first.period} to ${householdSize.latest.value} in ${householdSize.latest.period}.`}
              stats={[
                { value: millions(latestCensus.value), label: `people counted in ${latestCensus.period}`, color: CORE.cyan },
                {
                  value: String(householdSize.latest.value),
                  label: `people per household, ${householdSize.latest.period}`,
                  color: CORE.deep,
                },
              ]}
            >
              <ChartCard
                id="chart-population-censuses"
                title="Population at each census, and NISR's projection"
                note="The projection is the sum of NISR's projections for the 30 districts, not a count."
                howToRead="Cyan dots are census counts; grey dots are the projection from 2023. The value of each line's last point is written at its end."
                source="NISR, RPHC5 Main Indicators, Table 4; NISR subnational population projections 2023 to 2032"
              >
                <TrendLines
                  lines={[
                    { key: "census", label: "Census count", color: CORE.cyan, points: census.points, endLabel: "above" },
                    { key: "projection", label: "Projection (sum of the 30 districts)", color: MID_GREY, points: projected },
                  ]}
                  unit="persons"
                  description={`Census population: ${census.points.map((point) => `${point.period} ${millions(point.value)}`).join(", ")}. Projection: ${millions(projected[0].value)} in ${projected[0].period} to ${millions(projectedLatest.value)} in ${projectedLatest.period}.`}
                />
              </ChartCard>
              <ChartCard
                id="chart-household-size"
                title="Households have become smaller"
                howToRead="Average number of people per household in each EICV round."
                source={EICV_SOURCE}
              >
                <TrendLines
                  lines={[
                    { key: "householdSize", label: "Average household size", color: CORE.deep, points: householdSeries.points },
                  ]}
                  unit="persons"
                  description={`Average household size: ${householdSeries.points.map((point) => `${point.period} ${point.value}`).join(", ")} people.`}
                  height={220}
                />
              </ChartCard>
            </Finding>
          </div>
        </div>
      </section>

      <section id="homes" className="scroll-mt-36 bg-paper py-16 sm:py-20" aria-labelledby="homes-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="Homes"
            title={
              <span id="homes-heading">
                {homesImprovedEveryRound ? "Better homes in every survey round" : "Better homes than in the first round"}
              </span>
            }
            intro={`Electricity reached ${oneDecimal(electricity.latest.value)}% of households in ${electricity.latest.period}, from ${oneDecimal(electricity.first.value)}% in ${electricity.first.period}${biggestHomeGain.id === "electricity_lighting" ? ", the biggest gain of the measures below" : ""}. ${homesImprovedEveryRound ? "Water, sanitation, roofs and floors improved in every round" : "Water, sanitation, roofs and floors improved"}, yet ${oneDecimal(firewood.latest.value)}% of households still cook mainly with firewood.`}
          />
          <div className="mt-10">
            <ChartCard
              id="chart-homes-over-time"
              title="Six measures of the home, EICV round by round"
              howToRead="Each small chart is one measure from zero, with its latest value and its change since the first round. Cyan text marks an improvement."
              source={EICV_SOURCE}
            >
              <TrendMultiples
                items={[
                  multiple("electricity_lighting", "higher", "Lit mainly by electricity"),
                  multiple("improved_water", "higher", "Improved drinking water"),
                  multiple("improved_sanitation", "higher", "Improved sanitation"),
                  multiple("metal_roof", "higher", "Iron sheet roof"),
                  multiple("cement_floor", "higher", "Cement floor"),
                  multiple("firewood_cooking", "lower", "Cooking mainly with firewood"),
                ]}
              />
            </ChartCard>
          </div>
        </div>
      </section>

      <section id="services" className="scroll-mt-36 bg-white py-16 sm:py-20" aria-labelledby="services-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="Services"
            title={<span id="services-heading">Services came closer, and more people are covered</span>}
            intro={`The average trip to a health centre fell from ${Math.round(walk.first.value)} minutes in ${walk.first.period} to ${Math.round(walk.latest.value)} in ${walk.latest.period}, and health insurance cover rose from ${oneDecimal(insurance.first.value)}% to ${oneDecimal(insurance.latest.value)}%. Internet at home reached ${oneDecimal(internet.latest.value)}% of households in ${internet.latest.period}.`}
          />
          <div className="mt-10">
            <ChartCard
              id="chart-services-over-time"
              title="Health, school, phones and planned villages, EICV round by round"
              howToRead="Each small chart is one measure from zero. For the time to a health centre, lower is better."
              source={EICV_SOURCE}
            >
              <TrendMultiples
                items={[
                  multiple("minutes_to_health_centre", "lower", "Time to reach a health centre"),
                  multiple("health_insurance", "higher", "People with health insurance"),
                  multiple("ever_attended_school", "higher", "People aged 6+ who ever attended school"),
                  multiple("mobile_phone", "higher", "Households owning a mobile phone"),
                  multiple("internet_home", "higher", "Households with internet at home"),
                  multiple("umudugudu", "neutral", "Households in planned villages (umudugudu)"),
                ]}
              />
            </ChartCard>
          </div>
        </div>
      </section>

      <section id="health" className="scroll-mt-36 bg-paper py-16 sm:py-20" aria-labelledby="health-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="Health"
            title={<span id="health-heading">Far fewer children die, and fewer are stunted</span>}
          />
          <div className="mt-10 grid gap-16">
            <Finding
              title={`Under five mortality fell from ${underFivePeak.value} to ${underFiveLatest.value} per 1,000 live births`}
              body={`The ${underFivePeak.period} survey recorded the highest rate; by ${underFiveLatest.period} it was ${underFiveLatest.value}. Maternal deaths fell from ${Math.round(maternalChange.first.value).toLocaleString("en-US")} to ${Math.round(maternalChange.latest.value)} per 100,000 live births between ${maternalChange.first.period} and ${maternalChange.latest.period}. ${DHS_TIMING}`}
              stats={[
                {
                  value: String(underFiveLatest.value),
                  label: `under five deaths per 1,000 live births, ${underFiveLatest.period}`,
                  color: CORE.deep,
                },
                {
                  value: String(infant.points[infant.points.length - 1].value),
                  label: `infant deaths per 1,000 live births, ${infant.points[infant.points.length - 1].period}`,
                  color: CORE.cyan,
                },
              ]}
            >
              <ChartCard
                id="chart-child-mortality"
                title="Child deaths per 1,000 live births"
                howToRead="Deaths before age one (infant) and before age five, in each DHS round."
                source={DHS_SOURCE}
              >
                <TrendLines
                  lines={[
                    { key: "underFive", label: "Before age five", color: CORE.deep, points: underFive.points },
                    { key: "infant", label: "Before age one", color: CORE.cyan, points: infant.points, endLabel: "below" },
                  ]}
                  unit="per 1,000"
                  description={`Under five mortality: ${underFive.points.map((point) => `${point.period} ${point.value}`).join(", ")}. Infant mortality: ${infant.points.map((point) => `${point.period} ${point.value}`).join(", ")}, per 1,000 live births.`}
                />
              </ChartCard>
              <ChartCard id="chart-maternal-mortality" title="Maternal deaths per 100,000 live births" source={DHS_SOURCE}>
                <TrendLines
                  lines={[{ key: "maternal", label: "Maternal mortality", color: CORE.deep, points: maternal.points }]}
                  unit="per 100,000"
                  description={`Maternal mortality per 100,000 live births: ${maternal.points.map((point) => `${point.period} ${point.value}`).join(", ")}.`}
                  height={240}
                />
              </ChartCard>
            </Finding>

            <Finding
              title={`Child stunting fell from ${stuntingChange.first.value}% to ${stuntingChange.latest.value}%`}
              body={`Stunting, being too short for one's age, is the clearest sign of long-term undernutrition. It has fallen in every DHS round since ${stuntingFallingSince.period}, yet ${stuntingChange.latest.value}% of children under five were still stunted in ${stuntingChange.latest.period}.`}
              stats={[
                {
                  value: `${stuntingChange.latest.value}%`,
                  label: `of children under five stunted, ${stuntingChange.latest.period}`,
                  color: CORE.deep,
                },
              ]}
              links={[{ href: "/poverty-dynamics/district-map?layer=dhs_stunting", label: "Stunting district by district" }]}
            >
              <ChartCard
                id="chart-child-nutrition"
                title="Children under five who are stunted, underweight or wasted"
                howToRead="Share of children under five in each DHS round. The underweight figure for 2025 is not in the Yearbook table."
                source={DHS_SOURCE}
              >
                <TrendLines
                  lines={[
                    { key: "stunting", label: "Stunted", color: CORE.deep, points: stunting.points },
                    { key: "underweight", label: "Underweight", color: CORE.cyan, points: underweight.points },
                    { key: "wasting", label: "Wasted", color: MID_GREY, points: wasting.points },
                  ]}
                  unit="%"
                  description={`Stunted: ${stunting.points.map((point) => `${point.period} ${point.value}%`).join(", ")}. Underweight: ${underweight.points.map((point) => `${point.period} ${point.value}%`).join(", ")}. Wasted: ${wasting.points.map((point) => `${point.period} ${point.value}%`).join(", ")}.`}
                />
              </ChartCard>
              <ChartCard
                id="chart-maternal-child-care"
                title="Care around birth, DHS round by round"
                howToRead="Each small chart is one measure from zero, with its latest value and its change since 1992."
                source={DHS_SOURCE}
              >
                <TrendMultiples
                  items={[
                    multiple("assisted_delivery", "higher", "Births with assistance during delivery"),
                    multiple("vaccination", "higher", "Children vaccinated"),
                    multiple("modern_contraception", "neutral", "Married women using modern contraception"),
                    multiple("fertility_rate", "neutral", "Children per woman"),
                  ]}
                  columns={2}
                />
              </ChartCard>
            </Finding>
          </div>
        </div>
      </section>

      <section id="work" className="scroll-mt-36 bg-white py-16 sm:py-20" aria-labelledby="work-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="Work"
            title={<span id="work-heading">More people in work since {employmentRisingSince.period}</span>}
          />
          <div className="mt-10">
            <Finding
              title={`Unemployment peaked at ${unemploymentPeak.value}% in ${unemploymentPeak.period} and was ${unemploymentLatest.value}% in ${unemploymentLatest.period}`}
              body={`${employmentRisingSince.period === participationRisingSince.period ? `The shares of working age people in work and in the labour force have both risen every year since ${employmentRisingSince.period}.` : `The share of working age people in work has risen every year since ${employmentRisingSince.period}, and the share in the labour force every year since ${participationRisingSince.period}.`} Districts differ widely: in ${latestSpread.year}, unemployment ranged from ${oneDecimal(latestSpread.low)}% in ${latestSpread.lowDistrict} to ${oneDecimal(latestSpread.high)}% in ${latestSpread.highDistrict}.`}
              stats={[
                {
                  value: `${unemploymentLatest.value}%`,
                  label: `unemployment rate, ${unemploymentLatest.period}`,
                  color: CORE.deep,
                },
                {
                  value: `${participation.points[participation.points.length - 1].value}%`,
                  label: `labour force participation, ${participation.points[participation.points.length - 1].period}`,
                  color: CORE.cyan,
                },
              ]}
              links={[{ href: "/districts", label: "Each district's figures year by year" }]}
            >
              <ChartCard
                id="chart-labour-market"
                title="Participation, employment and unemployment, 2019 to 2024"
                howToRead="Share of the working age population in the labour force and in work, and share of the labour force without work."
                source={LFS_SOURCE}
              >
                <TrendLines
                  lines={[
                    { key: "participation", label: "Labour force participation", color: CORE.cyan, points: participation.points },
                    { key: "employment", label: "Employment to population", color: CORE.deep, points: employment.points },
                    { key: "unemployment", label: "Unemployment", color: MID_GREY, points: unemployment.points },
                  ]}
                  unit="%"
                  description={`Participation: ${participation.points.map((point) => `${point.period} ${point.value}%`).join(", ")}. Employment to population: ${employment.points.map((point) => `${point.period} ${point.value}%`).join(", ")}. Unemployment: ${unemployment.points.map((point) => `${point.period} ${point.value}%`).join(", ")}.`}
                />
              </ChartCard>
              <ChartCard
                id="chart-district-unemployment-spread"
                title="Unemployment across the 30 districts, 2017 to 2025"
                note="The tables give district unemployment rates for 2024 and 2025; for earlier years we divide the published number of unemployed people by the labour force."
                howToRead="The band runs from the district with the lowest rate to the one with the highest; the line is the median district. Hover a year to see which districts they are."
                source="NISR, LFS 2025 annual tables, Tables 21 to 25; IMBONIX calculation for 2017 to 2023"
                status="calculated"
              >
                <DistrictSpreadChart
                  years={spread}
                  unit="%"
                  description={`District unemployment, lowest, median and highest: ${spread.map((year) => `${year.year} ${oneDecimal(year.low)}%, ${oneDecimal(year.median)}%, ${oneDecimal(year.high)}%`).join("; ")}.`}
                />
              </ChartCard>
            </Finding>
          </div>
        </div>
      </section>
    </>
  );
}
