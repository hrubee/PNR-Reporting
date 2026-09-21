import { auth } from "@/lib/auth";
import { prisma, ensureDbSchema } from "@/lib/db";
import { redirect } from "next/navigation";
import { getTodayString, formatDate, hasSheetAccess } from "@/lib/permissions";
import RnsEquipmentForm from "./RnsEquipmentForm";

export default async function RnsEquipmentPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await ensureDbSchema();

  const user = session.user as { id: string; name: string; email: string; role: string };
  const canAccess = await hasSheetAccess(user.id, "RNS_EQUIPMENT", user.role);
  if (!canAccess) {
    return (
      <div className="page-container">
        <div className="error-banner">
          ⛔ You do not have access to the RNS World Equipment & Hygiene sheet. Please contact an administrator.
        </div>
      </div>
    );
  }

  const today = getTodayString();

  let todayEntries: any[] = [];
  let history: any[] = [];
  try {
    todayEntries = await prisma.rnsEquipmentEntry.findMany({
      where: { date: today },
      orderBy: { createdAt: "desc" },
      include: { submittedBy: { select: { name: true } } },
    });

    history = await prisma.rnsEquipmentEntry.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { submittedBy: { select: { name: true } } },
    });
  } catch (err) {
    console.error("Error fetching RNS equipment entries:", err);
  }

  const { getDynamicStaffForSheet, getDynamicSupervisors } = await import("@/lib/staff");
  const staffList = await getDynamicStaffForSheet("RNS_EQUIPMENT", "rns-world");
  const supervisorsList = await getDynamicSupervisors("rns-world");

  return (
    <RnsEquipmentForm
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
