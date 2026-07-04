import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Single shared Prisma client. In dev, Next.js hot-reload would otherwise
// create a new client (and DB connection) on every reload, so we cache it
// on globalThis. Prisma 7 requires a driver adapter — PostgreSQL via pg.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
