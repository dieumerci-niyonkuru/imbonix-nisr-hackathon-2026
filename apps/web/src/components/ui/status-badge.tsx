import type { ComponentType, SVGProps } from "react";
import {
  AdjustmentsHorizontalIcon,
  ArrowTrendingUpIcon,
  CalculatorIcon,
  CheckBadgeIcon,
  CubeTransparentIcon,
  FlagIcon,
} from "@heroicons/react/20/solid";
import { STATUS_LABEL } from "@/lib/format";
import { cn } from "@/lib/utils";

type StatusStyle = { icon: ComponentType<SVGProps<SVGSVGElement>>; tone: string };

/**
 * Each status has its own icon, so the kind of figure reads at a glance and never by colour alone: published figures
 * and projections in cyan, our own arithmetic, models, scenarios and targets in ink.
 */
const STYLES: Record<string, StatusStyle> = {
  observed: { icon: CheckBadgeIcon, tone: "text-cyan-ink" },
  calculated: { icon: CalculatorIcon, tone: "text-ink" },
  model_estimate: { icon: CubeTransparentIcon, tone: "text-ink" },
  projection: { icon: ArrowTrendingUpIcon, tone: "text-cyan-ink" },
  scenario: { icon: AdjustmentsHorizontalIcon, tone: "text-ink" },
  target: { icon: FlagIcon, tone: "text-cyan-ink" },
};

/**
 * What kind of figure a value is, as statistics offices mark their tables: an icon and a short label in small
 * capitals, with no box around it. Hovering shows what the label means.
 */
export function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  const { icon: Icon, tone } = STYLES[status] ?? STYLES.observed;
  return (
    <span
      title={STATUS_DESCRIPTION[status]}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[11px] font-bold uppercase leading-4 tracking-[0.07em]",
        tone,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export const STATUS_DESCRIPTION: Record<string, string> = {
  observed: "Published by NISR or its partners in an official report or table.",
  calculated: "Our arithmetic on published figures (for example a rate × a population). The formula is shown with the value.",
  model_estimate:
    "A statistical model estimate published by NISR, such as a small area estimate or an earlier rate recalculated on a newer method. Use with care.",
  projection: "NISR population projection, not a count.",
  scenario: "A calculation under assumptions you can see and change. Not a forecast and not an official estimate.",
  target: "A goal set in a national policy document, shown with the baseline it starts from. Not a measurement or a forecast.",
};
