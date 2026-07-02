import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";
import { logClientActivity } from "@/lib/activity";
import { buildProformaData, type ProformaBody } from "@/lib/proforma-save";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const client = await getCurrentClient();
  if (!client) return NextResponse.json({ ok: false, error: "Please sign in." }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.proforma.findUnique({ where: { id } });
  if (!existing || existing.clientId !== client.id) {
    return NextResponse.json({ ok: false, error: "Proforma not found." }, { status: 404 });
  }
  if (existing.status !== "draft") {
    return NextResponse.json(
      { ok: false, error: "Only draft proformas can be edited — this one has already been sent." },
      { status: 400 }
    );
  }

  const body: ProformaBody = await req.json().catch(() => ({}));
  const { error, data } = await buildProformaData(body);
  if (error || !data) return NextResponse.json({ ok: false, error }, { status: 400 });

  await prisma.proforma.update({ where: { id }, data });
  await logClientActivity(client.id, "edited_proforma", id);
  return NextResponse.json({ ok: true, id });
}
