import nodemailer from "nodemailer";

export interface MailOptions {
  to: string;
  subject: string;
  text: string;
  attachments?: { filename: string; content: Buffer; contentType?: string }[];
}

/**
 * Send an email. If SMTP_* env vars are configured, sends via SMTP;
 * otherwise (local dev) logs the message to the server console so flows
 * remain testable without a mail server.
 */
export async function sendMail(opts: MailOptions): Promise<{ sent: boolean }> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_FROM_NAME } =
    process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    const transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    await transport.sendMail({
      from: `${SMTP_FROM_NAME || "DIJA Natural Stone"} <${SMTP_FROM || SMTP_USER}>`,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      attachments: opts.attachments,
    });
    return { sent: true };
  }

  const attachInfo = opts.attachments?.length
    ? `\nAttachments: ${opts.attachments.map((a) => `${a.filename} (${a.content.length} bytes)`).join(", ")}`
    : "";
  console.log(
    `\n──────── [DEV EMAIL] ────────\nTo: ${opts.to}\nSubject: ${opts.subject}\n\n${opts.text}${attachInfo}\n─────────────────────────────\n`
  );
  return { sent: false };
}

export function verificationEmail(code: string): { subject: string; text: string } {
  return {
    subject: "Your DIJA Natural Stone verification code",
    text: `Your DIJA Natural Stone verification code is:\n\n${code}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
  };
}

/**
 * Best-effort real-time notification to the sales team for a new lead
 * (contact form, quote request, or trade application). Never throws --
 * a notification failure must not block the lead from being saved, since
 * the database row is the source of truth and admins can still see it
 * there. Recipient is configurable via LEAD_NOTIFY_EMAIL for environments
 * that want a different inbox than the public sales@ address.
 */
export async function notifyLead(kind: string, fields: Record<string, string | null | undefined>): Promise<void> {
  const to = process.env.LEAD_NOTIFY_EMAIL || "sales@dijastones.com";
  const lines = Object.entries(fields)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  try {
    await sendMail({
      to,
      subject: `New ${kind} — DIJA Natural Stone`,
      text: `A new ${kind} was just submitted on the website:\n\n${lines}\n\nView it in the admin panel for full details.`,
    });
  } catch (err) {
    console.error(`[notifyLead] failed to send ${kind} notification:`, err);
  }
}
