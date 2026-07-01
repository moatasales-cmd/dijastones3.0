import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumeCode } from "@/lib/verification";
import { createSession } from "@/lib/session";
import { logClientActivity } from "@/lib/activity";
import { nowStamp } from "@/lib/time";

function newClientId() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const ymd = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
  const rand = Math.random().toString(16).slice(2, 8).toUpperCase();
  return `CLI-${ymd}-${rand}`;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const code = String(body.code ?? "").trim();

  if (!email || !code) {
    return NextResponse.json({ ok: false, error: "Email and code are required" }, { status: 400 });
  }

  const matched = await consumeCode(email, code);
  if (!matched) {
    return NextResponse.json({ ok: false, error: "Invalid or expired code" }, { status: 401 });
  }

  const isRegistration = matched.pending;
  let client = await prisma.client.findUnique({ where: { email } });

  if (isRegistration) {
    if (!client) {
      client = await prisma.client.create({
        data: {
          id: newClientId(),
          email,
          name: matched.name ?? "",
          passwordHash: matched.passwordHash ?? "",
          createdAt: nowStamp(),
          lastLogin: nowStamp(),
          verified: true,
        },
      });
    } else {
      client = await prisma.client.update({
        where: { id: client.id },
        data: {
          verified: true,
          passwordHash: matched.passwordHash ?? client.passwordHash,
          lastLogin: nowStamp(),
          ...(matched.name ? { name: matched.name } : {}),
        },
      });
    }
  } else {
    if (!client) {
      client = await prisma.client.create({
        data: {
          id: newClientId(),
          email,
          name: "",
          createdAt: nowStamp(),
          lastLogin: nowStamp(),
          verified: true,
        },
      });
    } else {
      client = await prisma.client.update({
        where: { id: client.id },
        data: { verified: true, lastLogin: nowStamp() },
      });
    }
  }

  await logClientActivity(client.id, isRegistration ? "account_created" : "email_verified");
  await createSession({ clientId: client.id, email: client.email, name: client.name ?? "" });

  return NextResponse.json({
    ok: true,
    client: { id: client.id, email: client.email, name: client.name ?? "" },
  });
}
