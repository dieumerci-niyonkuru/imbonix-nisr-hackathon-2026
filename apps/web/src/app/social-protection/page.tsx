import type { Metadata } from "next";
import { StackedBar } from "@/components/charts/stacked-bar";
import { Callout, PageHero, SectionHeader } from "@/components/ui/section";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatNumber } from "@/lib/format";
import { channel, DELAY_LABELS, DELAY_RAMP, timeliness, VUP, VUP_COMPONENTS } from "@/lib/surveys";
import { CORE, DEEP_CYAN, RAMPS } from "@/lib/palette";
import { HowToRead } from "@/components/ui/chart-card";

export const metadata: Metadata = {
  title: "VUP support and payments",
  description:
    "How VUP social-protection payments reach households: timeliness, payment channel and amounts, from the EICV7 VUP survey.",
};

/** Non-poor → extremely poor: one hue, darker = poorer (validated ordinal ramp). */
const POVERTY_RAMP = { nonPoor: RAMPS.cyan[0], moderatelyPoor: RAMPS.cyan[2], extremelyPoor: RAMPS.cyan[4] };
const CHANNEL = { sacco: DEEP_CYAN, momo: CORE.cyan };

const AMOUNTS = [
  {
    component: "Direct Support",
    category: "Average amount received from DS in the last 12 months",
    label: "per household, last 12 months",
  },
  {
    component: "Classic Public Works",
    category: "Average total salary received in the last 12 months",
    label: "per household, last 12 months",
  },
  {
    component: "Expanded Public Works",
    category: "Average total salary received from ePW in the last 12 months",
    label: "per participant, last 12 months",
  },
  {
    component: "Nutrition-Sensitive Direct Support",
    category: "Average quarterly benefit received",
    label: "per person, per quarter",
  },
];

