import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const globalForPrisma = globalThis as unknown as {
  prisma: any;
  schemaInitialized: boolean;
};

function getSanitizedDbUrl(): string {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.database_DATABASE_URL,
    process.env.database_POSTGRES_URL,
    process.env.database_PRISMA_DATABASE_URL,
  ];

  for (const c of candidates) {
    if (
      c &&
      (c.startsWith("postgres://") ||
        c.startsWith("postgresql://") ||
        c.startsWith("prisma+postgres://") ||
        c.startsWith("prisma://"))
    ) {
      return c.trim().replace(/^["']|["']$/g, "");
    }
  }

  return (process.env.DATABASE_URL || "").trim().replace(/^["']|["']$/g, "");
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
  process.env.database_DATABASE_URL = rawUrl;
}

function createPrismaClient() {
  return new PrismaClient({
    datasources: {
      db: {
        url: rawUrl || undefined,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Auto-create any missing tables and columns silently without throwing
export async function ensureDbSchema() {
  if (globalForPrisma.schemaInitialized) return;
  try {
    // 1. Ensure User table exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "passwordHash" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'EMPLOYEE',
        "outletId" TEXT,
        "jobTitle" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `).catch(() => {});

    // 2. Add columns to User if missing
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "outletId" TEXT;`).catch(() => {});
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "jobTitle" TEXT;`).catch(() => {});
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;`).catch(() => {});

    // 3. Ensure SheetAccess table exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SheetAccess" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
        "sheet" TEXT NOT NULL,
        "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SheetAccess_userId_sheet_key" UNIQUE ("userId", "sheet")
      );
    `).catch(() => {});

    // 4. Ensure all Entry tables exist
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "OretaHygieneEntry" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "date" TEXT NOT NULL,
        "day" TEXT NOT NULL,
        "submittedById" TEXT NOT NULL REFERENCES "User"("id"),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "areaChecks" TEXT NOT NULL,
        "supervisorName" TEXT NOT NULL DEFAULT '',
        "comments" TEXT NOT NULL DEFAULT '',
        "correctiveAction" TEXT NOT NULL DEFAULT ''
      );
    `).catch(() => {});

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "OretaEquipmentEntry" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "date" TEXT NOT NULL,
        "submittedById" TEXT NOT NULL REFERENCES "User"("id"),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "equipmentChecks" TEXT NOT NULL,
        "supervisorName" TEXT NOT NULL DEFAULT '',
        "comments" TEXT NOT NULL DEFAULT '',
        "correctiveAction" TEXT NOT NULL DEFAULT ''
      );
    `).catch(() => {});

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "OretaFridgeEntry" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "date" TEXT NOT NULL,
        "supervisedBy" TEXT NOT NULL DEFAULT '',
        "submittedById" TEXT NOT NULL REFERENCES "User"("id"),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "fridgeChecks" TEXT NOT NULL,
        "hygiene" TEXT NOT NULL DEFAULT '',
        "comments" TEXT NOT NULL DEFAULT '',
        "correctiveAction" TEXT NOT NULL DEFAULT ''
      );
    `).catch(() => {});

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "OretaGlassEntry" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "date" TEXT NOT NULL,
        "submittedById" TEXT NOT NULL REFERENCES "User"("id"),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "locationChecks" TEXT NOT NULL,
        "supervisorName" TEXT NOT NULL DEFAULT '',
        "comments" TEXT NOT NULL DEFAULT '',
        "correctiveAction" TEXT NOT NULL DEFAULT ''
      );
    `).catch(() => {});

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "OretaMonthlyEntry" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "month" TEXT NOT NULL,
        "date" TEXT NOT NULL,
        "submittedById" TEXT NOT NULL REFERENCES "User"("id"),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "taskChecks" TEXT NOT NULL,
        "supervisorName" TEXT NOT NULL DEFAULT '',
        "comments" TEXT NOT NULL DEFAULT '',
        "correctiveAction" TEXT NOT NULL DEFAULT ''
      );
    `).catch(() => {});

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "OretaFoodEntry" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "date" TEXT NOT NULL,
        "day" TEXT NOT NULL DEFAULT '',
        "supervisorName" TEXT NOT NULL DEFAULT '',
        "submittedById" TEXT NOT NULL REFERENCES "User"("id"),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "tempChecks" TEXT NOT NULL DEFAULT '[]',
        "vegChecks" TEXT NOT NULL DEFAULT '[]',
        "nonVegChecks" TEXT NOT NULL DEFAULT '[]',
        "comments" TEXT NOT NULL DEFAULT '',
        "correctiveAction" TEXT NOT NULL DEFAULT ''
      );
    `).catch(() => {});

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "RnsEquipmentEntry" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "date" TEXT NOT NULL,
        "submittedById" TEXT NOT NULL REFERENCES "User"("id"),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "equipmentChecks" TEXT NOT NULL,
        "supervisorName" TEXT NOT NULL DEFAULT '',
        "comments" TEXT NOT NULL DEFAULT '',
        "correctiveAction" TEXT NOT NULL DEFAULT ''
      );
    `).catch(() => {});

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SymphonyEquipmentEntry" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "date" TEXT NOT NULL,
        "submittedById" TEXT NOT NULL REFERENCES "User"("id"),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "equipmentChecks" TEXT NOT NULL,
        "supervisorName" TEXT NOT NULL DEFAULT '',
        "comments" TEXT NOT NULL DEFAULT '',
        "correctiveAction" TEXT NOT NULL DEFAULT ''
      );
    `).catch(() => {});

    // Ensure default admin user exists
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } }).catch(() => 0);
    if (adminCount === 0) {
      const passwordHash = await bcrypt.hash("Admin@123", 12);
      await prisma.user.upsert({
        where: { email: "admin@pnr.com" },
        update: { role: "ADMIN", isActive: true },
        create: {
          name: "System Admin",
          email: "admin@pnr.com",
          passwordHash,
          role: "ADMIN",
          outletId: "all",
          jobTitle: "Administrator",
          isActive: true,
        },
      }).catch(() => {});
    }

    globalForPrisma.schemaInitialized = true;
  } catch (err) {
    console.error("Auto schema init check error:", err);
  }
}
