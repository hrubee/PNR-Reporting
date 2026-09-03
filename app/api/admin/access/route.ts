import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  const user = session.user as { role: string };
  if (user.role !== "ADMIN") return null;
  return session;
}

// GET all access records
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const access = await prisma.sheetAccess.findMany({ include: { user: { select: { id: true, name: true } } } });
  return NextResponse.json(access);
}

// POST: grant access
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { userId, sheet } = await req.json();
  const access = await prisma.sheetAccess.upsert({
    where: { userId_sheet: { userId, sheet } },
    update: {},
    create: { userId, sheet },
  });
  return NextResponse.json(access, { status: 201 });
}

// DELETE: revoke access
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { userId, sheet } = await req.json();
  try {
    await prisma.sheetAccess.delete({ where: { userId_sheet: { userId, sheet } } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
