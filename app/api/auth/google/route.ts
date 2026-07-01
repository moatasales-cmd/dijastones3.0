import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { logClientActivity } from "@/lib/activity";
import { nowStamp } from "@/lib/time";

// Google Sign-In. Activates only when GOOGLE_CLIENT_ID is configured; the
// frontend renders the Google button conditionally on NEXT_PUBLIC_GOOGLE_CLIENT_ID.
export async function POST(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { ok: false, error: "Google sign-in is not configured." },
      { status: 501 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const credential = String(body.credential ?? "");
  if (!credential) {
    return NextResponse.json({ ok: false, error: "Missing credential" }, { status: 400 });
  }

  let payload;
  try {
    const oauth = new OAuth2Client(clientId);
    const ticket = await oauth.verifyIdToken({ idToken: credential, audience: clientId });
    payload = ticket.getPayload();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid Google token" }, { status: 401 });
  }
  if (!payload?.email) {
    return NextResponse.json({ ok: false, error: "No email in Google account" }, { status: 400 });
  }

  const email = payload.email.toLowerCase();
  const name = payload.name ?? "";
  const googleId = payload.sub;

  let client = await prisma.client.findUnique({ where: { email } });
  if (!client) {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    client = await prisma.client.create({
      data: {
        id: `CLI-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${Math.random()
          .toString(16)
          .slice(2, 8)
          .toUpperCase()}`,
        email,
        name,
        googleId,
        verified: true,
        createdAt: nowStamp(),
        lastLogin: nowStamp(),
      },
    });
    await logClientActivity(client.id, "account_created", "via Google");
  } else {
    client = await prisma.client.update({
      where: { id: client.id },
      data: { googleId: client.googleId ?? googleId, verified: true, lastLogin: nowStamp() },
    });
    await logClientActivity(client.id, "signed_in", "via Google");
  }

  await createSession({ clientId: client.id, email: client.email, name: client.name ?? "" });
  return NextResponse.json({
    ok: true,
    client: { id: client.id, email: client.email, name: client.name ?? "" },
  });
}
