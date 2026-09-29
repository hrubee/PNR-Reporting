import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { hasSheetAccess, getTodayString, formatDate } from "@/lib/permissions";
import GlassForm from "./GlassForm";

const LOCATIONS = [
  "Oven Room 1",
  "Partition Glass 4",
  "Production Room 1",
  "Window 1",
  "Production Room Door",
  "Puff Room Partition Glass 2 Left",
  "Puff Room Partition Glass 2 Right",
  "Puff Room Door",
  "Admin Door",
  "Admin Window 1",
  "Admin Window 2",
  "Main Entrance Door",
  "Store Room Door Ground",
  "Cake Room Window 1",
  "Cake Room Window 2",
];

export default async function GlassPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as { id: string; name: string; role: string };

  const canAccess = await hasSheetAccess(user.id, "GLASS_REPORT", user.role);
  if (!canAccess) redirect("/dashboard");

  const today = getTodayString();
  const todayEntries = await prisma.glassEntry.findMany({
    where: { date: today },
    orderBy: { createdAt: "desc" },
    include: { submittedBy: true },
  });

  const history = await prisma.glassEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { submittedBy: true },
  });

  const { getDynamicStaffForSheet, getDynamicSupervisors } = await import("@/lib/staff");
  const staffList = await getDynamicStaffForSheet("GLASS_REPORT", "bakery");
  const supervisorsList = await getDynamicSupervisors("bakery");

  return (
    <GlassForm
      locations={LOCATIONS}
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
