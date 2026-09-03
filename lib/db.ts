import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

function getSanitizedDbUrl(): string {
  let url =
    process.env.DATABASE_URL ||
    process.env.database_DATABASE_URL ||
    process.env.database_PRISMA_DATABASE_URL ||
    process.env.database_POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    "";

  return url.trim().replace(/^["']|["']$/g, "");
}

let rawUrl = getSanitizedDbUrl();

// Ensure protocol is postgresql:// for Prisma engine
if (rawUrl.startsWith("prisma+postgres://")) {
  rawUrl = rawUrl.replace("prisma+postgres://", "postgresql://");
} else if (rawUrl.startsWith("prisma://")) {
  rawUrl = rawUrl.replace("prisma://", "postgresql://");
}

if (rawUrl) {
  process.env.DATABASE_URL = rawUrl;
}

function createPrismaClient() {
  return new PrismaClient({
    ...(rawUrl ? { datasourceUrl: rawUrl } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
