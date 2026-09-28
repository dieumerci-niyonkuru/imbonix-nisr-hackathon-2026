import type { Metadata } from "next";
import Link from "next/link";
import { ArrowTopRightOnSquareIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Callout, PageHero, SectionHeader } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { FEATURES, METHOD_STEPS, MODEL_QUESTION, MODEL_STATUS, MODEL_TARGET, WILL_NOT } from "@/lib/model-plan";
import { ScrollArea } from "@/components/ui/scroll-area";

export const metadata: Metadata = {
  title: "Who is most at risk",
  description:
    "The planned explainable model of financial vulnerability: design, features, evaluation and fairness checks. Results pending FinScope 2024 microdata.",
};

/** Where a result will appear: labelled placeholders, never invented numbers. */
function PendingPanel({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-dashed shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant="outline">
            <ClockIcon className="h-3.5 w-3.5" aria-hidden="true" /> Awaiting data
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {[88, 72, 64, 51, 40].map((w) => (
          <Skeleton key={w} className="h-4" style={{ width: `${w}%` }} />
        ))}
        <p className="pt-2 text-[12px] text-muted">Placeholder shape only. No values are shown until the model is trained.</p>
      </CardContent>
    </Card>
  );
}

export default function ModelPage() {
  return (
    <>
      <PageHero
        eyebrow="Who is most at risk"
        title="What is associated with financial vulnerability?"
        intro="IMBONIX's model will explain, not just predict: which household and place characteristics go with being financially vulnerable, and how that differs for rural women. This page sets out the design. Results will appear here only after the model is trained on NISR microdata and checked against published figures."
      >
        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-cyan/60 bg-cyan-soft p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <ClockIcon className="mt-0.5 h-6 w-6 shrink-0 text-cyan-ink" aria-hidden="true" />
            <div>
              <p className="font-display font-semibold text-ink">Status: not trained yet</p>
              <p className="mt-0.5 text-[14px] leading-6 text-ink/80">{MODEL_STATUS.reason}</p>
            </div>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <a href={MODEL_STATUS.catalogUrl} target="_blank" rel="noreferrer">
              FinScope 2024 in the NISR catalog <ArrowTopRightOnSquareIcon />
            </a>
          </Button>
        </div>
      </PageHero>

      <section className="container-page grid gap-6 py-12 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <p className="eyebrow text-royal">The question</p>
            <CardTitle className="text-xl">{MODEL_QUESTION}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[14px] leading-6 text-muted">
              Answering it district by district and group by group shows which barriers matter most where, which helps decide
              where to act first.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <p className="eyebrow text-royal">What is predicted</p>
            <CardTitle className="text-xl">{MODEL_TARGET.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[14px] leading-6 text-muted">{MODEL_TARGET.detail}</p>
          </CardContent>
        </Card>
      </section>

      <section className="border-y border-line bg-white py-12" aria-labelledby="features-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="Inputs"
            title={<span id="features-heading">Characteristics the model will use</span>}
            intro="Variable names are from the public FinScope 2024 data dictionary, so the plan can be checked before the data arrives."
          />
          <ScrollArea label="Model inputs (scrolls sideways)" className="mt-8 rounded-2xl border border-line">
            <table className="w-full min-w-[600px] text-left text-[13.5px]">
              <thead className="bg-paper text-[11px] uppercase tracking-[0.06em] text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Group
                  </th>
                  <th scope="col" className="px-4 py-3">
                    FinScope variables
                  </th>
                  <th scope="col" className="px-4 py-3">
                    What it captures
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f) => (
                  <tr key={f.group} className="border-t border-line">
                    <th scope="row" className="px-4 py-3 font-semibold text-ink">
                      {f.group}
                    </th>
                    <td className="px-4 py-3 font-mono text-[12.5px] text-ink/80">{f.variables}</td>
                    <td className="px-4 py-3 text-muted">{f.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      </section>

      <section className="container-page py-12" aria-labelledby="method-heading">
        <SectionHeader eyebrow="Method" title={<span id="method-heading">From raw survey to explanation</span>} />
        <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {METHOD_STEPS.map((step, i) => (
            <li key={step.title} className="rounded-2xl border border-line bg-white p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 font-display text-sm font-semibold text-white">
                {i + 1}
              </span>
              <p className="mt-4 font-display font-semibold text-ink">{step.title}</p>
              <p className="mt-1.5 text-[13.5px] leading-6 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-line bg-white py-12" aria-labelledby="results-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="Results"
            title={<span id="results-heading">Where the results will appear</span>}
            intro="These panels will fill in once the model is trained. Until then they show only their shape, so nobody mistakes a mockup for a finding."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <PendingPanel title="What matters most" description="Average SHAP importance of each characteristic, all adults." />
            <PendingPanel
              title="Rural women"
              description="The same explanation for rural women, the group FinScope finds most vulnerable."
            />
            <PendingPanel
              title="Model quality and fairness"
              description="AUC and calibration overall and by sex, residence and disability."
            />
          </div>
        </div>
      </section>

      <section className="container-page grid gap-6 py-12 lg:grid-cols-[1fr_1fr]">
        <div>
          <SectionHeader eyebrow="Safeguards" title="What the model will not do" />
          <ul className="mt-6 space-y-3">
            {WILL_NOT.map((item) => (
              <li key={item} className="flex gap-3 rounded-xl border border-line bg-white p-4 text-[14px] leading-6 text-ink/85">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <SectionHeader eyebrow="In the meantime" title="What you can already explore" />
          <Callout title="Associations across districts">
            The page{" "}
            <Link href="/vulnerability" className="link">
              Where needs overlap
            </Link>{" "}
            shows which published indicators move together across districts. It describes places, not households, but it previews
            the patterns the model will test at household level.
          </Callout>
          <Callout title="Transparent priority rules">
            The page{" "}
            <Link href="/priorities" className="link">
              Where to act first
            </Link>{" "}
            uses stated rules on published data: explainable by design, with no model required.
          </Callout>
          <Callout title="Model card">
            When the model is trained, a model card (data, performance, fairness and limits) will be published with it, following
            the template in the repository (docs/model/model-card-template.md).
          </Callout>
        </div>
      </section>
    </>
  );
}
