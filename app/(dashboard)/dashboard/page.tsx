import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SHEET_LABELS, SHEET_ROUTES, getTodayString, formatDate } from "@/lib/permissions";

type SheetKey = keyof typeof SHEET_LABELS;

const SHEET_ICONS: Record<SheetKey, string> = {
  HYGIENE_REPORT: "🧹",
  GLASS_REPORT: "🪟",
  FRIDGE_REPORT: "🧊",
  KITCHEN: "🍳",
  PRODUCTION: "🏭",
  PUFF_ROOM: "🥐",
  CAKE_ROOM: "🎂",
};

async function getTodayStatus(today: string) {
  const [hygiene, glass, fridge, kitchen, production, puffRoom, cakeRoom] =
    await Promise.all([
      prisma.hygieneEntry.findMany({ where: { date: today }, orderBy: { createdAt: "desc" }, include: { submittedBy: true } }),
      prisma.glassEntry.findMany({ where: { date: today }, orderBy: { createdAt: "desc" }, include: { submittedBy: true } }),
      prisma.fridgeEntry.findMany({ where: { date: today }, orderBy: { createdAt: "desc" }, include: { submittedBy: true } }),
      prisma.kitchenEntry.findMany({ where: { date: today }, orderBy: { createdAt: "desc" }, include: { submittedBy: true } }),
      prisma.productionEntry.findMany({ where: { date: today }, orderBy: { createdAt: "desc" }, include: { submittedBy: true } }),
      prisma.puffRoomEntry.findMany({ where: { date: today }, orderBy: { createdAt: "desc" }, include: { submittedBy: true } }),
      prisma.cakeRoomEntry.findMany({ where: { date: today }, orderBy: { createdAt: "desc" }, include: { submittedBy: true } }),
    ]);

  return { hygiene, glass, fridge, kitchen, production, puffRoom, cakeRoom };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as { id: string; name: string; role: string };

  const today = getTodayString();
  const statuses = await getTodayStatus(today);

  const sheetsData = [
    { key: "HYGIENE_REPORT" as SheetKey, list: statuses.hygiene },
    { key: "GLASS_REPORT" as SheetKey, list: statuses.glass },
    { key: "FRIDGE_REPORT" as SheetKey, list: statuses.fridge },
    { key: "KITCHEN" as SheetKey, list: statuses.kitchen },
    { key: "PRODUCTION" as SheetKey, list: statuses.production },
    { key: "PUFF_ROOM" as SheetKey, list: statuses.puffRoom },
    { key: "CAKE_ROOM" as SheetKey, list: statuses.cakeRoom },
  ];

  // Access list for employee
  let accessibleSheets: Set<string> = new Set();
  if (user.role === "ADMIN") {
    accessibleSheets = new Set(Object.keys(SHEET_LABELS));
  } else {
    const access = await prisma.sheetAccess.findMany({
      where: { userId: user.id },
      select: { sheet: true },
    });
    accessibleSheets = new Set(access.map((a) => a.sheet));
  }

  const completedSheetsCount = sheetsData.filter((s) => s.list.length > 0).length;
  const totalSubmissionsToday = sheetsData.reduce((acc, s) => acc + s.list.length, 0);

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>👋 Good day, {user.name.split(" ")[0]}!</h1>
          <p>Today is {formatDate(today)}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📋</div>
          <div>
            <div className="stat-value">{completedSheetsCount}/7</div>
            <div className="stat-label">Sheets Completed Today</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">📝</div>
          <div>
            <div className="stat-value">{totalSubmissionsToday}</div>
            <div className="stat-label">Total Entries Recorded</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">⏳</div>
          <div>
            <div className="stat-value">{7 - completedSheetsCount}</div>
            <div className="stat-label">Pending Sheets</div>
          </div>
        </div>
        {user.role === "ADMIN" && (
          <div className="stat-card">
            <div className="stat-icon blue">👥</div>
            <div>
              <div className="stat-value">
                {Math.round((completedSheetsCount / 7) * 100)}%
              </div>
              <div className="stat-label">Daily Compliance Rate</div>
            </div>
          </div>
        )}
      </div>

      {/* Today's Sheet Status */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">📅 Today&apos;s Hygiene Status</div>
            <div className="card-subtitle">{formatDate(today)}</div>
          </div>
          <div
            className="badge"
            style={
              completedSheetsCount === 7
                ? { background: "var(--success-bg)", color: "var(--success)" }
                : { background: "var(--warning-bg)", color: "var(--warning)" }
            }
          >
            {completedSheetsCount} / 7 Completed
          </div>
        </div>

        <div className="status-grid">
          {sheetsData.map(({ key, list }) => {
            const hasAccess = user.role === "ADMIN" || accessibleSheets.has(key);
            const isDone = list.length > 0;
            const latest = list[0];
            const latestTime = latest
              ? new Date(latest.createdAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null;

            return (
              <Link
                key={key}
                href={hasAccess ? SHEET_ROUTES[key] : "#"}
                className={`status-card ${isDone ? "submitted" : "pending"} ${
                  !hasAccess ? "no-access" : ""
                }`}
                style={!hasAccess ? { opacity: 0.35, pointerEvents: "none" } : {}}
              >
                <div className={`status-dot ${isDone ? "submitted" : "pending"}`}>
                  {SHEET_ICONS[key]}
                </div>
                <div className="status-info">
                  <div className="status-name">{SHEET_LABELS[key]}</div>
                  <div className="status-meta">
                    {!hasAccess ? (
                      "No access"
                    ) : isDone ? (
                      <span>
                        ✓ {list.length} {list.length === 1 ? "entry" : "entries"} (latest by{" "}
                        <strong>{latest.submittedBy.name}</strong> @ {latestTime})
                      </span>
                    ) : (
                      "⏳ Not yet submitted"
                    )}
                  </div>
                </div>
                {hasAccess && (
                  <span className="status-arrow">
                    {isDone ? "👁" : "→"}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
