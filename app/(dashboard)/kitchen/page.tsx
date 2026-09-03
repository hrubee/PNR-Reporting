import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { hasSheetAccess, getTodayString, formatDate } from "@/lib/permissions";
import GenericChecklistForm from "@/components/GenericChecklistForm";

const EQUIPMENT = [
  "OVEN 1", "OVEN 2", "OVEN 3",
  "ELECTRIC GAS RANGE 1", "ELECTRIC GAS RANGE 2",
  "GAS BURNER 3 BURNER", "GAS BURNER SINGLE",
  "WORKING TABLE 1", "WORKING TABLE 2", "WORKING TABLE 3",
  "WORKING TABLE 4", "WORKING TABLE 5", "WORKING TABLE 6",
  "WET - DRY DUSTBIN",
  "MIXER GRINDER", "MASALA GRINDER", "KHEEMA MACHINE",
  "PROOFER", "TANDOOR", "SINK 1", "CHILLER BLASTER",
];

export default async function KitchenPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as { id: string; name: string; role: string };

  const canAccess = await hasSheetAccess(user.id, "KITCHEN", user.role);
  if (!canAccess) redirect("/dashboard");

  const today = getTodayString();
  const todayEntries = await prisma.kitchenEntry.findMany({
    where: { date: today },
    orderBy: { createdAt: "desc" },
    include: { submittedBy: true },
  });

  const history = await prisma.kitchenEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { submittedBy: true },
  });

  return (
    <GenericChecklistForm
      title="Kitchen Hygiene Report"
      icon="🍳"
      sheet="kitchen"
      sheetKey="KITCHEN"
      equipment={EQUIPMENT}
      today={today}
      todayLabel={formatDate(today)}
      todayEntries={JSON.parse(JSON.stringify(todayEntries))}
      history={JSON.parse(JSON.stringify(history))}
      userName={user.name}
    />
  );
}
