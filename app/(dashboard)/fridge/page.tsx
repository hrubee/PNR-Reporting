import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { hasSheetAccess, getTodayString, formatDate } from "@/lib/permissions";
import FridgeForm from "./FridgeForm";

export const FRIDGE_ITEMS = [
  { zone: "PRODUCTION — FRIDGES", productName: "FRIDGE UNDER TABLE", machineNumber: "1", referenceTemp: "+3 to +8°C" },
  { zone: "PRODUCTION — FRIDGES", productName: "FRIDGE", machineNumber: "2", referenceTemp: "+3 to +8°C" },
  { zone: "PRODUCTION — FRIDGES", productName: "FRIDGE", machineNumber: "3", referenceTemp: "+3 to +8°C" },
  { zone: "PRODUCTION — FRIDGES", productName: "FRIDGE", machineNumber: "4", referenceTemp: "+3 to +8°C" },
  { zone: "PRODUCTION — FRIDGES", productName: "FRIDGE", machineNumber: "5", referenceTemp: "+3 to +8°C" },
  { zone: "PRODUCTION — FREEZERS", productName: "FREEZER", machineNumber: "1", referenceTemp: "-18 to -15°C" },
  { zone: "PRODUCTION — FREEZERS", productName: "FREEZER", machineNumber: "2", referenceTemp: "-18 to -15°C" },
  { zone: "PRODUCTION — FREEZERS", productName: "FREEZER", machineNumber: "3", referenceTemp: "-18 to -15°C" },
  { zone: "PRODUCTION — FREEZERS", productName: "FREEZER", machineNumber: "4", referenceTemp: "-18 to -16°C" },
  { zone: "CAKE ROOM — FRIDGES", productName: "FRIDGE", machineNumber: "1", referenceTemp: "+3 to +8°C" },
  { zone: "CAKE ROOM — FRIDGES", productName: "COLD ROOM", machineNumber: "1", referenceTemp: "+3 to +8°C" },
  { zone: "CAKE ROOM — FREEZERS", productName: "FREEZER", machineNumber: "1", referenceTemp: "-18 to -15°C" },
  { zone: "CAKE ROOM — FREEZERS", productName: "FREEZER", machineNumber: "2", referenceTemp: "-18 to -15°C" },
  { zone: "STORE ROOM", productName: "FREEZER", machineNumber: "1", referenceTemp: "-18 to -15°C" },
  { zone: "STORE ROOM", productName: "CHILLER BLASTER", machineNumber: "—", referenceTemp: "—" },
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

  return (
    <FridgeForm
      items={FRIDGE_ITEMS}
      today={today}
      todayLabel={formatDate(today)}
      todayEntries={JSON.parse(JSON.stringify(todayEntries))}
      history={JSON.parse(JSON.stringify(history))}
      userName={user.name}
    />
  );
}
