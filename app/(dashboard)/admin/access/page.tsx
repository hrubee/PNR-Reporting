import { auth } from "@/lib/auth";
import { prisma, ensureDbSchema } from "@/lib/db";
import { redirect } from "next/navigation";
import AccessMatrixClient from "./AccessMatrixClient";

export default async function AccessPage() {
  await ensureDbSchema();
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as { role: string };
  if (user.role !== "ADMIN") redirect("/");

  let users: any[] = [];
  try {
    users = await prisma.user.findMany({
      where: { isActive: true, role: { not: "ADMIN" } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, role: true, outletId: true, jobTitle: true },
    });
  } catch (err) {
    console.error("Error loading users in AccessPage:", err);
    try {
      users = await prisma.user.findMany({
        where: { isActive: true, role: { not: "ADMIN" } },
        orderBy: { name: "asc" },
        select: { id: true, name: true, email: true, role: true },
      });
      users = users.map((u) => ({ ...u, outletId: "all", jobTitle: "" }));
    } catch {
      users = [];
    }
  }

  let access: any[] = [];
  try {
    access = await prisma.sheetAccess.findMany({ select: { userId: true, sheet: true } });
  } catch (err) {
    console.error("Error loading SheetAccess:", err);
    access = [];
  }

  return (
    <AccessMatrixClient
      users={JSON.parse(JSON.stringify(users))}
      initialAccess={JSON.parse(JSON.stringify(access))}
    />
  );
}
