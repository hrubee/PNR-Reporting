import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { hasSheetAccess, getTodayString, formatDate } from "@/lib/permissions";
import { BAKERY_CAKE_ROOM_ITEMS } from "@/lib/outlets";
import GenericChecklistForm from "@/components/GenericChecklistForm";

export default async function CakeRoomPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as { id: string; name: string; role: string };

  const canAccess = await hasSheetAccess(user.id, "CAKE_ROOM", user.role);
  if (!canAccess) redirect("/dashboard");

  const today = getTodayString();
  const todayEntries = await prisma.cakeRoomEntry.findMany({
    where: { date: today },
    orderBy: { createdAt: "desc" },
    include: { submittedBy: true },
  });

  const history = await prisma.cakeRoomEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { submittedBy: true },
  });

  const { getDynamicStaffForSheet, getDynamicSupervisors } = await import("@/lib/staff");
  const staffList = await getDynamicStaffForSheet("CAKE_ROOM", "bakery");
  const supervisorsList = await getDynamicSupervisors("bakery");

  return (
    <GenericChecklistForm
      title="Cake Room Hygiene Report"
      icon="🎂"
      sheet="cake-room"
      sheetKey="CAKE_ROOM"
      equipment={BAKERY_CAKE_ROOM_ITEMS}
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
