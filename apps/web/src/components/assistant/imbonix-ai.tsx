"use client";

import Link from "next/link";
import { Fragment, type ReactNode, useEffect, useId, useRef, useState } from "react";
import {
  ArrowUpIcon,
  CheckIcon,
  ChevronRightIcon,
  ClipboardDocumentIcon,
  ClockIcon,
  MicrophoneIcon,
  PauseIcon,
  PencilIcon,
  PencilSquareIcon,
  PlayIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  StopIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { AiMark } from "@/components/assistant/ai-mark";
import { StatusBadge } from "@/components/ui/status-badge";
import { answerQuery, followUpSuggestions, type Answer } from "@/lib/assistant";
import { districtAt } from "@/lib/locate";

type ChatTurn = { role: "user" | "assistant"; text: string };
type Message = {
  id: number;
  role: "user" | "ai";
  text?: string;
  /** A grounded structured answer (the on-device engine, or the welcome). */
  answer?: Answer;
  /** A generative, streamed answer from the AI route (markdown-ish prose). */
  markdown?: string;
  streaming?: boolean;
  /** Contextual follow-up questions to offer as chips beneath this answer, from the question that prompted it. */
  followUps?: string[];
};

/** "Where I am" phrases — when the person uses one and their district is known, it is filled into the question. */
const LOCAL_REF = /\b(my (district|area|sector|place|home)|near me|around here|close to me|where i (am|live|stay))\b/i;
const MAX_HISTORY_TURNS = 12;

/** A past conversation the person can reopen, rename or delete. Kept per-browser in localStorage, never on a server. */
type SavedChat = { id: string; title: string; messages: Message[]; updatedAt: number };
const STORAGE_CHATS = "imbonix-ai-chats-v1";
const STORAGE_CURRENT = "imbonix-ai-current-v1";
const MAX_SAVED_CHATS = 40;

/** A short title for a saved chat, taken from its first question. */
function chatTitle(list: Message[]): string {
  const text = list.find((message) => message.role === "user" && message.text)?.text?.trim();
  if (!text) return "New chat";
  return text.length > 44 ? `${text.slice(0, 44)}…` : text;
}

/** A conversation is worth keeping once the person has actually asked something. */
function chatHasContent(list: Message[]): boolean {
  return list.some((message) => message.role === "user");
}

/** Strip transient flags before a conversation is stored or archived. */
function freezeMessages(list: Message[]): Message[] {
  return list.map((message) => ({ ...message, streaming: false }));
}

function relativeTime(timestamp: number): string {
  const minutes = Math.round((Date.now() - timestamp) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(timestamp).toLocaleDateString();
}

/** The opening message: a friendly greeting, with starter chips to tap. */
const WELCOME: Answer = {
  heading: "Hello! How can I help you today?",
  body:
    "Ask about Rwanda's poverty, financial inclusion or social protection — in your own words, by text or voice. " +
    "Every answer comes from NISR's published figures, with the source named.",
};

/** Short starter chips for the welcome — a friendly way in for first-time users. Each chip sends a fuller question the
 *  on-device engine answers well, so a first tap always lands on a real, sourced answer. */
const STARTERS: { label: string; query: string }[] = [
  { label: "Poverty", query: "Which districts have the highest poverty rates?" },
  { label: "Financial inclusion", query: "Compare financial inclusion across districts." },
  { label: "Social protection", query: "How does VUP reach people?" },
  { label: "Compare districts", query: "Compare Gasabo and Huye" },
  { label: "Gasabo", query: "What does the available data tell us about Gasabo?" },
];

// --- Voice: speech synthesis (read answers aloud) and speech recognition (dictate questions), both browser-native. ---

type RecognitionAlternative = { transcript: string };
type RecognitionResult = { isFinal: boolean; 0: RecognitionAlternative };
type RecognitionResultList = { readonly length: number; [index: number]: RecognitionResult };
type RecognitionEvent = { results: RecognitionResultList };
type RecognitionErrorEvent = { error?: string };
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function recognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const scope = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}

/**
 * Read text aloud, robustly. The text is split into sentence-sized utterances and queued, and a keep-alive timer nudges
 * the engine, because Chrome otherwise silently stops long speech after about fifteen seconds. onDone fires when the
 * whole answer has been read (or on error), so the caller can clear the speaking state.
 */
function speakText(text: string, onDone: () => void, isPaused: () => boolean) {
  const synthesis = window.speechSynthesis;
  synthesis.cancel();
  const chunks = (text.match(/[^.!?]+[.!?]*/g) ?? [text]).map((part) => part.trim()).filter(Boolean);
  if (chunks.length === 0) {
    onDone();
    return;
  }
  const keepAlive = window.setInterval(() => {
    // Nudge the engine so Chrome does not stall, but never fight a deliberate pause.
    if (synthesis.speaking && !isPaused()) synthesis.resume();
    else if (!synthesis.speaking) window.clearInterval(keepAlive);
  }, 9000);
  const finish = () => {
    window.clearInterval(keepAlive);
    onDone();
  };
  chunks.forEach((chunk, index) => {
    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.lang = "en-US";
    utterance.rate = 1;
    if (index === chunks.length - 1) {
      utterance.onend = finish;
      utterance.onerror = finish;
    }
    synthesis.speak(utterance);
  });
}

/** Flatten a streamed markdown answer to plain words for reading aloud. */
function plainFromMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/^#{1,3}\s+/gm, "")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Flatten a grounded answer (heading, body, figures, source) to plain words for reading aloud. */
function plainFromAnswer(answer: Answer): string {
  const parts = [answer.heading, answer.body];
  if (answer.rows?.length) parts.push(answer.rows.map((row) => `${row.label}: ${row.value}`).join(". "));
  if (answer.stats?.length) parts.push(answer.stats.map((stat) => `${stat.label}: ${stat.value}`).join(". "));
  if (answer.source) parts.push(`Source: ${answer.source}`);
  return parts.filter(Boolean).join(". ");
}

type Playback = "idle" | "playing" | "paused";

const roundBtn =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted ring-1 ring-line transition-colors hover:text-cyan-ink hover:ring-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink";

/** Read-aloud controls for one answer: play when idle; pause/resume and stop while it is being read. */
function PlaybackControls({
  state,
  onPlay,
  onPauseResume,
  onStop,
}: {
  state: Playback;
  onPlay: () => void;
  onPauseResume: () => void;
  onStop: () => void;
}) {
  if (state === "idle") {
    return (
      <button type="button" onClick={onPlay} aria-label="Read this answer aloud" className={roundBtn}>
        <SpeakerWaveIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  }
  return (
    <span className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={onPauseResume}
        aria-label={state === "paused" ? "Resume reading" : "Pause reading"}
        className={`${roundBtn} text-cyan-ink ring-cyan-ink`}
      >
        {state === "paused" ? (
          <PlayIcon className="h-4 w-4" aria-hidden="true" />
        ) : (
          <PauseIcon className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
      <button type="button" onClick={onStop} aria-label="Stop reading" className={roundBtn}>
        <StopIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </span>
  );
}

const LINK_STYLE =
  "font-semibold text-cyan-ink underline underline-offset-2 transition-colors hover:text-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink";

/** Copy an answer's text to the clipboard, with a brief confirmation. */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard blocked (e.g. insecure context); ignore.
        }
      }}
      aria-label={copied ? "Answer copied" : "Copy this answer"}
      className={roundBtn}
    >
      {copied ? (
        <CheckIcon className="h-4 w-4 text-cyan-ink" aria-hidden="true" />
      ) : (
        <ClipboardDocumentIcon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}

/** Render Markdown links, **bold** and `code` spans inside a line of assistant prose. */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    if (token.startsWith("[")) {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (link && link[2].startsWith("/")) {
        nodes.push(
          <Link key={key++} href={link[2]} className={LINK_STYLE}>
            {link[1]}
          </Link>,
        );
      } else if (link && /^https?:\/\//.test(link[2])) {
        nodes.push(
          <a key={key++} href={link[2]} target="_blank" rel="noreferrer" className={LINK_STYLE}>
            {link[1]}
          </a>,
        );
      } else {
        nodes.push(link ? link[1] : token);
      }
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong key={key++} className="font-bold text-ink">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      nodes.push(
        <code key={key++} className="rounded bg-paper px-1 py-0.5 text-[12px] text-cyan-ink">
          {token.slice(1, -1)}
        </code>,
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** A light markdown renderer for streamed answers: paragraphs, bullet and numbered lists, and simple headings. */
function RichText({ text }: { text: string }) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((block) => block.replace(/\s+$/, ""))
    .filter(Boolean);
  return (
    <div className="space-y-2 text-[13.5px] leading-6 text-ink/90">
      {paragraphs.map((block, index) => {
        const lines = block.split("\n");
        const tableRows = lines.filter((line) => line.trim().startsWith("|"));
        if (tableRows.length >= 2 && tableRows.length === lines.length && /^[\s:|-]+$/.test(tableRows[1])) {
          const cells = (row: string) =>
            row
              .trim()
              .replace(/^\||\|$/g, "")
              .split("|")
              .map((cell) => cell.trim());
          const header = cells(tableRows[0]);
          const body = tableRows.slice(2).map(cells);
          return (
            <div key={index} className="overflow-x-auto">
              <table className="w-full overflow-hidden rounded-lg text-[12.5px] ring-1 ring-line">
                <thead className="bg-paper">
                  <tr>
                    {header.map((cell, column) => (
                      <th key={column} className="px-2.5 py-1.5 text-left font-bold text-ink">
                        {renderInline(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {body.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, column) => (
                        <td
                          key={column}
                          className={`px-2.5 py-1.5 align-top ${column === 0 ? "font-semibold text-ink" : "tabular text-ink/90"}`}
                        >
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (lines.every((line) => /^\s*[-*]\s+/.test(line))) {
          return (
            <ul key={index} className="list-disc space-y-1 pl-5 marker:text-cyan-ink">
              {lines.map((line, item) => (
                <li key={item}>{renderInline(line.replace(/^\s*[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((line) => /^\s*\d+\.\s+/.test(line))) {
          return (
            <ol key={index} className="list-decimal space-y-1 pl-5 marker:text-cyan-ink">
              {lines.map((line, item) => (
                <li key={item}>{renderInline(line.replace(/^\s*\d+\.\s+/, ""))}</li>
              ))}
            </ol>
          );
        }
        const heading = lines.length === 1 ? block.match(/^#{1,3}\s+(.*)$/) : null;
        if (heading) {
          return (
            <p key={index} className="pt-1 text-[11.5px] font-bold uppercase tracking-[0.05em] text-cyan-ink">
              {renderInline(heading[1])}
            </p>
          );
        }
        return (
          <p key={index} className="text-pretty">
            {lines.map((line, row) => (
              <Fragment key={row}>
                {row > 0 && <br />}
                {renderInline(line)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

type SpeakProps = {
  canSpeak: boolean;
  playback: Playback;
  onPlay: () => void;
  onPauseResume: () => void;
  onStop: () => void;
};

/** A streamed, generative answer with a typing indicator while it arrives, and read-aloud controls once it is done. */
function StreamedCard({
  markdown,
  streaming,
  canSpeak,
  playback,
  onPlay,
  onPauseResume,
  onStop,
}: { markdown: string; streaming?: boolean } & SpeakProps) {
  return (
    <div className="rounded-2xl rounded-tl-sm border border-line bg-white p-3.5 shadow-card">
      {markdown ? (
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <RichText text={markdown} />
          </div>
          {!streaming && (
            <span className="flex shrink-0 items-center gap-1">
              <CopyButton text={plainFromMarkdown(markdown)} />
              {canSpeak && <PlaybackControls state={playback} onPlay={onPlay} onPauseResume={onPauseResume} onStop={onStop} />}
            </span>
          )}
        </div>
      ) : (
        <span
          className="flex items-center gap-2 py-1 text-[12.5px] font-semibold text-cyan-ink"
          aria-label="IMBONIX AI is thinking"
          aria-live="polite"
        >
          <span className="flex gap-1" aria-hidden="true">
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-ink motion-reduce:animate-none"
                style={{ animationDelay: `${dot * 160}ms` }}
              />
            ))}
          </span>
          IMBONIX AI is thinking…
        </span>
      )}
      {streaming && markdown && <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-cyan-ink align-middle" />}
    </div>
  );
}

function AnswerCard({
  answer,
  onAsk,
  canSpeak,
  playback,
  onPlay,
  onPauseResume,
  onStop,
}: { answer: Answer; onAsk: (query: string) => void } & SpeakProps) {
  const showSuggestions = answer === WELCOME;
  return (
    <div className="rounded-2xl rounded-tl-sm border border-line bg-white p-3.5 shadow-card">
      <div className="flex items-start gap-2">
        <p className="min-w-0 flex-1 text-[14.5px] font-bold leading-5 text-ink">{answer.heading}</p>
        <span className="flex shrink-0 items-center gap-1">
          {!showSuggestions && <CopyButton text={plainFromAnswer(answer)} />}
          {canSpeak && <PlaybackControls state={playback} onPlay={onPlay} onPauseResume={onPauseResume} onStop={onStop} />}
        </span>
      </div>
      <p className="mt-1 text-pretty text-[13.5px] leading-6 text-ink/80">{answer.body}</p>

      {answer.stats && answer.stats.length > 0 && (
        <dl className="mt-3 grid grid-cols-2 gap-2">
          {answer.stats.map((stat) => (
            <div key={stat.label} className="rounded-xl bg-cyan-soft/60 px-3 py-2.5 ring-1 ring-cyan/15">
              <dd className="font-display text-[21px] font-bold leading-none tracking-[-0.02em] text-cyan-ink">{stat.value}</dd>
              <dt className="mt-1 text-[11.5px] leading-4 text-ink/70">{stat.label}</dt>
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
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">You can start with</p>
          <div className="flex flex-wrap gap-1.5">
            {STARTERS.map((starter) => (
              <button
                key={starter.label}
                type="button"
                onClick={() => onAsk(starter.query)}
                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-ink ring-1 ring-line transition-colors hover:bg-cyan-soft/60 hover:text-cyan-ink hover:ring-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
              >
                {starter.label}
                <ChevronRightIcon className="h-3.5 w-3.5 text-cyan-ink" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * The contextual follow-up questions shown beneath an answer: a few next things to ask, shaped by the question that
 * prompted the answer. Clicking one asks it, keeping the conversation going. Nothing renders when there are none.
 */
function FollowUps({ items, onAsk }: { items?: string[]; onAsk: (query: string) => void }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 pl-1" aria-label="Suggested follow-up questions">
      {items.map((question) => (
        <button
          key={question}
          type="button"
          onClick={() => void onAsk(question)}
          className="rounded-full bg-white px-3 py-1.5 text-left text-[12.5px] font-semibold text-cyan-ink ring-1 ring-line transition-colors hover:bg-cyan-soft hover:ring-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
        >
          {question}
        </button>
      ))}
    </div>
  );
}

/**
 * IMBONIX AI: a floating assistant that answers questions about Rwanda's financial inclusion and poverty. When the
 * site's AI service is connected it uses a grounded Claude model; when it isn't, it falls back to an instant on-device
 * engine over the same NISR figures. People can type or speak their question and have answers read back aloud. Either
 * way it answers only from NISR's published data and names the source, and never invents a number.
 */
export function ImbonixAI() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ id: 0, role: "ai", answer: WELCOME }]);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /** null while unknown, then whether the server has the AI service connected. */
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const [canListen, setCanListen] = useState(false);
  const [listening, setListening] = useState(false);
  /** When on, every answer is read aloud; a voice question is always read aloud regardless. */
  const [autoSpeak, setAutoSpeak] = useState(false);
  const nextId = useRef(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  /** The id of an answer whose top should be brought to the top of the panel once it is ready (null = follow the bottom). */
  const scrollTopRef = useRef<number | null>(null);
  /** The person's district from IP-based location — used only as silent context for "my district"/"near me", never shown. */
  const locationRef = useRef<{ name: string; slug: string } | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  /** True when the person tapped the mic to stop — vs the browser ending on a pause, which we resume through. */
  const manualStopRef = useRef(false);
  /** Everything heard so far in the current dictation, kept across the browser's internal restarts on a pause. */
  const transcriptRef = useRef("");
  const sessionStartRef = useRef(0);
  /** Set when the person sends mid-dictation, so the final transcript is not written back into the (now sent) box. */
  const discardNextRef = useRef(false);
  /** Past conversations (per-browser), the open history list, and an in-progress rename. */
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  /** True once localStorage has been read, so the save effects don't overwrite it before it loads. */
  const [hydrated, setHydrated] = useState(false);

  const probe = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/assistant");
      const data = (await response.json()) as { configured?: boolean; lat?: number; lng?: number };
      const ok = Boolean(data.configured);
      setConfigured(ok);
      // Resolve the person's district from the IP-based coordinates the server returned (no prompt). Silent context only.
      if (!locationRef.current && typeof data.lat === "number" && typeof data.lng === "number") {
        void districtAt(data.lat, data.lng).then((hit) => {
          locationRef.current = hit;
        });
      }
      return ok;
    } catch {
      setConfigured(false);
      return false;
    }
  };

  const historyFrom = (list: Message[]): ChatTurn[] =>
    list
      .filter((message) => message.answer !== WELCOME)
      .map((message): ChatTurn | null => {
        if (message.role === "user") return { role: "user", text: message.text ?? "" };
        const text = message.markdown ?? message.answer?.body ?? "";
        return text ? { role: "assistant", text } : null;
      })
      .filter((turn): turn is ChatTurn => turn !== null)
      .slice(-MAX_HISTORY_TURNS);

  // Restore saved chats and the last open conversation from this browser, once, on mount.
  useEffect(() => {
    try {
      const rawChats = localStorage.getItem(STORAGE_CHATS);
      if (rawChats) {
        const parsed = JSON.parse(rawChats) as SavedChat[];
        if (Array.isArray(parsed)) setSavedChats(parsed.slice(0, MAX_SAVED_CHATS));
      }
      const rawCurrent = localStorage.getItem(STORAGE_CURRENT);
      if (rawCurrent) {
        const parsed = JSON.parse(rawCurrent) as Message[];
        if (Array.isArray(parsed) && parsed.length && chatHasContent(parsed)) {
          const clean = freezeMessages(parsed);
          setMessages(clean);
          nextId.current = Math.max(0, ...clean.map((message) => message.id)) + 1;
        }
      }
    } catch {
      // Ignore private-mode or corrupt storage; the assistant still works without history.
    }
    setHydrated(true);
  }, []);

  // Persist the chat list, and the open conversation (only when idle, so streaming doesn't thrash localStorage).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_CHATS, JSON.stringify(savedChats.slice(0, MAX_SAVED_CHATS)));
    } catch {
      /* storage may be unavailable */
    }
  }, [savedChats, hydrated]);
  useEffect(() => {
    if (!hydrated || busy) return;
    try {
      localStorage.setItem(STORAGE_CURRENT, JSON.stringify(freezeMessages(messages)));
    } catch {
      /* storage may be unavailable */
    }
  }, [messages, busy, hydrated]);

  /** Move the current conversation into the saved list (if it has any questions in it). */
  const archiveInto = (list: SavedChat[]): SavedChat[] => {
    if (!chatHasContent(messages)) return list;
    const entry: SavedChat = {
      id: `c${Date.now()}`,
      title: chatTitle(messages),
      messages: freezeMessages(messages),
      updatedAt: Date.now(),
    };
    return [entry, ...list].slice(0, MAX_SAVED_CHATS);
  };

  /** Start a fresh conversation, archiving the current one first. */
  const startNewChat = () => {
    if (busy) return;
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* speech may be unavailable */
    }
    setSavedChats((list) => archiveInto(list));
    setMessages([{ id: 0, role: "ai", answer: WELCOME }]);
    nextId.current = 1;
    setQuery("");
    setNotice(null);
    setSpeakingId(null);
    setHistoryOpen(false);
  };

  /** Reopen a saved chat, archiving the current one and taking the chosen one out of the list. */
  const openChat = (id: string) => {
    if (busy) return;
    const chat = savedChats.find((entry) => entry.id === id);
    if (!chat) return;
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* speech may be unavailable */
    }
    setSavedChats((list) => archiveInto(list.filter((entry) => entry.id !== id)));
    const clean = freezeMessages(chat.messages);
    setMessages(clean);
    nextId.current = Math.max(0, ...clean.map((message) => message.id)) + 1;
    setSpeakingId(null);
    setHistoryOpen(false);
  };

  const beginRename = (chat: SavedChat) => {
    setRenamingId(chat.id);
    setRenameDraft(chat.title);
  };
  const commitRename = () => {
    const title = renameDraft.trim();
    setSavedChats((list) => list.map((entry) => (entry.id === renamingId ? { ...entry, title: title || entry.title } : entry)));
    setRenamingId(null);
  };
  const deleteChat = (id: string) => {
    setSavedChats((list) => list.filter((entry) => entry.id !== id));
    if (renamingId === id) setRenamingId(null);
  };

  /** Start reading an answer aloud and track it as the one currently playing. */
  const speakAnswer = (id: number, text: string) => {
    if (!canSpeak || !text) return;
    pausedRef.current = false;
    setPaused(false);
    setSpeakingId(id);
    speakText(
      text,
      () =>
        setSpeakingId((current) => {
          if (current === id) {
            pausedRef.current = false;
            setPaused(false);
            return null;
          }
          return current;
        }),
      () => pausedRef.current,
    );
  };

  /** Pause or resume the answer currently being read. */
  const togglePause = () => {
    if (pausedRef.current) {
      pausedRef.current = false;
      setPaused(false);
      window.speechSynthesis.resume();
    } else {
      pausedRef.current = true;
      setPaused(true);
      window.speechSynthesis.pause();
    }
  };

  /** Stop reading entirely. */
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    pausedRef.current = false;
    setPaused(false);
    setSpeakingId(null);
  };

  /** The playback state for one answer, for its read-aloud controls. */
  const playbackFor = (id: number): Playback => (speakingId !== id ? "idle" : paused ? "paused" : "playing");

  const ask = async (rawText: string, fromVoice = false) => {
    const text = rawText.trim();
    if (!text || busy) return;
    const readAloud = (fromVoice || autoSpeak) && canSpeak;
    setNotice(null);

    const priorHistory = historyFrom(messages);
    // Sending a question: show it at the bottom; the answer that follows will be scrolled to its top when ready.
    scrollTopRef.current = null;
    setMessages((current) => [...current, { id: nextId.current++, role: "user", text }]);
    setQuery("");
    setBusy(true);

    // Contextual follow-up questions to offer beneath this answer, shaped by what was just asked.
    const followUps = text ? followUpSuggestions(text) : [];

    // Silent location context (only if the person allowed it): fill "my district"/"near me" for the on-device engine,
    // and give the live model a short note it uses only when the question refers to the person's own area.
    const loc = locationRef.current;
    const localizedText = loc && LOCAL_REF.test(text) ? `${text} (in ${loc.name} district)` : text;
    const locationNote = loc
      ? ` [Location context — the person is in ${loc.name} district. Use it only when they refer to "my district", "my area", "here" or "near me", and never state their location unless they ask.]`
      : "";

    const live = configured ?? (await probe());

    if (!live) {
      const answer = answerQuery(localizedText);
      const id = nextId.current++;
      setMessages((current) => [...current, { id, role: "ai", answer, followUps }]);
      scrollTopRef.current = id;
      setBusy(false);
      if (readAloud) speakAnswer(id, plainFromAnswer(answer));
      return;
    }

    const aiId = nextId.current++;
    scrollTopRef.current = aiId;
    setMessages((current) => [...current, { id: aiId, role: "ai", markdown: "", streaming: true, followUps }]);

    const update = (patch: Partial<Message>) =>
      setMessages((current) => current.map((message) => (message.id === aiId ? { ...message, ...patch } : message)));

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...priorHistory, { role: "user", text: text + locationNote }] }),
      });

      if (response.status === 503) {
        setConfigured(false);
        update({ streaming: false, markdown: undefined, answer: answerQuery(text) });
        return;
      }
      if (!response.ok || !response.body) {
        if (response.status === 429) {
          update({ streaming: false, markdown: "I'm getting a lot of questions right now. Please try again in a moment." });
        } else {
          // The model was briefly unavailable (e.g. busy). Answer from the on-device engine so the person still
          // gets a grounded reply instead of an error.
          update({ streaming: false, markdown: undefined, answer: answerQuery(text) });
        }
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        update({ markdown: accumulated });
      }
      const finalText = accumulated || "I don't have anything to add there.";
      update({ markdown: finalText, streaming: false });
      if (readAloud) speakAnswer(aiId, plainFromMarkdown(finalText));
    } catch {
      setMessages((current) =>
        current.map((message) =>
          message.id === aiId
            ? { ...message, streaming: false, markdown: message.markdown || "Sorry, I lost the connection. Please try again." }
            : message,
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  /**
   * Start continuous dictation. A pause no longer ends it — the browser's own stop on a short silence is resumed, so the
   * person can think mid-sentence; only tapping the mic (or Send) stops it. What is heard is kept in the box to send.
   */
  const startRecognition = () => {
    const Ctor = recognitionCtor();
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    let sessionFinal = "";
    recognition.onresult = (event) => {
      sessionFinal = "";
      let interim = "";
      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) sessionFinal += `${result[0].transcript} `;
        else interim += result[0].transcript;
      }
      setQuery(`${transcriptRef.current}${sessionFinal}${interim}`.replace(/\s+/g, " ").trimStart());
    };
    recognition.onerror = (event) => {
      const code = event.error;
      // A pause (no-speech) or a benign abort: do nothing — onend will resume, so a thinking pause never cuts them off.
      if (code === "no-speech" || code === "aborted") return;
      manualStopRef.current = true;
      if (code === "not-allowed" || code === "service-not-allowed")
        setNotice("Microphone blocked. Allow the microphone for this site in your browser, then tap the mic again.");
      else if (code === "audio-capture") setNotice("No microphone found. Check your mic, then try again.");
      else if (code === "network") setNotice("Voice needs a connection right now — please try again in a moment.");
    };
    recognition.onend = () => {
      transcriptRef.current = `${transcriptRef.current}${sessionFinal}`.replace(/\s+/g, " ");
      sessionFinal = "";
      // Ended on its own (a pause) while the person is still dictating and no real error occurred: resume listening.
      const ranBriefly = Date.now() - sessionStartRef.current < 400;
      if (!manualStopRef.current && recognitionRef.current === recognition && !ranBriefly) {
        sessionStartRef.current = Date.now();
        try {
          recognition.start();
          return;
        } catch {
          // Could not resume (browser limit): fall through and let them send what we have.
        }
      }
      recognitionRef.current = null;
      setListening(false);
      const spoken = transcriptRef.current.trim();
      if (spoken && !discardNextRef.current) {
        setQuery(spoken);
        window.setTimeout(() => inputRef.current?.focus(), 40);
      }
      discardNextRef.current = false;
    };
    recognitionRef.current = recognition;
    sessionStartRef.current = Date.now();
    setListening(true);
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setListening(false);
    }
  };

  /** Tap the mic to start; tap again to stop. Stopping leaves the words in the box, so the person chooses when to send. */
  const toggleListen = () => {
    if (listening) {
      manualStopRef.current = true;
      recognitionRef.current?.stop();
      return;
    }
    setNotice(null);
    manualStopRef.current = false;
    discardNextRef.current = false;
    transcriptRef.current = "";
    setQuery("");
    startRecognition();
  };

  /** Send the current question. If dictation is running, stop it first and keep the text that was spoken. */
  const submitQuery = () => {
    if (listening) {
      discardNextRef.current = true;
      manualStopRef.current = true;
      recognitionRef.current?.stop();
    }
    void ask(query);
  };

  useEffect(() => {
    setCanSpeak(typeof window !== "undefined" && "speechSynthesis" in window);
    setCanListen(recognitionCtor() !== null);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
      recognitionRef.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      if (configured === null) void probe();
    } else {
      if (canSpeak) window.speechSynthesis.cancel();
      pausedRef.current = false;
      setPaused(false);
      setSpeakingId(null);
      recognitionRef.current?.stop();
    }
    // probe runs once; configured guards it. canSpeak is read, not a trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  useEffect(() => {
    const log = logRef.current;
    if (!log) return;
    const last = messages[messages.length - 1];
    // While an answer is still streaming in, follow it to the bottom so the person sees it generate.
    if (last?.role === "ai" && last.streaming) {
      log.scrollTo({ top: log.scrollHeight, behavior: "smooth" });
      return;
    }
    // When an answer is ready, put its START at the top of the panel so it reads from the top; then stop tracking it.
    const topId = scrollTopRef.current;
    if (topId != null) {
      const el = log.querySelector<HTMLElement>(`[data-msg-id="${topId}"]`);
      if (el) {
        const target = log.scrollTop + el.getBoundingClientRect().top - log.getBoundingClientRect().top;
        log.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
        scrollTopRef.current = null;
        return;
      }
    }
    log.scrollTo({ top: log.scrollHeight, behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  // Any part of the site can open the assistant, and optionally drop a question into the box, by dispatching
  // window.dispatchEvent(new CustomEvent("imbonix:ask", { detail: { query } })). The homepage's "Ask IMBONIX"
  // section uses this so its button and example questions launch the assistant in place.
  useEffect(() => {
    const onAsk = (event: Event) => {
      const query = (event as CustomEvent<{ query?: string }>).detail?.query;
      setOpen(true);
      if (query) {
        setQuery(query);
        window.setTimeout(() => inputRef.current?.focus(), 60);
      }
    };
    window.addEventListener("imbonix:ask", onAsk);
    return () => window.removeEventListener("imbonix:ask", onAsk);
  }, []);

  return (
    <>
      {/* The launcher: a round IMBONIX mark that stays small, then opens out to "Ask IMBONIX AI" on hover or focus — so it
          is short until wanted, and clearly the assistant once it is. Its whole look (disc size, gradient, how fast it
          opens, the halo) is set by CSS variables on .ai-launcher in globals.css, so it is easy to restyle. */}
      <div className="ai-launcher fixed bottom-5 right-4 z-[55] sm:bottom-6 sm:right-6 print:hidden">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? "Close IMBONIX AI" : "Ask IMBONIX AI"}
          className="ai-fab shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink focus-visible:ring-offset-2"
        >
          {/* A breathing glow and a slowly rotating gradient ring make the mark feel alive; both settle under reduced motion. */}
          {!open && <span className="ai-fab-glow" aria-hidden="true" />}
          {!open && <span className="ai-fab-ring" aria-hidden="true" />}
          {/* When open, a calm solid ring with a close icon, so it reads clearly as "close". */}
          {open && <span className="absolute inset-0 rounded-full bg-cyan-ink" aria-hidden="true" />}
          <span className="ai-fab-core">
            {open ? <XMarkIcon className="h-6 w-6 text-cyan-ink" aria-hidden="true" /> : <AiMark className="h-7 w-7" />}
          </span>
          {/* A small, always-on "AI" badge, so the button reads as the assistant at a glance even before anyone hovers. */}
          {!open && (
            <span className="pointer-events-none absolute -bottom-1 -right-1 rounded-full bg-cyan-ink px-1.5 py-[1px] font-display text-[10px] font-extrabold leading-tight tracking-wide text-white shadow-sm ring-2 ring-white">
              AI
            </span>
          )}
          {/* The full name as a small tooltip on hover/focus (desktop); on phones the circular badge speaks for itself. */}
          {!open && (
            <span className="ai-fab-label pointer-events-none absolute right-full top-1/2 mr-3 whitespace-nowrap rounded-full bg-ink/90 px-3 py-1.5 font-display text-[13px] font-semibold text-white opacity-0 shadow-lift">
              Ask IMBONIX AI
            </span>
          )}
        </button>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-[55] bg-ink/40 sm:hidden" aria-hidden="true" onClick={() => setOpen(false)} />
          <div
            id={panelId}
            role="dialog"
            aria-label="IMBONIX AI assistant"
            aria-modal="false"
            className="fixed inset-x-3 bottom-3 top-16 z-[56] flex flex-col overflow-hidden rounded-3xl bg-paper shadow-lift ring-1 ring-line motion-safe:animate-fade-up sm:inset-x-auto sm:bottom-24 sm:right-6 sm:top-auto sm:h-[min(620px,78vh)] sm:w-[400px]"
          >
            {/* A thin brand-gradient accent across the very top, for a premium, finished feel. */}
            <span className="h-1 w-full shrink-0 bg-gradient-to-r from-cyan via-cyan-ink to-cyan" aria-hidden="true" />
            <div className="flex items-center justify-between gap-3 border-b border-line bg-gradient-to-b from-white to-cyan-soft/40 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="ai-ring-static flex h-9 w-9 items-center justify-center rounded-full p-[2.5px] shadow-sm">
                  <span className="flex h-full w-full items-center justify-center rounded-full bg-white">
                    <AiMark className="h-6 w-6" />
                  </span>
                </span>
                <div>
                  <p className="font-display text-[15px] font-bold leading-4 text-ink">
                    IMBONIX <span className="text-cyan-ink">AI</span>
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] leading-4 text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan motion-safe:animate-pulse" aria-hidden="true" />
                    Grounded in NISR data
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={startNewChat}
                  disabled={busy}
                  aria-label="New chat"
                  title="New chat"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink ring-1 ring-line transition-colors hover:bg-paper hover:text-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink disabled:opacity-40"
                >
                  <PencilSquareIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryOpen((value) => !value)}
                  aria-label="Chat history"
                  aria-expanded={historyOpen}
                  title="Chat history"
                  className={
                    historyOpen
                      ? "flex h-9 w-9 items-center justify-center rounded-full bg-cyan text-ink ring-1 ring-cyan transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
                      : "flex h-9 w-9 items-center justify-center rounded-full text-ink ring-1 ring-line transition-colors hover:bg-paper hover:text-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
                  }
                >
                  <ClockIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                {canSpeak && (
                  <button
                    type="button"
                    onClick={() => {
                      setAutoSpeak((value) => {
                        if (value) {
                          window.speechSynthesis.cancel();
                          pausedRef.current = false;
                          setPaused(false);
                          setSpeakingId(null);
                        }
                        return !value;
                      });
                    }}
                    aria-pressed={autoSpeak}
                    aria-label={autoSpeak ? "Turn off reading answers aloud" : "Read every answer aloud"}
                    title={autoSpeak ? "Reading answers aloud: on" : "Read answers aloud"}
                    className={
                      autoSpeak
                        ? "flex h-9 w-9 items-center justify-center rounded-full bg-cyan text-ink ring-1 ring-cyan transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
                        : "flex h-9 w-9 items-center justify-center rounded-full text-ink ring-1 ring-line transition-colors hover:bg-paper hover:text-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
                    }
                  >
                    {autoSpeak ? (
                      <SpeakerWaveIcon className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <SpeakerXMarkIcon className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close the assistant"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink ring-1 ring-line transition-colors hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
                >
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {historyOpen && (
              <div className="absolute inset-x-0 bottom-0 top-16 z-30 flex flex-col rounded-b-3xl bg-white">
                <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                  <p className="font-display text-[13px] font-bold text-ink">Your chats</p>
                  <button
                    type="button"
                    onClick={() => setHistoryOpen(false)}
                    aria-label="Close chat history"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-ink ring-1 ring-line transition-colors hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
                  >
                    <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto p-2">
                  {savedChats.length === 0 ? (
                    <p className="px-4 py-8 text-center text-[12.5px] leading-5 text-muted">
                      No saved chats yet. When you start a new chat, the one you were in is saved here so you can come back to it.
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {savedChats.map((chat) => (
                        <li key={chat.id} className="flex items-center gap-1 rounded-xl px-1.5 py-1 hover:bg-cyan-soft/50">
                          {renamingId === chat.id ? (
                            <>
                              <input
                                autoFocus
                                value={renameDraft}
                                onChange={(event) => setRenameDraft(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") commitRename();
                                  if (event.key === "Escape") setRenamingId(null);
                                }}
                                aria-label="Chat name"
                                className="min-w-0 flex-1 rounded-lg border border-cyan-ink bg-white px-2 py-1 text-[13px] text-ink focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={commitRename}
                                aria-label="Save name"
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-cyan-ink hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
                              >
                                <CheckIcon className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => openChat(chat.id)}
                                className="min-w-0 flex-1 rounded-lg px-2 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
                              >
                                <span className="block truncate text-[13px] font-semibold text-ink">{chat.title}</span>
                                <span className="block text-[11px] text-muted">{relativeTime(chat.updatedAt)}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => beginRename(chat)}
                                aria-label={`Rename chat: ${chat.title}`}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-white hover:text-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
                              >
                                <PencilIcon className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteChat(chat.id)}
                                aria-label={`Delete chat: ${chat.title}`}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-white hover:text-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
                              >
                                <TrashIcon className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="border-t border-line p-2">
                  <button
                    type="button"
                    onClick={startNewChat}
                    disabled={busy}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-cyan-soft px-3 py-2 text-[13px] font-bold text-cyan-ink ring-1 ring-cyan/30 transition-colors hover:bg-cyan hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink disabled:opacity-40"
                  >
                    <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
                    New chat
                  </button>
                </div>
              </div>
            )}

            <div ref={logRef} data-lenis-prevent className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3.5">
              {messages.map((message) => {
                if (message.role === "user") {
                  return (
                    <div key={message.id} className="ml-auto w-fit max-w-[85%] space-y-1">
                      {message.text && (
                        <p className="ml-auto w-fit rounded-2xl rounded-tr-sm bg-cyan px-3.5 py-2 text-[13.5px] font-semibold text-ink">
                          {message.text}
                        </p>
                      )}
                    </div>
                  );
                }
                if (message.markdown !== undefined) {
                  return (
                    <div key={message.id} data-msg-id={message.id} className="space-y-2">
                      <StreamedCard
                        markdown={message.markdown}
                        streaming={message.streaming}
                        canSpeak={canSpeak}
                        playback={playbackFor(message.id)}
                        onPlay={() => speakAnswer(message.id, plainFromMarkdown(message.markdown ?? ""))}
                        onPauseResume={togglePause}
                        onStop={stopSpeaking}
                      />
                      {!message.streaming && <FollowUps items={message.followUps} onAsk={ask} />}
                    </div>
                  );
                }
                return (
                  <div key={message.id} data-msg-id={message.id} className="space-y-2">
                    <AnswerCard
                      answer={message.answer!}
                      onAsk={ask}
                      canSpeak={canSpeak}
                      playback={playbackFor(message.id)}
                      onPlay={() => speakAnswer(message.id, plainFromAnswer(message.answer!))}
                      onPauseResume={togglePause}
                      onStop={stopSpeaking}
                    />
                    <FollowUps items={message.followUps} onAsk={ask} />
                  </div>
                );
              })}
            </div>

            {notice && (
              <p className="border-t border-line bg-white px-4 py-1.5 text-[12px] leading-4 text-destructive" role="status">
                {notice}
              </p>
            )}

            <form
              onSubmit={(event) => {
                event.preventDefault();
                submitQuery();
              }}
              className="flex items-center gap-2 border-t border-line bg-white p-3"
            >
              {canListen && (
                <button
                  type="button"
                  onClick={toggleListen}
                  aria-pressed={listening}
                  aria-label={listening ? "Stop listening" : "Ask by voice"}
                  title={listening ? "Stop listening" : "Ask by voice"}
                  className={
                    listening
                      ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-destructive text-white ring-1 ring-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive motion-safe:animate-pulse"
                      : "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink ring-1 ring-line transition-colors hover:bg-paper hover:text-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
                  }
                >
                  <MicrophoneIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={listening ? "Listening…" : "Ask IMBONIX…"}
                aria-label="Ask IMBONIX AI"
                autoComplete="off"
                className="h-11 min-w-0 flex-1 rounded-full bg-paper px-4 text-[14.5px] text-ink ring-1 ring-line placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
              />
              <button
                type="submit"
                disabled={busy || !query.trim()}
                aria-label={busy ? "IMBONIX AI is answering" : "Send"}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan text-ink transition-colors hover:bg-cyan-ink hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink disabled:opacity-60"
              >
                {busy ? (
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                ) : (
                  <ArrowUpIcon className="h-5 w-5 stroke-2" aria-hidden="true" />
                )}
              </button>
            </form>

            <p className="border-t border-line bg-paper px-4 py-1.5 text-center text-[11px] leading-4 text-muted">
              IMBONIX AI can make mistakes. Please double-check with official sources. Not an official NISR product.
            </p>
          </div>
        </>
      )}
    </>
  );
}
