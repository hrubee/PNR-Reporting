import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { hasSheetAccess, getTodayString, formatDate, getDayName } from "@/lib/permissions";
import HygieneForm from "./HygieneForm";

const AREAS = [
  "PRODUCTION ROOM",
  "OVEN ROOM",
  "FRIDGE ROOM",
  "UTILITY AREA",
  "PUFF DEPARTMENT",
  "ADMIN",
  "STORE 1",
  "PASSAGE GROUND FLOOR",
  "SECURITY AREA",
  "TOILET GUEST",
  "SIR OFFICE",
  "TOILET",
  "CAKE ROOM",
  "PASSAGE FIRST FLOOR",
  "STORE ROOM 2",
  "OUTSIDE COMPOUND",
];

export default async function HygienePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as { id: string; name: string; role: string };

  const canAccess = await hasSheetAccess(user.id, "HYGIENE_REPORT", user.role);
  if (!canAccess) redirect("/dashboard");

  const today = getTodayString();
  const todayEntries = await prisma.hygieneEntry.findMany({
    where: { date: today },
    orderBy: { createdAt: "desc" },
    include: { submittedBy: true },
  });

  const history = await prisma.hygieneEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { submittedBy: true },
  });

  return (
    <HygieneForm
      areas={AREAS}
      today={today}
      todayLabel={formatDate(today)}
      dayName={getDayName(today)}
      todayEntries={JSON.parse(JSON.stringify(todayEntries))}
      history={JSON.parse(JSON.stringify(history))}
      userId={user.id}
      userName={user.name}
      isAdmin={user.role === "ADMIN"}
    />
  );
}
