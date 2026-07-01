import { prisma } from "./prisma";

const HOUR = 3600_000;
const TEN_MIN = 600_000;

export interface IssueOpts {
  pending?: boolean;
  passwordHash?: string;
  name?: string;
  codeOnly?: boolean;
}

/**
 * Issue a 6-digit code for an email. Rate-limited to 3 per hour (codes are
 * retained for an hour to enforce this, then garbage-collected).
 */
export async function issueCode(
  email: string,
  opts: IssueOpts = {}
): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  const cutoff = new Date(Date.now() - HOUR);
  await prisma.verificationCode.deleteMany({ where: { createdAt: { lt: cutoff } } });

  const recent = await prisma.verificationCode.count({
    where: { email, createdAt: { gt: cutoff } },
  });
  if (recent >= 3) {
    return {
      ok: false,
      error: "Too many requests. Please wait before requesting another code.",
    };
  }

  const code = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
  await prisma.verificationCode.create({
    data: {
      email,
      code,
      expiresAt: new Date(Date.now() + TEN_MIN),
      pending: !!opts.pending,
      passwordHash: opts.passwordHash ?? null,
      name: opts.name ?? null,
      codeOnly: !!opts.codeOnly,
    },
  });
  return { ok: true, code };
}

/** Find and consume a valid (unexpired) code. Returns the record or null. */
export async function consumeCode(email: string, code: string) {
  const rec = await prisma.verificationCode.findFirst({
    where: { email, code, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!rec) return null;
  await prisma.verificationCode.delete({ where: { id: rec.id } });
  return rec;
}
