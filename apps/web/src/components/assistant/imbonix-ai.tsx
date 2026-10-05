"use client";

import Link from "next/link";
import { Fragment, type ReactNode, useEffect, useId, useRef, useState } from "react";
import {
  MicrophoneIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  SparklesIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { StatusBadge } from "@/components/ui/status-badge";
import { answerQuery, SUGGESTIONS, type Answer } from "@/lib/assistant";
import { BRAND } from "@/lib/palette";

/** An image, PDF or text file the person attached, ready to send to the AI route. */
type Attachment = { kind: "image" | "document" | "text"; mediaType: string; data: string; name: string };
type ChatTurn = { role: "user" | "assistant"; text: string };
type Message = {
  id: number;
  role: "user" | "ai";
  text?: string;
  attachmentName?: string;
  /** A grounded structured answer (the on-device engine, or the welcome). */
  answer?: Answer;
  /** A generative, streamed answer from the AI route (markdown-ish prose). */
  markdown?: string;
  streaming?: boolean;
};

const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);
const MAX_BINARY_BYTES = 6 * 1024 * 1024;
const MAX_TEXT_CHARS = 20_000;
const MAX_HISTORY_TURNS = 12;

/** The opening message: what the assistant does, with example questions to click. */
const WELCOME: Answer = {
  heading: "Hi, I'm IMBONIX AI",
  body:
    "Ask me anything about Rwanda's poverty and financial inclusion — a district, a measure, the national picture, where " +
    "things are worst, how two places compare, or what the data means. I answer from NISR's published figures and name " +
    "the source every time. You can type or speak, attach a picture or document for me to read, and have my answers read " +
    "back to you. Try one of these:",
};

/** Shown when someone attaches a file but the AI service isn't connected. */
const NOT_CONNECTED: Answer = {
  heading: "File reading needs the AI service",
  body:
    "I can read pictures and documents once this site's AI service is connected (a free Gemini or an Anthropic key on " +
    "the server). Until then I can still answer questions about any district, measure or the national picture straight " +
    "from NISR's figures — ask away.",
  links: [
    { href: "/data/key-figures", label: "Rwanda in figures" },
    { href: "/data/catalog", label: "The data behind this" },
  ],
};

// --- Voice: speech synthesis (read answers aloud) and speech recognition (dictate questions), both browser-native. ---

type RecognitionAlternative = { transcript: string };
type RecognitionResult = { isFinal: boolean; 0: RecognitionAlternative };
type RecognitionResultList = { readonly length: number; [index: number]: RecognitionResult };
type RecognitionEvent = { results: RecognitionResultList };
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
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

function speakText(text: string, onDone: () => void) {
  const synthesis = window.speechSynthesis;
  synthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.onend = onDone;
  utterance.onerror = onDone;
  synthesis.speak(utterance);
}

