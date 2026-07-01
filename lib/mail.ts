import nodemailer from "nodemailer";

export interface MailOptions {
  to: string;
  subject: string;
  text: string;
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
      from: `${SMTP_FROM_NAME || "DIJA Marble"} <${SMTP_FROM || SMTP_USER}>`,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
    });
    return { sent: true };
  }

  console.log(
    `\n──────── [DEV EMAIL] ────────\nTo: ${opts.to}\nSubject: ${opts.subject}\n\n${opts.text}\n─────────────────────────────\n`
  );
  return { sent: false };
}

export function verificationEmail(code: string): { subject: string; text: string } {
  return {
    subject: "Your DIJA Marble verification code",
    text: `Your DIJA Marble verification code is:\n\n${code}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
  };
}
