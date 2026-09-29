import type { ShareSeries } from "@/components/charts/recharts/stacked-share-chart";
import { STRAND } from "@/lib/palette";
import { DELAY_RAMP, timeliness, VUP_COMPONENTS } from "@/lib/surveys";

/** Rounded to one decimal place, as the published tables are. */
export const oneDecimal = (value: number) => Math.round(value * 10) / 10;

/** The FinScope access strand: every adult once, by the most formal service they use. */
export const ACCESS_SERIES: ShareSeries = [
  { key: "banked", label: "Banked", color: STRAND.banked },
  { key: "otherFormal", label: "Other formal (non bank)", color: STRAND.otherFormal },
  { key: "informalOnly", label: "Informal only", color: STRAND.informalOnly },
  { key: "excluded", label: "Excluded", color: STRAND.excluded },
];

/** How late the last VUP payment was, from on time to more than 20 days late. */
export const TIMELINESS_SERIES: ShareSeries = [
  { key: "onTime", label: "On time", color: DELAY_RAMP[0] },
  { key: "lateUpToTenDays", label: "1 to 10 days late", color: DELAY_RAMP[1] },
  { key: "lateUpToTwentyDays", label: "11 to 20 days late", color: DELAY_RAMP[2] },
  { key: "lateOverTwentyDays", label: "More than 20 days late", color: DELAY_RAMP[3] },
];

/** How late each VUP programme's last payment was: on time, then up to 10, 20 and more than 20 days late. */
export function paymentTimelinessByProgramme() {
  return VUP_COMPONENTS.map((component) => {
    const [onTime, lateUpToTenDays, lateUpToTwentyDays, lateOverTwentyDays] = timeliness(component.id).map((row) =>
      oneDecimal(row.all!),
    );
    return { programme: component.short, onTime, lateUpToTenDays, lateUpToTwentyDays, lateOverTwentyDays };
  });
}
