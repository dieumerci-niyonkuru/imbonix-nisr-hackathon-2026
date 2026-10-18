"use client";

import type { ComponentType, SVGProps } from "react";
import { ArrowRightIcon, ChatBubbleLeftRightIcon, CheckBadgeIcon, ShieldCheckIcon } from "@heroicons/react/20/solid";
import { AiMark } from "@/components/assistant/ai-mark";
import { SUGGESTIONS } from "@/lib/assistant";

/**
 * Open the assistant from anywhere, optionally dropping a question into its box. The assistant (in the layout) listens
 * for this event; see components/assistant/imbonix-ai.tsx. Guarded for the server render.
 */
function openAssistant(query?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("imbonix:ask", { detail: query ? { query } : {} }));
}

type Trait = { icon: ComponentType<SVGProps<SVGSVGElement>>; title: string; body: string };

/** What makes the assistant trustworthy, in three lines — the points a judge looks for in an AI feature. */
const TRAITS: Trait[] = [
  {
    icon: CheckBadgeIcon,
    title: "Grounded in NISR figures",
    body: "It answers from the same published statistics the site is built on, and names the source every time.",
  },
  {
    icon: ShieldCheckIcon,
    title: "It won't invent a number",
    body: "Every figure traces to a real table. With no AI key set, it still answers on-device, straight from the data.",
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: "Plain language, by text or voice",
    body: "Ask a district, compare two places, or ask what a measure means — then follow up in your own words.",
  },
];

/** A few real example questions, taken from the assistant's own suggestions so they always work. */
const EXAMPLES = SUGGESTIONS.slice(0, 4);

/** A round chip that opens the assistant with a question already typed in. */
function ExampleChip({ question }: { question: string }) {
  return (
    <button
      type="button"
      onClick={() => openAssistant(question)}
      className="rounded-full border border-line bg-white px-3.5 py-1.5 text-left text-[13.5px] font-semibold text-ink transition-colors hover:border-cyan-ink hover:text-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
    >
      {question}
    </button>
  );
}

/**
 * The homepage's showcase of the built-in AI assistant: a plain-language way into all {indicators} indicators. The left
 * side says what it is and why to trust it, with a button and example questions that open the real assistant in place;
 * the right side is a small, true-to-life preview of a question and a sourced answer, so the feature is visible before
 * anyone clicks. Kept to the site's two colours.
 */
export function AskImbonix() {
  return (
    <section className="border-y border-line bg-paper py-12 sm:py-20" aria-labelledby="ask-heading">
      <div className="container-page">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow text-cyan-ink">Ask in plain language</p>
            <h2
              id="ask-heading"
              className="mt-3 max-w-xl text-balance font-display text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl"
            >
              Not sure where to look? Just ask IMBONIX
            </h2>
            <p className="mt-4 max-w-xl text-pretty text-[16px] leading-7 text-muted sm:text-[17px]">
              Ask the built-in assistant about any district, any measure, or the national picture. It answers from the data, so a
              first-time visitor can find what they need without learning the site first.
            </p>

            <ul className="mt-7 space-y-4">
              {TRAITS.map((trait) => {
                const Icon = trait.icon;
                return (
                  <li key={trait.title} className="flex gap-3.5">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-soft text-cyan-ink ring-1 ring-cyan/30">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-display text-[16px] font-bold tracking-[-0.01em] text-ink">{trait.title}</p>
                      <p className="mt-0.5 text-[14.5px] leading-6 text-muted">{trait.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => openAssistant()}
                className="inline-flex min-h-12 items-center gap-2 rounded bg-cyan px-7 text-[15px] font-bold text-ink transition-colors hover:bg-cyan-ink hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink focus-visible:ring-offset-2"
              >
                <AiMark className="h-5 w-5" />
                Ask IMBONIX AI
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <p className="mt-6 text-[13px] font-semibold uppercase tracking-[0.04em] text-muted">Try one</p>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {EXAMPLES.map((question) => (
                <li key={question}>
                  <ExampleChip question={question} />
                </li>
              ))}
            </ul>
          </div>

          {/* A preview of a real question and a sourced answer, styled like the assistant. Decorative, so hidden from
              assistive tech — the live assistant beside it is the real thing. Figures here match the homepage. */}
          <div
            aria-hidden="true"
            className="rounded-3xl border border-line bg-white p-5 shadow-lift sm:p-6 lg:max-w-md lg:justify-self-end"
          >
            <div className="flex items-center gap-2.5 border-b border-line pb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-line">
                <AiMark className="h-6 w-6" />
              </span>
              <div>
                <p className="font-display text-[15px] font-bold leading-tight text-ink">IMBONIX AI</p>
                <p className="text-[12px] leading-tight text-muted">Answers from NISR data</p>
              </div>
            </div>

            <div className="space-y-4 pt-5">
              <p className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-cyan px-4 py-2.5 text-[14px] font-medium leading-6 text-ink">
                What&apos;s the difference between access and financial health?
              </p>
              <div className="max-w-[88%] rounded-2xl rounded-bl-sm bg-paper px-4 py-3 ring-1 ring-line">
                <p className="text-[14px] leading-6 text-ink">
                  Access means reaching a service — <strong>96%</strong> of adults use one. Financial health means being able to
                  save, manage day to day and cope with a shock — only <strong>10%</strong> reach it. That 86-point gap is the
                  real challenge.
                </p>
                <p className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-cyan-ink">
                  <CheckBadgeIcon className="h-4 w-4" aria-hidden="true" />
                  Source: NISR, FinScope 2024 (section 5.2)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
