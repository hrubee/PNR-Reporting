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

const rawUrl = getSanitizedDbUrl();

if (rawUrl && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = rawUrl;
}

function createPrismaClient() {
  const isAccelerate =
    rawUrl.startsWith("prisma+postgres://") || rawUrl.startsWith("prisma://");

  const baseClient = new PrismaClient({
    ...(rawUrl ? { datasourceUrl: rawUrl } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  if (isAccelerate) {
    return baseClient.$extends(withAccelerate());
  }

  return baseClient;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
