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

export const OUTLET_SUPERVISORS: Record<string, string[]> = {
  bakery: ["Aboli Wagh", "Sandeep Gargate", "Admin"],
  "oreta-world": ["Arzaaan", "Rukshin", "Navin", "Admin"],
  "rns-world": ["Nisha", "Navin", "Admin"],
  "symphony-world": ["Deva", "Gaurav", "Shagir", "Admin"],
};

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
 * Strictly guarantees staff belong to the sheet's designated outlet.
 */
export async function getDynamicStaffForSheet(sheetKey: SheetId, outletId?: string): Promise<string[]> {
  await ensureDbSchema();
  try {
    const targetOutlet = outletId || SHEET_TO_OUTLET[sheetKey];
    const sheetAliases = (sheetKey === "ORETA_SHOP_CLEANING" || sheetKey === "ORETA_HYGIENE")
      ? ["ORETA_SHOP_CLEANING", "ORETA_HYGIENE"]
      : [sheetKey];

    const outletConds = getOutletFilterConditions(targetOutlet);
    const defaultStaff = SHEET_STAFF[sheetKey] || [];
    const isSingleSheet = targetOutlet === "rns-world" || targetOutlet === "symphony-world";

    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        ...(outletConds ? { AND: [{ OR: outletConds }] } : {}),
        ...(isSingleSheet
          ? {}
          : {
              OR: [
                { sheetAccess: { some: { sheet: { in: sheetAliases } } } },
                { name: { in: defaultStaff } },
              ],
            }),
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
 * Supports supervisors assigned to multiple outlets via comma-separated IDs.
 */
export async function getDynamicSupervisors(outletId?: string): Promise<string[]> {
  await ensureDbSchema();
  try {
    const outletConds = getOutletFilterConditions(outletId);
    const supervisors = await prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: ["ADMIN", "SUPERVISOR"] },
        ...(outletConds
          ? {
              OR: [
                ...outletConds,
                { role: "ADMIN" },
              ],
            }
          : {}),
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
