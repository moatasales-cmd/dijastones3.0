import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";
import { logClientActivity } from "@/lib/activity";
import { buildInvoiceView, money } from "@/lib/proforma-view";
import { generateProformaPdf } from "@/lib/proforma-pdf";
import { sendMail } from "@/lib/mail";
import { getT } from "@/lib/i18n-server";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const client = await getCurrentClient();
  if (!client) return NextResponse.json({ ok: false, error: "Please sign in." }, { status: 401 });

  const { id } = await params;
  const pf = await prisma.proforma.findUnique({ where: { id } });
  if (!pf || pf.clientId !== client.id) {
    return NextResponse.json({ ok: false, error: "Proforma not found." }, { status: 404 });
  }

  const toEmail = client.email;
  if (!toEmail) {
    return NextResponse.json({ ok: false, error: "No email address on file for your account." }, { status: 400 });
  }

  const { t } = await getT();
  const view = buildInvoiceView(pf, t);
  const pdfBuffer = await generateProformaPdf(view);

  const { sent } = await sendMail({
    to: toEmail,
    subject: `Your DIJA Proforma Invoice ${pf.id}`,
    text:
      `Dear ${view.client.name || "Valued Client"},\n\n` +
      `Please find attached your proforma invoice ${pf.id}, valid until ${view.validUntil}.\n\n` +
      `Grand total: ${money(view.grandTotal)} (Incoterm: ${view.incoterm})\n\n` +
      `You can also view it online at any time by signing in to your account.\n\n` +
      `Thank you for choosing DIJA Natural Stone.\n\n` +
      `— DIJA Natural Stone`,
    attachments: [
      {
        filename: `Proforma-${pf.id}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  await logClientActivity(client.id, "emailed_proforma", pf.id);
  return NextResponse.json({ ok: true, devMode: !sent });
}
