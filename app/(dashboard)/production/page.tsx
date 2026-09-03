import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { hasSheetAccess, getTodayString, formatDate } from "@/lib/permissions";
import GenericChecklistForm from "@/components/GenericChecklistForm";

const EQUIPMENT = [
  "WORKING TABLE 1", "WORKING TABLE 2", "WORKING TABLE 3",
  "WORKING TABLE 4", "WORKING TABLE 5", "WORKING TABLE 6", "WORKING TABLE 7",
  "WET - DRY DUSTBIN",
  "DOUGH KNEADER", "SPIRAL MIXER",
  "PLANETARY MIXER 1", "PLANETARY MIXER 2", "PLANETARY MIXER 3",
  "PLANETARY MIXER 4", "PLANETARY MIXER 5", "PLANETARY MIXER 6",
  "BREAD SLICER 1 / TABLE", "BREAD SLICER 2 / TABLE",
  "BREAD BUN DIVIDER",
  "WEIGHING SCALE 1 / TABLE", "WEIGHING SCALE 2 / TABLE",
  "SEALING MACHINE 1", "SEALING MACHINE 2",
  "WASH SINK 1", "WASH SINK 2",
  "FLOUR BIN 1", "FLOUR BIN 2", "FLOUR BIN 3",
];

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

  return (
    <GenericChecklistForm
      title="Production Hygiene Report"
      icon="🏭"
      sheet="production"
      sheetKey="PRODUCTION"
      equipment={EQUIPMENT}
      today={today}
      todayLabel={formatDate(today)}
      todayEntries={JSON.parse(JSON.stringify(todayEntries))}
      history={JSON.parse(JSON.stringify(history))}
      userName={user.name}
    />
  );
}
