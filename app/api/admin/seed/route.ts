import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    
    // Always ensure admin and staff exist
    const defaultPassword = await bcrypt.hash("Pnr@123", 12);
    const adminPassword = await bcrypt.hash("Admin@123", 12);

    const admin = await prisma.user.upsert({
      where: { email: "admin@pnr.com" },
      update: { passwordHash: adminPassword, isActive: true },
      create: { name: "Admin", email: "admin@pnr.com", passwordHash: adminPassword, role: "ADMIN" },
    });

    const aboli = await prisma.user.upsert({
      where: { email: "aboli@pnr.com" },
      update: { passwordHash: defaultPassword, isActive: true },
      create: { name: "Aboli Wagh", email: "aboli@pnr.com", passwordHash: defaultPassword, role: "ADMIN" },
    });

    const sandeep = await prisma.user.upsert({
      where: { email: "sandeep@pnr.com" },
      update: { passwordHash: defaultPassword, isActive: true },
      create: { name: "Sandeep Gargate", email: "sandeep@pnr.com", passwordHash: defaultPassword, role: "ADMIN" },
    });

    const staffList = [
      { name: "Shridhar Jadhav", email: "shridhar@pnr.com", sheets: ["HYGIENE_REPORT"] },
      { name: "Pravin Jadhav", email: "pravin@pnr.com", sheets: ["HYGIENE_REPORT", "PRODUCTION", "KITCHEN"] },
      { name: "Mavshi", email: "mavshi@pnr.com", sheets: ["HYGIENE_REPORT", "PRODUCTION", "KITCHEN"] },
      { name: "Sanjay Jadhav", email: "sanjay@pnr.com", sheets: ["GLASS_REPORT"] },
      { name: "Suresh", email: "suresh@pnr.com", sheets: ["GLASS_REPORT", "KITCHEN"] },
      { name: "Sagar Yadav", email: "sagar@pnr.com", sheets: ["PRODUCTION", "KITCHEN"] },
      { name: "Dilip", email: "dilip@pnr.com", sheets: ["PUFF_ROOM"] },
      { name: "Meraj Khan", email: "meraj@pnr.com", sheets: ["CAKE_ROOM"] },
      { name: "Jaseen Siddique", email: "jaseen@pnr.com", sheets: ["CAKE_ROOM"] },
      { name: "Nadeem Faruqi", email: "nadeem@pnr.com", sheets: ["CAKE_ROOM"] },
    ];

    for (const s of staffList) {
      const u = await prisma.user.upsert({
        where: { email: s.email },
        update: { name: s.name, passwordHash: defaultPassword, isActive: true },
        create: { name: s.name, email: s.email, passwordHash: defaultPassword, role: "EMPLOYEE" },
      });
      for (const sheet of s.sheets) {
        await prisma.sheetAccess.upsert({
          where: { userId_sheet: { userId: u.id, sheet } },
          update: {},
          create: { userId: u.id, sheet },
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: "✅ Database seeded successfully! You can now log in.",
      users: ["admin@pnr.com", "aboli@pnr.com", "sandeep@pnr.com", ...staffList.map((s) => s.email)],
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error?.message || "Failed to seed database",
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
