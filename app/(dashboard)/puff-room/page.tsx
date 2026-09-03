import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { hasSheetAccess, getTodayString, formatDate } from "@/lib/permissions";
import GenericChecklistForm from "@/components/GenericChecklistForm";

const EQUIPMENT = [
  "DOUGH SHEETER",
  "TABLE 1", "TABLE 2", "TABLE 3", "TABLE 4",
  "WASH SINK 1", "OFFICE DESK", "CHAIR",
  "WET - DRY DUSTBIN",
  "STORE ROOM 1", "LIFT", "CUPBOARD 1", "CUPBOARD 2",
  "STORE ROOM 2", "RACKS",
];

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

  return (
    <GenericChecklistForm
      title="Puff Room Hygiene Report"
      icon="🥐"
      sheet="puff-room"
      sheetKey="PUFF_ROOM"
      equipment={EQUIPMENT}
      today={today}
      todayLabel={formatDate(today)}
      todayEntries={JSON.parse(JSON.stringify(todayEntries))}
      history={JSON.parse(JSON.stringify(history))}
      userName={user.name}
    />
  );
}
