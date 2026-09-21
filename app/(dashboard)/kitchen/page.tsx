import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { hasSheetAccess, getTodayString, formatDate } from "@/lib/permissions";
import { BAKERY_KITCHEN_ITEMS } from "@/lib/outlets";
import GenericChecklistForm from "@/components/GenericChecklistForm";

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

  const { getDynamicStaffForSheet, getDynamicSupervisors } = await import("@/lib/staff");
  const staffList = await getDynamicStaffForSheet("KITCHEN", "bakery");
  const supervisorsList = await getDynamicSupervisors("bakery");

  return (
    <GenericChecklistForm
      title="Kitchen Hygiene Report"
      icon="🍳"
      sheet="kitchen"
      sheetKey="KITCHEN"
      equipment={BAKERY_KITCHEN_ITEMS}
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
