import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { hasSheetAccess, getTodayString, formatDate } from "@/lib/permissions";
import { BAKERY_PRODUCTION_ITEMS } from "@/lib/outlets";
import GenericChecklistForm from "@/components/GenericChecklistForm";

export default async function ProductionPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as { id: string; name: string; role: string };

  const canAccess = await hasSheetAccess(user.id, "PRODUCTION", user.role);
  if (!canAccess) redirect("/dashboard");

  const today = getTodayString();
  const todayEntries = await prisma.productionEntry.findMany({
    where: { date: today },
    orderBy: { createdAt: "desc" },
    include: { submittedBy: true },
  });

  const history = await prisma.productionEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { submittedBy: true },
  });

  const { getDynamicStaffForSheet, getDynamicSupervisors } = await import("@/lib/staff");
  const staffList = await getDynamicStaffForSheet("PRODUCTION", "bakery");
  const supervisorsList = await getDynamicSupervisors("bakery");

  return (
    <GenericChecklistForm
      title="Production Hygiene Report"
      icon="🏭"
      sheet="production"
      sheetKey="PRODUCTION"
      equipment={BAKERY_PRODUCTION_ITEMS}
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
