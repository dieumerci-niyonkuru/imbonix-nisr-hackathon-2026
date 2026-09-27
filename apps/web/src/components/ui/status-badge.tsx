import { STATUS_LABEL } from "@/lib/format";

const STYLES: Record<string, string> = {
  observed: "bg-brand-50 text-brand-700 ring-royal/25",
  calculated: "bg-cyan-soft text-cyan-ink ring-cyan/40",
  model_estimate: "bg-mist text-navy-700 ring-navy-700/25",
  projection: "bg-sun-soft text-sun-ink ring-sun/60",
  scenario: "bg-white text-ink ring-ink/30",
  target: "bg-white text-royal ring-royal/40",
};

export function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  return (
    <span
      title={STATUS_DESCRIPTION[status]}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ring-1 ring-inset ${STYLES[status] ?? STYLES.observed} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export const STATUS_DESCRIPTION: Record<string, string> = {
  observed: "Published by NISR or its partners in an official report or table.",
  calculated: "Our arithmetic on published figures (for example a rate × a population). The formula is shown with the value.",
  model_estimate: "A statistical model estimate published by NISR (small area estimation). Use for ranking, with care.",
  projection: "NISR population projection, not a count.",
  scenario: "A calculation under assumptions you can see and change. Not a forecast and not an official estimate.",
  target: "A goal set in a national policy document, shown with the baseline it starts from. Not a measurement or a forecast.",
};