export default function SocialProtectionPage() {
  const onTime = VUP_COMPONENTS.map((c) => ({ ...c, row: timeliness(c.id)[0] }));
  const trend = (year: string, category: string, component = "Direct Support") =>
    VUP.trend.find((r) => r.year === year && r.category === category && r.component === component && r.sample === "VUP sample")!;

  return (
    <>
      <PageHero
        eyebrow="VUP support and payments"
        title="VUP payments are faster, but rarely on time"
        intro="The Vision 2020 Umurenge Programme (VUP) pays cash to Rwanda's poorest households through Direct Support and public works. NISR's EICV7 VUP survey asked about 3,800 beneficiary households when their last payment arrived, how it was paid, and how much they received."
      />

      {/* Headline contrast */}
      <section className="container-page py-12">
        <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <div>
            <div className="card h-full p-6">
              <p className="text-[13px] font-bold text-muted">Administrative figure</p>
              <p className="mt-3 font-display text-5xl font-bold tracking-[-0.04em] text-ink">96.6%</p>
              <p className="mt-2 text-[14px] leading-6 text-ink/80">of payments delivered on time, on average</p>
              <p className="mt-4 text-[11.5px] leading-5 text-muted">
                Social Protection Sector Strategic Plan 2024 to 2029 (MINALOC): Direct Support 97%, classic public works 90%,
                expanded public works 96%.
              </p>
            </div>
          </div>
          <div>
            <div className="card h-full p-6">
              <p className="text-[13px] font-bold text-muted">What beneficiaries report · last payment on time, 2023/24</p>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {onTime.map((c) => (
                  <div key={c.id}>
                    <p className="font-display text-4xl font-bold tracking-[-0.03em] text-ink">{c.row.all!.toFixed(1)}%</p>
                    <p className="mt-1 text-[13px] font-semibold text-ink">{c.short}</p>
                    <p className="text-[11.5px] leading-4 text-muted">{c.note}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-[12px] leading-5 text-muted">
                The two figures probably measure different moments: when a payment is released, and when it reaches the household.
                The gap between them is a measurement finding worth tracking, not an accusation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeliness by programme */}
      <section className="border-y border-line bg-white py-14">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeader
            eyebrow="Timeliness"
            accent="text-dim-poverty"
            title="How late was the last payment?"
            intro="Most payments arrive within ten days of the due date. Expanded public works has the longest tail: almost one participant in five waited more than 20 days."
          />
          <div>
            <div className="space-y-5">
              {VUP_COMPONENTS.map((c) => (
                <div key={c.id}>
                  <p className="mb-1.5 text-[13px] font-semibold text-ink">{c.short}</p>
                  <StackedBar
                    height="h-8"
                    showLegend={false}
                    segments={timeliness(c.id).map((r, i) => ({
                      label: DELAY_LABELS[i],
                      value: Math.round(r.all! * 10) / 10,
                      color: DELAY_RAMP[i],
                    }))}
                  />
                </div>
              ))}
            </div>
            <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
              {DELAY_LABELS.map((label, i) => (
                <li key={label} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: DELAY_RAMP[i] }} /> {label}
                </li>
              ))}
            </ul>
            <HowToRead className="mt-3">
              Each bar is one VUP programme, split by how late its last payment arrived. The lightest part is on time; the darker
              the part, the later the payment.
            </HowToRead>
            <p className="mt-3 flex flex-wrap items-center gap-2 text-[11.5px] text-muted">
              <StatusBadge status="observed" /> NISR EICV7 VUP thematic report tables 4.2, 4.5, 4.8 and 4.11, 2023/24 · all
              beneficiaries
            </p>
          </div>
        </div>
      </section>

      {/* On time by poverty status */}
      <section className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeader
            eyebrow="Who waits longest"
            accent="text-dim-poverty"
            title="The poorest often wait longest"
            intro="In classic public works, only 2.6% of extremely poor participants were paid on time, against about 11% of the others. In Direct Support it was 11.1% against 17.4% for non-poor households, and in expanded public works 40% of extremely poor participants waited more than 20 days. Nutrition sensitive Direct Support is the exception: its poorest recipients were paid on time slightly more often."
          />
          <div className="card p-5 sm:p-6">
            <p className="text-[13px] font-bold text-ink">Last payment on time, by poverty status (%)</p>
            <HowToRead className="mt-2">
              For each programme, the three bars are the share paid on time among extremely poor, moderately poor and non poor
              beneficiaries. A shorter bar means fewer were paid on time.
            </HowToRead>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
              {[
                ["Extremely poor", POVERTY_RAMP.extremelyPoor],
                ["Moderately poor", POVERTY_RAMP.moderatelyPoor],
                ["Not poor", POVERTY_RAMP.nonPoor],
              ].map(([label, color]) => (
                <li key={label} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} /> {label}
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-5">
              {onTime.map((c) => {
                const groups = [
                  { label: "Extremely poor", value: c.row.extremelyPoor!, color: POVERTY_RAMP.extremelyPoor },
                  { label: "Moderately poor", value: c.row.moderatelyPoor!, color: POVERTY_RAMP.moderatelyPoor },
                  { label: "Not poor", value: c.row.nonPoor!, color: POVERTY_RAMP.nonPoor },
                ];
                return (
                  <div key={c.id}>
                    <p className="mb-1.5 text-[12.5px] font-semibold text-ink">{c.short}</p>
                    <div className="space-y-[2px]">
                      {groups.map((g) => (
                        <div key={g.label} className="flex items-center gap-2" title={`${g.label}: ${g.value.toFixed(1)}%`}>
                          <div
                            className="h-4 rounded-r-[4px]"
                            style={{ width: `${(g.value / 25) * 85}%`, background: g.color }}
                          />
                          <span className="tabular text-[12px] font-semibold text-ink">{g.value.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-[11.5px] text-muted">Scale 0 to 25%. Poverty status as measured by EICV7 at survey time.</p>
          </div>
        </div>
      </section>

      {/* Channel and amounts */}
      <section className="border-y border-line bg-white py-14">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeader
              eyebrow="Payment channel"
              accent="text-dim-finance"
              title="Three in four payments are collected at a SACCO"
              intro="Collecting cash at an Umurenge SACCO counter takes time and travel. Between 18% and 24% of beneficiaries, depending on the programme, are already paid by mobile money: a practical lever for faster, cheaper delivery."
            />
            <div className="mt-8 space-y-4">
              {VUP_COMPONENTS.map((c) => {
                const rows = channel(c.id);
                const sacco = rows.find((r) => /Sacco/i.test(r.category))?.all ?? 0;
                const momo = rows.find((r) => /Momo/i.test(r.category))?.all ?? 0;
                return (
                  <div key={c.id}>
                    <p className="mb-1.5 text-[12.5px] font-semibold text-ink">{c.short}</p>
                    <StackedBar
                      height="h-7"
                      showLegend={false}
                      segments={[
                        { label: "Umurenge SACCO", value: Math.round(sacco * 10) / 10, color: CHANNEL.sacco },
                        { label: "Mobile money", value: Math.round(momo * 10) / 10, color: CHANNEL.momo },
                      ]}
                    />
                  </div>
                );
              })}
            </div>
            <ul className="mt-4 flex gap-4 text-[12px] text-muted">
              <li className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: CHANNEL.sacco }} /> Umurenge SACCO
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: CHANNEL.momo }} /> Mobile money (MoMo / Airtel
                Money)
              </li>
            </ul>
            <HowToRead className="mt-3">
              Each bar is one programme, split into beneficiaries who collect their payment at an Umurenge SACCO counter and those
              paid by mobile money.
            </HowToRead>
          </div>
          <div>
            <SectionHeader
              eyebrow="Amounts"
              accent="text-dim-health"
              title="What households receive"
              intro="Average amounts reported by beneficiaries, in Rwandan francs. Transfers are small next to living costs that rose about 16% in the year to August 2026."
            />
            <HowToRead className="mt-6">
              Each figure is the average amount one beneficiary reported receiving, in Rwandan francs.
            </HowToRead>
            <div className="mt-5 grid grid-cols-2 gap-4">
              {AMOUNTS.map((a) => {
                const row = VUP.delivery.find((r) => r.component === a.component && r.category === a.category);
                const short = VUP_COMPONENTS.find((c) => c.id === a.component)!.short;
                return (
                  <div key={a.component} className="rounded-2xl border border-line p-5">
                    <p className="text-[12px] font-semibold text-muted">{short}</p>
                    <p className="mt-2 font-display text-2xl font-bold text-ink">RWF {formatNumber(row?.all ?? 0)}</p>
                    <p className="mt-1 text-[12px] text-muted">{a.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Ten years */}
      <section className="container-page py-14">
        <SectionHeader
          eyebrow="Ten years of household reports"
          accent="text-dim-poverty"
          title="Long delays fell sharply; the share paid on time barely moved"
          intro="Three NISR surveys asked VUP Direct Support households about payment timing. The questions changed in 2023/24, so read these as an indicative direction, not a precise trend."
        />
        <HowToRead className="mt-4 max-w-3xl">
          Each card is one survey. The first figure is the share paid regularly or on time, the second the share whose payment was
          very late; the question each survey asked is under its card.
        </HowToRead>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              year: "2013/14",
              survey: "EICV4 VUP sample",
              onTime: trend("2013/14", "Regular every month"),
              late: trend("2013/14", "Typically more than a month late"),
              lateLabel: "typically more than a month late",
            },
            {
              year: "2016/17",
              survey: "EICV5 VUP sample",
              onTime: trend("2016/17", "Regularly every month"),
              late: trend("2016/17", "Typically more than a month late"),
              lateLabel: "typically more than a month late",
            },
            {
              year: "2023/24",
              survey: "EICV7 VUP sample",
              onTime: trend("2023/24", "Paid on time"),
              late: trend("2023/24", "More than 20 days"),
              lateLabel: "last payment more than 20 days late",
            },
          ].map((col) => (
            <div key={col.year}>
              <div className="card h-full p-6">
                <p className="font-display text-2xl font-bold text-ink">{col.year}</p>
                <p className="text-[12px] text-muted">{col.survey}</p>
                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-display text-3xl font-bold text-ink">{col.onTime.pct}%</p>
                    <p className="text-[12px] leading-4 text-muted">paid regularly or on time</p>
                  </div>
                  <div>
                    <p className="font-display text-3xl font-bold text-dim-poverty">{col.late.pct}%</p>
                    <p className="text-[12px] leading-4 text-muted">{col.lateLabel}</p>
                  </div>
                </div>
                <p className="mt-5 border-t border-line pt-3 text-[11.5px] leading-5 text-muted">
                  Question: {col.onTime.question.toLowerCase()}. {col.onTime.source}, {col.onTime.table}.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page grid gap-4 pb-20 md:grid-cols-3">
        <Callout title="Survey sample, not districts">
          The EICV7 VUP sample is designed for national estimates and estimates for each programme. It cannot give reliable
          district figures; CFSVA 2024 microdata can show VUP coverage by district.
        </Callout>
        <Callout title="Descriptive, not causal">
          These are beneficiary reports. They show where delivery can improve; they do not measure the programme&apos;s impact.
        </Callout>
        <Callout title="Next step">
          With the EICV7 VUP microdata, IMBONIX will estimate delays for the last three payments by province and poverty status,
          and how many households paid late already own a phone.
        </Callout>
      </section>
    </>
  );
}
