"use client";

import { useState } from "react";
import { Dumbbell } from "@/components/charts/dumbbell";
import { usagePairs } from "@/lib/surveys";

const MEASURES = [
  {
    id: "either",
    label: "Bank account or mobile money",
    detail: "Has and uses a bank account, or used a mobile phone for financial transactions, in the last 12 months",
  },
  {
    id: "mobileMoney",
    label: "Mobile money",
    detail: "Used a mobile phone for financial transactions in the last 12 months (whether or not they own a phone)",
  },
  { id: "bank", label: "Bank account", detail: "Has and uses an account at a bank or other financial institution" },
  { id: "phone", label: "Owns a phone", detail: "Owns any mobile phone" },
  { id: "smartphone", label: "Owns a smartphone", detail: "Owns a smartphone" },
] as const;

const GROUPS = [
  { id: "Wealth quintile", title: "By household wealth", rename: (c: string) => `${c} fifth` },
  { id: "Residence", title: "By residence", rename: (c: string) => c },
  { id: "Education", title: "By education", rename: (c: string) => c },
  { id: "Age", title: "By age", rename: (c: string) => c },
  { id: "Province", title: "By province", rename: (c: string) => c.replace(" Province", "") },
];

export function UsageExplorer() {
  const [measure, setMeasure] = useState<(typeof MEASURES)[number]["id"]>("either");
  const info = MEASURES.find((m) => m.id === measure)!;
  return (
    <div>
      <div className="card p-4">
        <p className="text-[13px] font-bold text-muted">Measure</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {MEASURES.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={m.id === measure}
              onClick={() => setMeasure(m.id)}
              className={`rounded-md border px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                m.id === measure
                  ? "border-navy-900 bg-navy-900 text-white"
                  : "border-line bg-white text-ink/80 hover:border-royal hover:text-ink"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-[12.5px] text-muted">
          {info.detail}. Women and men aged 15 to 49 (men aged 50 to 59 excluded for comparability).
        </p>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {GROUPS.map((group) => (
          <div key={group.id} className="card p-5 sm:p-6">
            <p className="mb-4 font-display text-lg font-bold text-ink">{group.title}</p>
            <Dumbbell
              rows={usagePairs(group.id, measure)
                .filter((r) => r.label !== "50-59")
                .map((r) => ({ ...r, label: group.rename(r.label) }))}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
