import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { hasSheetAccess, getTodayString, formatDate } from "@/lib/permissions";
import { BAKERY_PUFF_ROOM_ITEMS } from "@/lib/outlets";
import GenericChecklistForm from "@/components/GenericChecklistForm";

export default async function PuffRoomPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as { id: string; name: string; role: string };

  const canAccess = await hasSheetAccess(user.id, "PUFF_ROOM", user.role);
  if (!canAccess) redirect("/dashboard");

  const today = getTodayString();
  const todayEntries = await prisma.puffRoomEntry.findMany({
    where: { date: today },
    orderBy: { createdAt: "desc" },
    include: { submittedBy: true },
  });

  const history = await prisma.puffRoomEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { submittedBy: true },
  });

  const { getDynamicStaffForSheet, getDynamicSupervisors } = await import("@/lib/staff");
  const staffList = await getDynamicStaffForSheet("PUFF_ROOM", "bakery");
  const supervisorsList = await getDynamicSupervisors("bakery");

  return (
    <GenericChecklistForm
      title="Puff Room Hygiene Report"
      icon="🥐"
      sheet="puff-room"
      sheetKey="PUFF_ROOM"
      equipment={BAKERY_PUFF_ROOM_ITEMS}
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
