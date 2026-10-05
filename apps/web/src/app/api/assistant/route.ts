import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/ai-context";

/**
 * IMBONIX AI's generative layer. The browser talks only to this same-origin route; the route talks to the model with a
 * key read from the server environment, so the key is never sent to or seen by the browser.
 *
 * Two backends are supported, both grounded in the same published NISR digest (the system prompt) and both able to read
 * an attached picture or document:
 *   - Anthropic Claude, when ANTHROPIC_API_KEY is set (preferred when present).
 *   - Google Gemini, when GEMINI_API_KEY (or GOOGLE_API_KEY) is set — Gemini has a no-cost free tier.
 * When neither key is set the route reports that, and the client falls back to its instant on-device engine, so the
 * assistant always works even with no key.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ANTHROPIC_MODEL = "claude-opus-5-5";
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";
const MAX_OUTPUT_TOKENS = 2048;
const MAX_TURNS = 12;
const MAX_TURN_CHARS = 4000;
/** A base64 payload longer than this (~6 MB of file) is refused, well under the models' request ceilings. */
const MAX_ATTACHMENT_CHARS = 8_000_000;
const MAX_TEXT_ATTACHMENT_CHARS = 20_000;
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);

const EMPTY_REPLY = "I don't have anything to add there. Try asking about a district, a measure, or the data behind IMBONIX.";
const REACH_ERROR = "Sorry, I couldn't reach the AI service just now. Please try again.";
const DROPPED = "\n\n(Sorry — the connection dropped before I finished. Please ask again.)";

const anthropicKey = () => process.env.ANTHROPIC_API_KEY;
const geminiKey = () => process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;

/** Best-effort, per-instance rate limit so an exposed demo endpoint can't run up a surprise bill. */
const WINDOW_MS = 5 * 60 * 1000;
const MAX_PER_WINDOW = 30;
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > MAX_PER_WINDOW;
}

type ChatTurn = { role: "user" | "assistant"; text: string };
type Attachment = { kind: "image" | "document" | "text"; mediaType: string; data: string; name?: string };

/** Whether the AI service is connected, so the client knows to use it or fall back to the on-device engine. */
export function GET() {
  return Response.json({ configured: Boolean(anthropicKey() || geminiKey()) });
}

export async function POST(request: Request) {
  if (!anthropicKey() && !geminiKey()) {
    return Response.json({ configured: false }, { status: 503 });
  }

  const clientKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (rateLimited(clientKey)) {
    return Response.json({ error: "Too many requests. Please wait a moment and try again." }, { status: 429 });
  }

  let payload: { messages?: unknown; attachment?: unknown };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const turns: ChatTurn[] = Array.isArray(payload.messages)
    ? payload.messages
        .filter(
          (turn): turn is ChatTurn =>
            !!turn &&
            typeof turn === "object" &&
            (turn as ChatTurn).role !== undefined &&
            typeof (turn as ChatTurn).text === "string",
        )
        .map((turn): ChatTurn => ({
          role: turn.role === "assistant" ? "assistant" : "user",
          text: turn.text.slice(0, MAX_TURN_CHARS),
        }))
        .slice(-MAX_TURNS)
    : [];
  while (turns.length && turns[0].role === "assistant") turns.shift();
  while (turns.length && turns[turns.length - 1].role === "assistant") turns.pop();

  const attachment = parseAttachment(payload.attachment);
  if (payload.attachment && !attachment) {
    return Response.json({ error: "That file type or size isn't supported." }, { status: 400 });
  }
  if (turns.length === 0) {
    if (!attachment) return Response.json({ error: "Nothing to answer." }, { status: 400 });
    turns.push({ role: "user", text: "Please look at this file and tell me everything useful you can from it." });
  }

  const encoder = new TextEncoder();
  const anthropic = anthropicKey();
  const body = anthropic
    ? anthropicStream(toAnthropicMessages(turns, attachment), encoder)
    : geminiStream(turns, attachment, geminiKey()!, encoder);

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Imbonix-Ai": "live" },
  });
}

/** Validate and normalise an uploaded attachment, or return null when it is missing or not allowed. */
function parseAttachment(raw: unknown): Attachment | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Partial<Attachment>;
  if (typeof value.data !== "string" || typeof value.mediaType !== "string") return null;
  const name = typeof value.name === "string" ? value.name.slice(0, 200) : undefined;
  if (value.kind === "image" && IMAGE_TYPES.has(value.mediaType)) {
    if (value.data.length > MAX_ATTACHMENT_CHARS) return null;
    return { kind: "image", mediaType: value.mediaType, data: value.data, name };
  }
  if (value.kind === "document" && value.mediaType === "application/pdf") {
    if (value.data.length > MAX_ATTACHMENT_CHARS) return null;
    return { kind: "document", mediaType: value.mediaType, data: value.data, name };
  }
  if (value.kind === "text") {
    return { kind: "text", mediaType: "text/plain", data: value.data.slice(0, MAX_TEXT_ATTACHMENT_CHARS), name };
  }
  return null;
}

