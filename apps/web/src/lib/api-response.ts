import { NextResponse } from "next/server";

/**
 * Shared response helpers for the in-app JSON API (app/api/v1/*), matching the standalone API's contract: every success
 * is `{ data, meta }`, every error is `{ error: { code, message, details?, requestId } }`, and both carry an
 * `X-Request-Id`. Data responses are cacheable (the figures change only when the site is rebuilt); errors are never
 * cached.
 */

const SUCCESS_CACHE = "public, max-age=300";

/** A single validation problem, matching the standalone API's error details. */
export type Problem = { in: "params" | "query"; field: string | null; message: string };

export function ok(data: unknown, meta: Record<string, unknown> = {}, cache: string = SUCCESS_CACHE) {
  const metaOut = { ...(Array.isArray(data) ? { count: data.length } : {}), ...meta };
  return NextResponse.json({ data, meta: metaOut }, { headers: { "Cache-Control": cache, "X-Request-Id": crypto.randomUUID() } });
}

export function fail(status: number, code: string, message: string, details?: unknown) {
  const requestId = crypto.randomUUID();
  return NextResponse.json(
    { error: { code, message, ...(details ? { details } : {}), requestId } },
    { status, headers: { "Cache-Control": "no-store", "X-Request-Id": requestId } },
  );
}

export const badRequest = (message: string, details?: unknown) => fail(400, "bad_request", message, details);
export const notFound = (message: string) => fail(404, "not_found", message);

const SLUG_RE = /^[a-z][a-z-]{1,39}$/;
const INDICATOR_ID_RE = /^[a-z0-9_]{1,80}$/;

export const isValidSlug = (slug: string) => SLUG_RE.test(slug);
export const isValidIndicatorId = (id: string) => INDICATOR_ID_RE.test(id);
