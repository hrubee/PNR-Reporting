import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { hasSheetAccess, getTodayString, formatDate } from "@/lib/permissions";
import GlassForm from "./GlassForm";

const LOCATIONS = [
  "OVEN ROOM 1", "PARTITION GLASS 4",
  "PRODUCTION ROOM 1", "WINDOW 1",
  "PRODUCTION ROOM DOOR",
  "PUFF ROOM PARTITION GLASS 2 LEFT", "PUFF ROOM PARTITION GLASS 2 RIGHT", "PUFF ROOM DOOR",
  "ADMIN DOOR", "ADMIN WINDOW 1", "ADMIN WINDOW 2",
  "MAIN ENTRANCE DOOR", "STORE ROOM DOOR GROUND",
  "CAKE ROOM WINDOW 1", "CAKE ROOM WINDOW 2",
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

  return (
    <GlassForm
      locations={LOCATIONS}
      today={today}
      todayLabel={formatDate(today)}
      todayEntries={JSON.parse(JSON.stringify(todayEntries))}
      history={JSON.parse(JSON.stringify(history))}
      userName={user.name}
    />
  );
}
