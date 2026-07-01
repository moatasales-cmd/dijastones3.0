import "server-only";
import { prisma } from "./prisma";
import { getSession } from "./session";

/** The full, current client record from the DB, or null if not signed in. */
export async function getCurrentClient() {
  const session = await getSession();
  if (!session?.clientId) return null;
  return prisma.client.findUnique({ where: { id: session.clientId } });
}
