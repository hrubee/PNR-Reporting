import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import AccessMatrixClient from "./AccessMatrixClient";

export default async function AccessPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as { role: string };
  if (user.role !== "ADMIN") redirect("/");

  const users = await prisma.user.findMany({
    where: { role: "EMPLOYEE", isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });

  const access = await prisma.sheetAccess.findMany({ select: { userId: true, sheet: true } });

  return (
    <AccessMatrixClient
      users={JSON.parse(JSON.stringify(users))}
      initialAccess={JSON.parse(JSON.stringify(access))}
    />
  );
}
