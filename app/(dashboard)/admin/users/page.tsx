import { auth } from "@/lib/auth";
import { prisma, ensureDbSchema } from "@/lib/db";
import { redirect } from "next/navigation";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  await ensureDbSchema();
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as { role: string };
  if (user.role !== "ADMIN") redirect("/");

  let users: any[] = [];
  try {
    users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        outletId: true,
        jobTitle: true,
        isActive: true,
        createdAt: true,
      },
    });
  } catch (err) {
    console.error("Error loading users with all fields:", err);
    try {
      users = await prisma.user.findMany({
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });
      users = users.map((u) => ({ ...u, outletId: "all", jobTitle: "" }));
    } catch (e2) {
      console.error("Error loading users fallback:", e2);
      users = [];
    }
  }

  return <UsersClient initialUsers={JSON.parse(JSON.stringify(users))} />;
}
