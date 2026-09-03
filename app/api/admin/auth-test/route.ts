import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "admin@pnr.com" },
    });

    if (!user) {
      const allUsers = await prisma.user.findMany({ select: { email: true, name: true, role: true } });
      return NextResponse.json({
        found: false,
        message: "admin@pnr.com not found in database",
        existingUsers: allUsers,
      });
    }

    const isMatch = await bcrypt.compare("Admin@123", user.passwordHash);

    return NextResponse.json({
      found: true,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      passwordMatches: isMatch,
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error?.message || "Unknown error",
      stack: error?.stack,
    }, { status: 500 });
  }
}
