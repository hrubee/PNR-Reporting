import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { hasSheetAccess, getTodayString, formatDate } from "@/lib/permissions";
import GenericChecklistForm from "@/components/GenericChecklistForm";

const EQUIPMENT = [
  "PLANETARY MIXER 1", "PLANETARY MIXER 2",
  "TABLE 1", "TABLE 2", "TABLE 3", "TABLE 4", "TABLE 5", "MACHINE TABLE 6",
  "WET - DRY DUSTBIN",
  "STORE CABINET", "MICROWAVE 1", "WEIGHING SCALE 1",
  "MICROWAVE 2", "WEIGHING SCALE 2",
  "OFFICE DESK", "STOOL / CHAIR",
];

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

  return (
    <GenericChecklistForm
      title="Cake Room Hygiene Report"
      icon="🎂"
      sheet="cake-room"
      sheetKey="CAKE_ROOM"
      equipment={EQUIPMENT}
      today={today}
      todayLabel={formatDate(today)}
      todayEntries={JSON.parse(JSON.stringify(todayEntries))}
      history={JSON.parse(JSON.stringify(history))}
      userName={user.name}
    />
  );
}
