import { prisma, ensureDbSchema } from "@/lib/db";
import { SheetId, SHEET_STAFF, SUPERVISORS, OUTLET_SUPERVISORS } from "@/lib/permissions";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  outletId: string | null;
  jobTitle: string | null;
  isActive: boolean;
}

export const SHEET_TO_OUTLET: Record<SheetId, string> = {
  HYGIENE_REPORT: "bakery",
  GLASS_REPORT: "bakery",
  FRIDGE_REPORT: "bakery",
  KITCHEN: "bakery",
  PRODUCTION: "bakery",
  PUFF_ROOM: "bakery",
  CAKE_ROOM: "bakery",
  ORETA_SHOP_CLEANING: "oreta-world",
  ORETA_EQUIPMENT: "oreta-world",
  ORETA_FRIDGE: "oreta-world",
  ORETA_GLASS: "oreta-world",
  ORETA_MONTHLY: "oreta-world",
  ORETA_FOOD: "oreta-world",
  ORETA_HYGIENE: "oreta-world",
  RNS_EQUIPMENT: "rns-world",
  SYMPHONY_EQUIPMENT: "symphony-world",
};

export { OUTLET_SUPERVISORS };

/**
 * Helper to build Prisma OR condition for multi-outlet support.
 * Checks if outletId contains or equals the requested outletId.
 */
export function getOutletFilterConditions(outletId?: string) {
  if (!outletId || outletId === "all") return undefined;
  return [
    { outletId: outletId },
    { outletId: { contains: outletId } },
  ];
}

/**
 * Returns dynamic staff names for a specific sheet.
 * STRICT DOUBLE GATE:
 *   1. Employee must belong to the sheet's outlet (outlet isolation)
 *   2. Employee must have explicit sheetAccess for that sheet (access matrix)
 * No employee from another outlet will ever appear here.
 */
export async function getDynamicStaffForSheet(sheetKey: SheetId, outletId?: string): Promise<string[]> {
  await ensureDbSchema();
  try {
    const targetOutlet = outletId || SHEET_TO_OUTLET[sheetKey];
    const outletConds = getOutletFilterConditions(targetOutlet);

    const sheetAliases = (sheetKey === "ORETA_SHOP_CLEANING" || sheetKey === "ORETA_HYGIENE")
      ? ["ORETA_SHOP_CLEANING", "ORETA_HYGIENE"]
      : [sheetKey];

    // Gate 1: outlet scope — only employees belonging to this outlet
    // Gate 2: sheet access — only employees explicitly granted this sheet
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        role: "EMPLOYEE",
        ...(outletConds ? { OR: outletConds } : {}),
        sheetAccess: { some: { sheet: { in: sheetAliases } } },
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
  // Fallback: only if no DB access records exist yet (fresh setup)
  return SHEET_STAFF[sheetKey] || [];
}

/**
 * Returns dynamic supervisor names (role: SUPERVISOR only) for an outlet.
 * Supports supervisors assigned to multiple outlets via comma-separated IDs.
 */
export async function getDynamicSupervisors(outletId?: string): Promise<string[]> {
  await ensureDbSchema();
  try {
    const outletConds = getOutletFilterConditions(outletId);
    const supervisors = await prisma.user.findMany({
      where: {
        isActive: true,
        role: "SUPERVISOR",
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
  return (outletId && OUTLET_SUPERVISORS[outletId]) || SUPERVISORS;
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
        role: "EMPLOYEE", // STRICTLY ONLY EMPLOYEES
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
