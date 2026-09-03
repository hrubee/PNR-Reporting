import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const envKeys = Object.keys(process.env).filter((k) =>
    k.includes("DATA") || k.includes("POSTGRES") || k.includes("URL") || k.includes("AUTH")
  );

  const keyPreviews: Record<string, string> = {};
  for (const k of envKeys) {
    const val = process.env[k] || "";
    keyPreviews[k] = val.length > 15 ? val.substring(0, 15) + "..." : val;
  }

  try {
    const user = await prisma.user.findFirst();
    return NextResponse.json({
      success: true,
      userFound: !!user,
      envKeysPresent: envKeys,
      keyPreviews,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || "Unknown error",
      envKeysPresent: envKeys,
      keyPreviews,
    });
  }
}
