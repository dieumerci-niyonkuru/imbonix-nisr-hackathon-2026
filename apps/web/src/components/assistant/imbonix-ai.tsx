"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { PaperAirplaneIcon, SparklesIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { StatusBadge } from "@/components/ui/status-badge";
import { answerQuery, SUGGESTIONS, type Answer } from "@/lib/assistant";

type Message = { id: number; role: "user" | "ai"; text?: string; answer?: Answer };

/** The opening message: what the assistant does, with example questions to click. */
const WELCOME: Answer = {
  heading: "Hi, I'm IMBONIX AI",
  body:
    "Ask me about any of Rwanda's 30 districts or the measures behind financial inclusion and poverty. I answer only " +
    "from NISR's published figures, and I name the source every time. Try one of these:",
};

function AnswerCard({ answer, onAsk }: { answer: Answer; onAsk: (query: string) => void }) {
  const showSuggestions = answer === WELCOME;
  return (
    <div className="rounded-2xl rounded-tl-sm border border-line bg-white p-3.5 shadow-card">
      <p className="text-[14.5px] font-bold leading-5 text-ink">{answer.heading}</p>
      <p className="mt-1 text-pretty text-[13.5px] leading-6 text-ink/80">{answer.body}</p>

      {answer.stats && answer.stats.length > 0 && (
        <dl className="mt-3 grid grid-cols-2 gap-2">
          {answer.stats.map((stat) => (
            <div key={stat.label} className="rounded-lg bg-paper px-3 py-2">
              <dd className="font-display text-[20px] font-bold leading-none tracking-[-0.02em] text-cyan-ink">{stat.value}</dd>
              <dt className="mt-1 text-[11.5px] leading-4 text-muted">{stat.label}</dt>
            </div>
          ))}
        </dl>
      )}

      {answer.rows && answer.rows.length > 0 && (
        <div className="mt-3 overflow-hidden rounded-lg ring-1 ring-line">
          {answer.rowsCaption && (
            <p className="bg-paper px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-[0.05em] text-muted">
              {answer.rowsCaption}
            </p>
          )}
          <ul className="divide-y divide-line">
            {answer.rows.map((row) => (
              <li key={row.label} className="flex items-baseline justify-between gap-3 px-3 py-1.5">
                <span className="min-w-0 text-[13px] font-semibold text-ink">
                  {row.label}
                  {row.hint && <span className="ml-1.5 text-[11.5px] font-normal text-muted">{row.hint}</span>}
                </span>
                <span className="tabular shrink-0 text-[13px] font-bold text-ink">{row.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {answer.source && (
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-line pt-2.5 text-[11.5px] leading-4 text-muted">
          {answer.status && <StatusBadge status={answer.status} />}
          {answer.source}
        </p>
      )}

      {answer.links && answer.links.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {answer.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center rounded-full bg-cyan-soft px-3 py-1 text-[12.5px] font-bold text-cyan-ink ring-1 ring-cyan/30 transition-colors hover:bg-cyan hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {showSuggestions && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onAsk(suggestion)}
              className="rounded-full bg-white px-3 py-1 text-left text-[12.5px] font-semibold text-ink ring-1 ring-line transition-colors hover:text-cyan-ink hover:ring-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * IMBONIX AI: a floating assistant that answers natural questions about Rwanda's districts and the measures behind
 * financial inclusion and poverty, straight from NISR's published figures, with the source on every answer. It runs
 * in the browser on the data the site already holds, so it needs no server and never invents a number.
 */
export function ImbonixAI() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ id: 0, role: "ai", answer: WELCOME }]);
  const nextId = useRef(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const ask = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const answer = answerQuery(trimmed);
    setMessages((current) => [
      ...current,
      { id: nextId.current++, role: "user", text: trimmed },
      { id: nextId.current++, role: "ai", answer },
    ]);
    setQuery("");
  };

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="fixed bottom-5 right-5 z-[55] inline-flex h-14 items-center gap-2 rounded-full bg-cyan pl-4 pr-5 font-bold text-ink shadow-lift ring-1 ring-cyan-ink/20 transition-colors hover:bg-cyan-ink hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink focus-visible:ring-offset-2 sm:bottom-6 sm:right-6 print:hidden"
      >
        <SparklesIcon className="h-6 w-6" aria-hidden="true" />
        <span className="text-[15px]">IMBONIX AI</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[55] bg-ink/40 sm:hidden" aria-hidden="true" onClick={() => setOpen(false)} />
          <div
            id={panelId}
            role="dialog"
            aria-label="IMBONIX AI assistant"
            aria-modal="false"
            className="fixed inset-x-3 bottom-3 top-16 z-[56] flex flex-col overflow-hidden rounded-3xl bg-paper shadow-lift ring-1 ring-line sm:inset-x-auto sm:bottom-24 sm:right-6 sm:top-auto sm:h-[min(620px,78vh)] sm:w-[400px]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan text-ink">
                  <SparklesIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-[15px] font-bold leading-4 text-ink">IMBONIX AI</p>
                  <p className="text-[11.5px] leading-4 text-muted">Answers from NISR data</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close the assistant"
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink ring-1 ring-line transition-colors hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div ref={logRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3.5">
              {messages.map((message) =>
                message.role === "user" ? (
                  <p
                    key={message.id}
                    className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-sm bg-cyan px-3.5 py-2 text-[13.5px] font-semibold text-ink"
                  >
                    {message.text}
                  </p>
                ) : (
                  <AnswerCard key={message.id} answer={message.answer!} onAsk={ask} />
                ),
              )}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                ask(query);
              }}
              className="flex items-center gap-2 border-t border-line bg-white p-3"
            >
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ask about a district or a measure…"
                aria-label="Ask IMBONIX AI"
                autoComplete="off"
                className="h-11 min-w-0 flex-1 rounded-full bg-paper px-4 text-[14.5px] text-ink ring-1 ring-line placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
              />
              <button
                type="submit"
                disabled={!query.trim()}
                aria-label="Send"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan text-ink transition-colors hover:bg-cyan-ink hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink disabled:opacity-40"
              >
                <PaperAirplaneIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </form>

            <p className="border-t border-line bg-paper px-4 py-1.5 text-center text-[11px] leading-4 text-muted">
              Grounded in published NISR figures. Not an official NISR product.
            </p>
          </div>
        </>
      )}
    </>
  );
}
