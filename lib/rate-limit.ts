import { NextResponse } from "next/server";

interface Bucket {
  count: number;
  resetAt: number;
}

// In-memory, per-instance sliding-window counter. Good enough for a
// single-server deployment to blunt basic form-spam/bot abuse; if this ever
// runs multi-instance, swap the Map for a shared store (e.g. Redis).
const buckets = new Map<string, Bucket>();

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/**
 * Returns null if the request is within limits, or a 429 NextResponse to
 * return immediately if the caller has exceeded `limit` requests within
 * `windowMs` for the given `key` (typically the route name).
 */
export function rateLimit(
  req: Request,
  key: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const id = `${key}:${clientIp(req)}`;
  const now = Date.now();
  const bucket = buckets.get(id);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(id, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (bucket.count >= limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  bucket.count++;
  return null;
}
