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
    { outletId: "all" },
  ];
}

/**
 * Returns dynamic staff names for a specific sheet based on Outlet Assignment.
 * ACCESS MATRIX DISABLED:
 * Any active employee assigned to this sheet's outlet is visible in the dropdown.
 * If a user is NOT assigned to this outlet (or unassigned), they will NOT be visible.
 */
export async function getDynamicStaffForSheet(sheetKey: SheetId, outletId?: string): Promise<string[]> {
  await ensureDbSchema();
  try {
    const targetOutlet = outletId || SHEET_TO_OUTLET[sheetKey];
    if (!targetOutlet) return [];
    const outletConds = getOutletFilterConditions(targetOutlet);
    if (!outletConds) return [];

    // Query active employees and sup employees assigned to this sheet's outlet
    // Supervisors will NOT have their names in the cleaning dropdown
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: ["EMPLOYEE", "SUP_EMPLOYEE", "sup employee"] },
        OR: outletConds,
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
  return [];
}

/**
 * Returns dynamic supervisor names (role: SUPERVISOR or SUP_EMPLOYEE) for an outlet.
 * Supports supervisors assigned to multiple outlets via comma-separated IDs.
 */
export async function getDynamicSupervisors(outletId?: string): Promise<string[]> {
  await ensureDbSchema();
  try {
    if (!outletId) return [];
    const outletConds = getOutletFilterConditions(outletId);
    if (!outletConds) return [];

    const supervisors = await prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: ["SUPERVISOR", "SUP_EMPLOYEE", "sup employee"] },
        OR: outletConds,
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
  return (outletId && OUTLET_SUPERVISORS[outletId]) || [];
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
