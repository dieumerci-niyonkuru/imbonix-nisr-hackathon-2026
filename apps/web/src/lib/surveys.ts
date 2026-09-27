import usageJson from "@/data/generated/usage.json";
import { SEVERITY } from "@/lib/palette";
import vupJson from "@/data/generated/vup.json";

export type UsageRow = {
  sex: "women" | "men";
  group: string;
  category: string;
  phone: number;
  smartphone: number;
  mobileMoney: number;
  bank: number;
  bankActive: number;
  either: number;
  n: number;
};

export type DeliveryRow = {
  component: string;
  table: string;
  block: string;
  category: string;
  extremelyPoor: number | null;
  moderatelyPoor: number | null;
  nonPoor: number | null;
  all: number | null;
};

export type TrendRow = {
  year: string;
  survey: string;
  sample: string;
  component: string;
  question: string;
  category: string;
  pct: number;
  base_n: number | null;
  source: string;
  table: string;
};

export const USAGE = usageJson as UsageRow[];
export const VUP = vupJson as { delivery: DeliveryRow[]; trend: TrendRow[] };

export function usageRows(group: string, sex: UsageRow["sex"]): UsageRow[] {
  return USAGE.filter((r) => r.group === group && r.sex === sex);
}

export function usageTotal(sex: UsageRow["sex"]): UsageRow {
  return USAGE.find((r) => r.sex === sex && r.group === "Total" && r.category === "15-49")!;
}

/** Women and men side by side for one DHS breakdown. */
export function usagePairs(
  group: string,
  measure: keyof Pick<UsageRow, "either" | "bank" | "mobileMoney" | "smartphone" | "phone">,
) {
  const women = usageRows(group, "women");
  const men = usageRows(group, "men");
  return women.map((w) => ({
    label: w.category,
    women: w[measure],
    men: men.find((m) => m.category === w.category)?.[measure],
  }));
}

export const VUP_COMPONENTS = [
  { id: "Direct Support", short: "Direct Support", note: "Monthly cash for households with no labour capacity" },
  {
    id: "Nutrition-Sensitive Direct Support",
    short: "Nutrition sensitive DS",
    note: "For poor households with pregnant women or young children",
  },
  { id: "Classic Public Works", short: "Classic public works", note: "Paid work on community projects" },
  { id: "Expanded Public Works", short: "Expanded public works", note: "Flexible, longer-term public works" },
];

export function timeliness(component: string): DeliveryRow[] {
  return VUP.delivery.filter((r) => r.component === component && r.block.startsWith("Timeliness"));
}

export function channel(component: string): DeliveryRow[] {
  return VUP.delivery.filter((r) => r.component === component && /Method|channel/i.test(r.block));
}

/** On time → more than 20 days late: one hue, darker = longer delay (validated ordinal ramp). */
export const DELAY_RAMP: readonly string[] = SEVERITY;

export const DELAY_LABELS = ["On time", "1 to 10 days late", "11 to 20 days late", "More than 20 days late"];
