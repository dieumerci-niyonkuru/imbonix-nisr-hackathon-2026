/**
 * IMBONIX AI — status + silent location only. No model. No key.
 *
 * IMBONIX AI runs ENTIRELY ON-DEVICE. Every question is answered in the browser by the on-device engine
 * (lib/assistant.ts) straight from NISR's published figures — no external / pre-trained model, no API key, and no
 * network call to any AI provider. The assistant can therefore never invent a number: it only ever returns a real,
 * stored NISR figure, and it names the source every time.
 *
 * Because there is no server-side model, this route holds no secret and talks to nothing. It exists only to:
 *   1. tell the client the assistant is on-device (so the client always uses the local NISR engine), and
 *   2. hand back the request's approximate latitude/longitude from the platform's IP geolocation headers (Vercel adds
 *      these for free, with no permission prompt). The client turns these into the person's district for silent
 *      "my district" / "near me" context. On a host without these headers (e.g. local dev) they are simply absent.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Tell the client the assistant is on-device, and pass through IP-based coordinates when the platform supplies them. */
export function GET(request: Request) {
  const lat = Number(request.headers.get("x-vercel-ip-latitude"));
  const lng = Number(request.headers.get("x-vercel-ip-longitude"));
  const hasGeo = Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0);
  // configured:false → the client answers from the on-device NISR engine. onDevice:true says that is by design.
  return Response.json({
    configured: false,
    onDevice: true,
    ...(hasGeo ? { lat, lng } : {}),
  });
}

/** There is no server-side model. Any POST (e.g. from a stale client bundle during a deploy) is told to answer on-device. */
export function POST() {
  return Response.json({ configured: false, onDevice: true }, { status: 503 });
}
