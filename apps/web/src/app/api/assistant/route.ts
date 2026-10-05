import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/ai-context";

/**
 * IMBONIX AI's generative layer. The browser talks only to this same-origin route; the route talks to Claude with the
 * API key read from the server environment (ANTHROPIC_API_KEY), so the key is never sent to or seen by the browser.
 *
 * The answer is grounded: the whole published NISR digest is the system prompt, and the model is told to quote only
 * those figures and name the source. People can attach a picture or a document, which the model reads and analyses.
 * When no key is configured the route reports that, and the client falls back to its instant on-device engine, so the
 * assistant always works in a demo even with no key set.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-opus-5-5";
const MAX_OUTPUT_TOKENS = 2048;
const MAX_TURNS = 12;
const MAX_TURN_CHARS = 4000;
/** A base64 payload longer than this (~6 MB of file) is refused, well under the API's 32 MB request ceiling. */
const MAX_ATTACHMENT_CHARS = 8_000_000;
const MAX_TEXT_ATTACHMENT_CHARS = 20_000;
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);

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
  return Response.json({ configured: Boolean(process.env.ANTHROPIC_API_KEY) });
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
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

  const messages = toMessages(turns, attachment);

  const anthropic = new Anthropic();
  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: MAX_OUTPUT_TOKENS,
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    thinking: { type: "adaptive" },
    output_config: { effort: "low" },
    messages,
  });

  const encoder = new TextEncoder();
  let emitted = false;
  const body = new ReadableStream<Uint8Array>({
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
          controller.enqueue(
            encoder.encode(
              "I don't have anything to add there. Try asking about a district, a measure, or the data behind IMBONIX.",
            ),
          );
        }
      } catch {
        controller.enqueue(
          encoder.encode(
            emitted
              ? "\n\n(Sorry — the connection dropped before I finished. Please ask again.)"
              : "Sorry, I couldn't reach the AI service just now. Please try again.",
          ),
        );
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

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

/** Turn the conversation into Claude messages, attaching the file (if any) to the last user turn. */
function toMessages(turns: ChatTurn[], attachment: Attachment | null): Anthropic.MessageParam[] {
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
    const label = attachment.name ? ` (${attachment.name})` : "";
    const text =
      attachment.kind === "text"
        ? `${turn.text}\n\nThe person attached a text file${label}. Its contents:\n"""\n${attachment.data}\n"""`
        : turn.text || "Please analyse this file and tell me everything useful you can from it.";
    content.push({ type: "text", text });
    return { role: "user", content };
  });
}
