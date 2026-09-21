import { prisma, ensureDbSchema } from "@/lib/db";
import { SheetId, SHEET_STAFF, SUPERVISORS } from "@/lib/permissions";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  outletId: string | null;
  jobTitle: string | null;
  isActive: boolean;
}

/**
 * Returns dynamic staff names for a specific sheet.
 * Prioritizes users explicitly granted access to this sheet in SheetAccess
 * plus users assigned to the outlet, falling back gracefully.
 */
export async function getDynamicStaffForSheet(sheetKey: SheetId, outletId?: string): Promise<string[]> {
  await ensureDbSchema();
  try {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        OR: [
          { sheetAccess: { some: { sheet: sheetKey } } },
          { role: { in: ["ADMIN", "SUPERVISOR"] } },
          outletId ? { outletId: { in: [outletId, "all"] } } : {},
        ],
      },
      select: { name: true },
      orderBy: { name: "asc" },
    });

    const dbNames = users.map((u: { name: string }) => u.name).filter(Boolean);
    if (dbNames.length > 0) {
      return Array.from(new Set(dbNames));
    }
  } catch (err) {
    console.error("Error fetching dynamic staff for sheet:", err);
  }
  return SHEET_STAFF[sheetKey] || [];
}

/**
 * Returns dynamic supervisor names (ADMIN & SUPERVISOR roles) for an outlet.
 */
export async function getDynamicSupervisors(outletId?: string): Promise<string[]> {
  await ensureDbSchema();
  try {
    const supervisors = await prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: ["ADMIN", "SUPERVISOR"] },
        ...(outletId ? { OR: [{ outletId: null }, { outletId: "all" }, { outletId }] } : {}),
      },
      select: { name: true },
      orderBy: { name: "asc" },
    });

    const dbNames = supervisors.map((u: { name: string }) => u.name).filter(Boolean);
    if (dbNames.length > 0) {
      return Array.from(new Set(dbNames));
    }
  } catch (err) {
    console.error("Error fetching dynamic supervisors:", err);
  }
  return SUPERVISORS;
}

/**
 * Returns all active employees for an outlet or across all outlets.
 */
export async function getAllActiveEmployees(outletId?: string): Promise<StaffMember[]> {
  await ensureDbSchema();
  try {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        ...(outletId ? { OR: [{ outletId: null }, { outletId: "all" }, { outletId }] } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        outletId: true,
        jobTitle: true,
        isActive: true,
      },
      orderBy: { name: "asc" },
    });
    return users;
  } catch (err) {
    console.error("Error fetching all active employees:", err);
    return [];
  }
}
