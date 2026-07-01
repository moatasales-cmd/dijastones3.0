import bcrypt from "bcryptjs";

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10);
}

/**
 * Verify a password. Old accounts were hashed by PHP with the `$2y$` prefix;
 * it's byte-compatible with `$2b$`, so we normalize before comparing.
 */
export async function verifyPassword(pw: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  const normalized = hash.replace(/^\$2y\$/, "$2b$");
  try {
    return await bcrypt.compare(pw, normalized);
  } catch {
    return false;
  }
}