/** Flatten a streamed markdown answer to plain words for reading aloud. */
function plainFromMarkdown(text: string): string {
  return text
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

/** A small round button to read an answer aloud, or stop reading it. */
function SpeakButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={active ? "Stop reading aloud" : "Read this answer aloud"}
      aria-pressed={active}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted ring-1 ring-line transition-colors hover:text-cyan-ink hover:ring-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
    >
      {active ? (
        <SpeakerXMarkIcon className="h-4 w-4" aria-hidden="true" />
      ) : (
        <SpeakerWaveIcon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}

/** Render **bold** and `code` spans inside a line of assistant prose. */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    if (token.startsWith("**")) nodes.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    else
      nodes.push(
        <code key={key++} className="rounded bg-paper px-1 py-0.5 text-[12px] text-cyan-ink">
          {token.slice(1, -1)}
        </code>,
      );
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
            <p key={index} className="font-bold text-ink">
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

/** A streamed, generative answer with a typing indicator while it arrives, and a read-aloud button once it is done. */
function StreamedCard({
  markdown,
  streaming,
  canSpeak,
  speaking,
  onSpeak,
}: {
  markdown: string;
  streaming?: boolean;
  canSpeak: boolean;
  speaking: boolean;
  onSpeak: () => void;
}) {
  return (
    <div className="rounded-2xl rounded-tl-sm border border-line bg-white p-3.5 shadow-card">
      {markdown ? (
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <RichText text={markdown} />
          </div>
          {canSpeak && !streaming && <SpeakButton active={speaking} onClick={onSpeak} />}
        </div>
      ) : (
        <span className="flex gap-1 py-1" aria-label="IMBONIX AI is thinking">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="h-2 w-2 animate-pulse rounded-full bg-cyan-ink/60"
              style={{ animationDelay: `${dot * 150}ms` }}
            />
          ))}
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
  speaking,
  onSpeak,
}: {
  answer: Answer;
  onAsk: (query: string) => void;
  canSpeak: boolean;
  speaking: boolean;
  onSpeak: () => void;
}) {
  const showSuggestions = answer === WELCOME;
  return (
    <div className="rounded-2xl rounded-tl-sm border border-line bg-white p-3.5 shadow-card">
      <div className="flex items-start gap-2">
        <p className="min-w-0 flex-1 text-[14.5px] font-bold leading-5 text-ink">{answer.heading}</p>
        {canSpeak && <SpeakButton active={speaking} onClick={onSpeak} />}
      </div>
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

/** Read a chosen file into a payload the AI route accepts, or return a short error to show the person. */
function readFile(file: File): Promise<{ attachment?: Attachment; error?: string }> {
  const isImage = IMAGE_TYPES.has(file.type);
  const isPdf = file.type === "application/pdf";
  const isText = file.type.startsWith("text/") || /\.(txt|csv|md|json)$/i.test(file.name);
  if (!isImage && !isPdf && !isText) {
    return Promise.resolve({ error: "I can read images, PDFs and text files (txt, csv, md)." });
  }
  if ((isImage || isPdf) && file.size > MAX_BINARY_BYTES) {
    return Promise.resolve({ error: "That file is larger than 6 MB. Please attach a smaller one." });
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve({ error: "I couldn't read that file. Please try another." });
    if (isImage || isPdf) {
      reader.onload = () => {
        const result = String(reader.result);
        const base64 = result.slice(result.indexOf(",") + 1);
        resolve({
          attachment: {
            kind: isImage ? "image" : "document",
            mediaType: isImage ? file.type : "application/pdf",
            data: base64,
            name: file.name,
          },
        });
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = () =>
        resolve({
          attachment: {
            kind: "text",
            mediaType: "text/plain",
            data: String(reader.result).slice(0, MAX_TEXT_CHARS),
            name: file.name,
          },
        });
      reader.readAsText(file);
    }
  });
}

/**
 * IMBONIX AI: a floating assistant that answers questions about Rwanda's financial inclusion and poverty. When the
 * site's AI service is connected it uses a grounded Claude model that can also read an attached picture or document;
 * when it isn't, it falls back to an instant on-device engine over the same NISR figures. People can type or speak
 * their question and have answers read back aloud. Either way it answers only from NISR's published data and names the
 * source, and never invents a number.
 */
export function ImbonixAI() {
  const panelId = useId();
  const fileInputId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ id: 0, role: "ai", answer: WELCOME }]);
  const [pending, setPending] = useState<Attachment | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /** null while unknown, then whether the server has the AI service connected. */
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const [canSpeak, setCanSpeak] = useState(false);
  const [canListen, setCanListen] = useState(false);
  const [listening, setListening] = useState(false);
  const nextId = useRef(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const probe = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/assistant");
      const data = (await response.json()) as { configured?: boolean };
      const ok = Boolean(data.configured);
      setConfigured(ok);
      return ok;
    } catch {
      setConfigured(false);
      return false;
    }
  };

  const historyFrom = (list: Message[]): ChatTurn[] =>
    list
      .filter((message) => message.answer !== WELCOME && message.answer !== NOT_CONNECTED)
      .map((message): ChatTurn | null => {
        if (message.role === "user") return { role: "user", text: message.text ?? "" };
        const text = message.markdown ?? message.answer?.body ?? "";
        return text ? { role: "assistant", text } : null;
      })
      .filter((turn): turn is ChatTurn => turn !== null)
      .slice(-MAX_HISTORY_TURNS);

  const ask = async (rawText: string, attachment?: Attachment | null) => {
    const text = rawText.trim();
    if ((!text && !attachment) || busy) return;
    setNotice(null);

    const priorHistory = historyFrom(messages);
    setMessages((current) => [
      ...current,
      { id: nextId.current++, role: "user", text: text || undefined, attachmentName: attachment?.name },
    ]);
    setQuery("");
    setPending(null);
    setBusy(true);

    const live = configured ?? (await probe());

    if (!live) {
      setMessages((current) => {
        const next = [...current];
        if (attachment) next.push({ id: nextId.current++, role: "ai", answer: NOT_CONNECTED });
        if (text) next.push({ id: nextId.current++, role: "ai", answer: answerQuery(text) });
        else if (!attachment) next.push({ id: nextId.current++, role: "ai", answer: answerQuery("") });
        return next;
      });
      setBusy(false);
      return;
    }

    const aiId = nextId.current++;
    setMessages((current) => [...current, { id: aiId, role: "ai", markdown: "", streaming: true }]);

    const update = (patch: Partial<Message>) =>
      setMessages((current) => current.map((message) => (message.id === aiId ? { ...message, ...patch } : message)));

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...priorHistory, { role: "user", text: text || "" }], attachment }),
      });

      if (response.status === 503) {
        setConfigured(false);
        update({ streaming: false, markdown: undefined, answer: text ? answerQuery(text) : NOT_CONNECTED });
        return;
      }
      if (!response.ok || !response.body) {
        const message =
          response.status === 429
            ? "I'm getting a lot of questions right now. Please try again in a moment."
            : "Sorry, something went wrong. Please try again.";
        update({ streaming: false, markdown: message });
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
      update({ markdown: accumulated || "I don't have anything to add there.", streaming: false });
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

  const chooseFile = async (file: File | undefined) => {
    if (!file) return;
    const { attachment, error } = await readFile(file);
    if (error) {
      setNotice(error);
      setPending(null);
    } else if (attachment) {
      setPending(attachment);
      setNotice(null);
      inputRef.current?.focus();
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const toggleSpeak = (id: number, text: string) => {
    if (!canSpeak) return;
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    setSpeakingId(id);
    speakText(text, () => setSpeakingId((current) => (current === id ? null : current)));
  };

  const toggleListen = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const Ctor = recognitionCtor();
    if (!Ctor) return;
    setNotice(null);
    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    let finalText = "";
    recognition.onresult = (event) => {
      let text = "";
      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        text += result[0].transcript;
        if (result.isFinal) finalText = text;
      }
      setQuery(text);
    };
    recognition.onerror = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      const spoken = finalText.trim();
      if (spoken) void ask(spoken, pending);
    };
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
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
      setSpeakingId(null);
      recognitionRef.current?.stop();
    }
    // probe runs once; configured guards it. canSpeak is read, not a trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      {/* The launcher, with an infinite circling glow in the brand cyan to draw the eye. */}
      <div className="fixed bottom-5 right-5 z-[55] sm:bottom-6 sm:right-6 print:hidden">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-[3px] rounded-full opacity-80 blur-[4px] motion-safe:animate-orbit motion-reduce:hidden"
          style={{ background: `conic-gradient(from 0deg, transparent, ${BRAND.cyan}, ${BRAND.cyan} 20%, transparent 55%)` }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-[3px] rounded-full motion-safe:animate-halo motion-reduce:hidden"
          style={{ boxShadow: `0 0 0 2px ${BRAND.cyan}` }}
        />
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          className="relative inline-flex h-14 items-center gap-2 rounded-full bg-cyan pl-4 pr-5 font-bold text-ink shadow-lift ring-1 ring-cyan-ink/20 transition-colors hover:bg-cyan-ink hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink focus-visible:ring-offset-2"
        >
          <SparklesIcon className="h-6 w-6 motion-safe:animate-pulse" aria-hidden="true" />
          <span className="text-[15px]">IMBONIX AI</span>
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
              {messages.map((message) => {
                if (message.role === "user") {
                  return (
                    <div key={message.id} className="ml-auto w-fit max-w-[85%] space-y-1">
                      {message.attachmentName && (
                        <p className="ml-auto flex w-fit items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-ink ring-1 ring-line">
                          <PaperClipIcon className="h-3.5 w-3.5 text-cyan-ink" aria-hidden="true" />
                          <span className="max-w-[200px] truncate">{message.attachmentName}</span>
                        </p>
                      )}
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
                    <StreamedCard
                      key={message.id}
                      markdown={message.markdown}
                      streaming={message.streaming}
                      canSpeak={canSpeak}
                      speaking={speakingId === message.id}
                      onSpeak={() => toggleSpeak(message.id, plainFromMarkdown(message.markdown ?? ""))}
                    />
                  );
                }
                return (
                  <AnswerCard
                    key={message.id}
                    answer={message.answer!}
                    onAsk={ask}
                    canSpeak={canSpeak}
                    speaking={speakingId === message.id}
                    onSpeak={() => toggleSpeak(message.id, plainFromAnswer(message.answer!))}
                  />
                );
              })}
            </div>

            {notice && (
              <p className="border-t border-line bg-white px-4 py-1.5 text-[12px] leading-4 text-destructive" role="status">
                {notice}
              </p>
            )}

            {pending && (
              <div className="flex items-center gap-2 border-t border-line bg-white px-3 pt-2.5">
                <span className="flex min-w-0 items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-[12px] font-semibold text-ink ring-1 ring-line">
                  <PaperClipIcon className="h-3.5 w-3.5 shrink-0 text-cyan-ink" aria-hidden="true" />
                  <span className="max-w-[220px] truncate">{pending.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPending(null)}
                  aria-label="Remove the attached file"
                  className="flex h-6 w-6 items-center justify-center rounded-full text-muted transition-colors hover:bg-paper hover:text-ink"
                >
                  <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void ask(query, pending);
              }}
              className="flex items-center gap-2 border-t border-line bg-white p-3"
            >
              <input
                ref={fileRef}
                id={fileInputId}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp,application/pdf,text/plain,.txt,.csv,.md,.json"
                className="sr-only"
                onChange={(event) => void chooseFile(event.target.files?.[0])}
              />
              <label
                htmlFor={fileInputId}
                title="Attach a picture or document"
                aria-label="Attach a picture or document"
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink ring-1 ring-line transition-colors focus-within:ring-2 focus-within:ring-cyan-ink hover:bg-paper hover:text-cyan-ink"
              >
                <PaperClipIcon className="h-5 w-5" aria-hidden="true" />
              </label>
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
                placeholder={listening ? "Listening…" : "Ask a question, speak, or attach a file…"}
                aria-label="Ask IMBONIX AI"
                autoComplete="off"
                className="h-11 min-w-0 flex-1 rounded-full bg-paper px-4 text-[14.5px] text-ink ring-1 ring-line placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
              />
              <button
                type="submit"
                disabled={busy || (!query.trim() && !pending)}
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