/** The text of the last user turn, folding in a text attachment and a default ask when the turn is empty. */
function userText(turn: ChatTurn, attachment: Attachment | null): string {
  if (attachment?.kind === "text") {
    const label = attachment.name ? ` (${attachment.name})` : "";
    return `${turn.text}\n\nThe person attached a text file${label}. Its contents:\n"""\n${attachment.data}\n"""`;
  }
  return turn.text || "Please analyse this file and tell me everything useful you can from it.";
}

// --- Anthropic (Claude) backend ---------------------------------------------------------------------------------

/** Turn the conversation into Claude messages, attaching the file (if any) to the last user turn. */
function toAnthropicMessages(turns: ChatTurn[], attachment: Attachment | null): Anthropic.MessageParam[] {
  const lastUserIndex = turns.map((turn) => turn.role).lastIndexOf("user");
  return turns.map((turn, index) => {
    if (turn.role === "assistant" || index !== lastUserIndex || !attachment) {
      return { role: turn.role, content: turn.text };
    }
    const content: Anthropic.ContentBlockParam[] = [];
    if (attachment.kind === "image") {
      content.push({
        type: "image",
        source: { type: "base64", media_type: attachment.mediaType as "image/png", data: attachment.data },
      });
    } else if (attachment.kind === "document") {
      content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: attachment.data } });
    }
    content.push({ type: "text", text: userText(turn, attachment) });
    return { role: "user", content };
  });
}

function anthropicStream(messages: Anthropic.MessageParam[], encoder: TextEncoder): ReadableStream<Uint8Array> {
  const client = new Anthropic();
  const stream = client.messages.stream({
    model: ANTHROPIC_MODEL,
    max_tokens: MAX_OUTPUT_TOKENS,
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    thinking: { type: "adaptive" },
    output_config: { effort: "low" },
    messages,
  });
  let emitted = false;
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            emitted = true;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal" && !emitted) {
          controller.enqueue(
            encoder.encode(
              "I can't help with that one. Ask me about Rwanda's districts, poverty or financial inclusion and I'll do my best.",
            ),
          );
        } else if (!emitted) {
          controller.enqueue(encoder.encode(EMPTY_REPLY));
        }
      } catch {
        controller.enqueue(encoder.encode(emitted ? DROPPED : REACH_ERROR));
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });
}

// --- Google Gemini backend (free tier) --------------------------------------------------------------------------

type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } };

/** Turn the conversation into Gemini "contents", attaching the file (if any) to the last user turn. */
function toGeminiContents(turns: ChatTurn[], attachment: Attachment | null) {
  const lastUserIndex = turns.map((turn) => turn.role).lastIndexOf("user");
  return turns.map((turn, index) => {
    const parts: GeminiPart[] = [];
    if (index === lastUserIndex && attachment && attachment.kind !== "text") {
      parts.push({
        inlineData: { mimeType: attachment.kind === "image" ? attachment.mediaType : "application/pdf", data: attachment.data },
      });
    }
    const text = index === lastUserIndex && attachment ? userText(turn, attachment) : turn.text;
    parts.push({ text });
    return { role: turn.role === "assistant" ? "model" : "user", parts };
  });
}

function geminiStream(
  turns: ChatTurn[],
  attachment: Attachment | null,
  apiKey: string,
  encoder: TextEncoder,
): ReadableStream<Uint8Array> {
  const requestBody = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: toGeminiContents(turns, attachment),
    generationConfig: { temperature: 0.4, maxOutputTokens: MAX_OUTPUT_TOKENS },
  });
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:streamGenerateContent?alt=sse`;

  let emitted = false;
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: requestBody,
        });
        if (!response.ok || !response.body) {
          controller.enqueue(encoder.encode(REACH_ERROR));
          controller.close();
          return;
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let newline: number;
          while ((newline = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, newline).trim();
            buffer = buffer.slice(newline + 1);
            if (!line.startsWith("data:")) continue;
            const json = line.slice(5).trim();
            if (!json || json === "[DONE]") continue;
            try {
              const chunk = JSON.parse(json) as {
                candidates?: { content?: { parts?: { text?: string }[] } }[];
              };
              const text = chunk.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
              if (text) {
                emitted = true;
                controller.enqueue(encoder.encode(text));
              }
            } catch {
              // A partial or non-JSON keep-alive line; ignore and wait for the next.
            }
          }
        }
        if (!emitted) controller.enqueue(encoder.encode(EMPTY_REPLY));
      } catch {
        controller.enqueue(encoder.encode(emitted ? DROPPED : REACH_ERROR));
      } finally {
        controller.close();
      }
    },
  });
}
