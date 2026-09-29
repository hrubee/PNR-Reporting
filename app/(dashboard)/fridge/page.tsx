import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { hasSheetAccess, getTodayString, formatDate } from "@/lib/permissions";
import FridgeForm from "./FridgeForm";

export const FRIDGE_ITEMS = [
  // Kitchen
  { zone: "Kitchen", productName: "Freezer", machineNumber: "1", referenceTemp: "-1 to -18°C" },

  // Fridge Room
  { zone: "Fridge Room", productName: "Freezer", machineNumber: "1", referenceTemp: "-1 to -18°C" },
  { zone: "Fridge Room", productName: "Fridge", machineNumber: "1", referenceTemp: "0 to +10°C" },
  { zone: "Fridge Room", productName: "Fridge", machineNumber: "2", referenceTemp: "0 to +10°C" },
  { zone: "Fridge Room", productName: "Fridge", machineNumber: "3", referenceTemp: "0 to +10°C" },

  // Production Room
  { zone: "Production Room", productName: "Freezer", machineNumber: "1", referenceTemp: "-1 to -18°C" },
  { zone: "Production Room", productName: "Fridge", machineNumber: "1", referenceTemp: "0 to +10°C" },

  // Cake Room
  { zone: "Cake Room", productName: "Cold Room", machineNumber: "1", referenceTemp: "0 to +10°C" },
  { zone: "Cake Room", productName: "Freezer", machineNumber: "1", referenceTemp: "-1 to -18°C" },
  { zone: "Cake Room", productName: "Freezer", machineNumber: "2", referenceTemp: "-1 to -18°C" },

  // Store Room
  { zone: "Store Room", productName: "Freezer", machineNumber: "1", referenceTemp: "-1 to -18°C" },
  { zone: "Store Room", productName: "Chiller Blaster", machineNumber: "1", referenceTemp: "—" },
];

export default async function FridgePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as { id: string; name: string; role: string };

  const canAccess = await hasSheetAccess(user.id, "FRIDGE_REPORT", user.role);
  if (!canAccess) redirect("/dashboard");

  const today = getTodayString();
  const todayEntries = await prisma.fridgeEntry.findMany({
    where: { date: today },
    orderBy: { createdAt: "desc" },
    include: { submittedBy: true },
  });

  const history = await prisma.fridgeEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { submittedBy: true },
  });

  const { getDynamicStaffForSheet, getDynamicSupervisors } = await import("@/lib/staff");
  const staffList = await getDynamicStaffForSheet("FRIDGE_REPORT", "bakery");
  const supervisorsList = await getDynamicSupervisors("bakery");

  return (
    <FridgeForm
      items={FRIDGE_ITEMS}
      today={today}
      todayLabel={formatDate(today)}
      todayEntries={JSON.parse(JSON.stringify(todayEntries))}
      history={JSON.parse(JSON.stringify(history))}
      userName={user.name}
      staffList={staffList}
      supervisorsList={supervisorsList}
    />
  );
}
