import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Single shared Prisma client. In dev, Next.js hot-reload would otherwise
// create a new client (and DB connection) on every reload, so we cache it
// on globalThis. Prisma 7 requires a driver adapter — better-sqlite3 here;
// swapping to @prisma/adapter-pg is all that's needed to move to Postgres.
const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
