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
 * Helper to build Prisma OR condition for multi-outlet support.
 * Checks if outletId is null, empty, 'all', or contains the requested outletId.
 */
function getOutletFilterConditions(outletId?: string) {
  if (!outletId || outletId === "all") return undefined;
  return [
    { outletId: null },
    { outletId: "" },
    { outletId: "all" },
    { outletId: { contains: "all" } },
    { outletId: { contains: outletId } },
  ];
}

/**
 * Returns dynamic staff names for a specific sheet.
 * Prioritizes users explicitly granted access to this sheet in SheetAccess
 * plus users assigned to the outlet, falling back gracefully.
 */
export async function getDynamicStaffForSheet(sheetKey: SheetId, outletId?: string): Promise<string[]> {
  await ensureDbSchema();
  try {
    const outletConds = getOutletFilterConditions(outletId);
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        OR: [
          { sheetAccess: { some: { sheet: sheetKey } } },
          { role: { in: ["ADMIN", "SUPERVISOR"] } },
          ...(outletConds ? [{ OR: outletConds }] : []),
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
 * Supports supervisors assigned to multiple outlets via comma-separated IDs or 'all'.
 */
export async function getDynamicSupervisors(outletId?: string): Promise<string[]> {
  await ensureDbSchema();
  try {
    const outletConds = getOutletFilterConditions(outletId);
    const supervisors = await prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: ["ADMIN", "SUPERVISOR"] },
        ...(outletConds ? { OR: outletConds } : {}),
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
    const outletConds = getOutletFilterConditions(outletId);
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        ...(outletConds ? { OR: outletConds } : {}),
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
