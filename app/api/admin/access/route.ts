import { auth } from "@/lib/auth";
import { prisma, ensureDbSchema } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  const user = session.user as { role?: string; email?: string };
  if (user.role === "ADMIN" || user.email === "admin@pnr.com") return session;
  return null;
}

// GET all access records
export async function GET() {
  await ensureDbSchema();
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const access = await prisma.sheetAccess.findMany({
      include: { user: { select: { id: true, name: true } } },
    });
    return NextResponse.json(access);
  } catch (err: any) {
    console.error("Error in GET /api/admin/access:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch access" }, { status: 500 });
  }
}

// POST: grant access (single or batch)
export async function POST(req: NextRequest) {
  await ensureDbSchema();
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { userId, sheet, sheets } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const sheetsToGrant: string[] = Array.isArray(sheets)
      ? sheets
      : sheet
      ? [sheet]
      : [];

    if (sheetsToGrant.length === 0) {
      return NextResponse.json({ error: "Missing sheet or sheets" }, { status: 400 });
    }

    const results = [];
    for (const s of sheetsToGrant) {
      const rec = await prisma.sheetAccess.upsert({
        where: { userId_sheet: { userId, sheet: s } },
        update: {},
        create: { userId, sheet: s },
      });
      results.push(rec);
    }

    return NextResponse.json({ ok: true, count: results.length, data: results }, { status: 201 });
  } catch (err: any) {
    console.error("Error in POST /api/admin/access:", err);
    return NextResponse.json({ error: err.message || "Failed to grant access" }, { status: 500 });
  }
}

// DELETE: revoke access (single or batch)
export async function DELETE(req: NextRequest) {
  await ensureDbSchema();
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { userId, sheet, sheets } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const sheetsToRevoke: string[] = Array.isArray(sheets)
      ? sheets
      : sheet
      ? [sheet]
      : [];

    if (sheetsToRevoke.length === 0) {
      // If no specific sheets specified, delete all for this user
      await prisma.sheetAccess.deleteMany({
        where: { userId },
      });
      return NextResponse.json({ ok: true, message: "Revoked all access" });
    }

    const expandedSheetsToRevoke = sheetsToRevoke.flatMap((s) =>
      s === "ORETA_SHOP_CLEANING" || s === "ORETA_HYGIENE"
        ? ["ORETA_SHOP_CLEANING", "ORETA_HYGIENE"]
        : [s]
    );

    const res = await prisma.sheetAccess.deleteMany({
      where: {
        userId,
        sheet: { in: expandedSheetsToRevoke },
      },
    });

    return NextResponse.json({ ok: true, count: res.count });
  } catch (err: any) {
    console.error("Error in DELETE /api/admin/access:", err);
    return NextResponse.json({ error: err.message || "Failed to revoke access" }, { status: 500 });
  }
}
