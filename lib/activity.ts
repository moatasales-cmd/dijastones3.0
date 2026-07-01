import { prisma } from "./prisma";
import { nowStamp } from "./time";

/** Append an entry to a client's activity log (mirrors logClientActivity). */
export async function logClientActivity(
  clientId: string,
  action: string,
  details = ""
): Promise<void> {
  const c = await prisma.client.findUnique({
    where: { id: clientId },
    select: { activityLog: true },
  });
  if (!c) return;
  const log = Array.isArray(c.activityLog)
    ? (c.activityLog as Record<string, string>[])
    : [];
  log.push({ action, details, timestamp: nowStamp() });
  await prisma.client.update({
    where: { id: clientId },
    data: { activityLog: log },
  });
}
