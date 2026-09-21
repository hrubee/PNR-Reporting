"use client";
import { useState } from "react";

const SHEETS = [
  { key: "HYGIENE_REPORT", label: "Hygiene", icon: "🧹", outlet: "Bakery", outletId: "bakery" },
  { key: "GLASS_REPORT", label: "Glass", icon: "🪟", outlet: "Bakery", outletId: "bakery" },
  { key: "FRIDGE_REPORT", label: "Fridge", icon: "🧊", outlet: "Bakery", outletId: "bakery" },
  { key: "KITCHEN", label: "Kitchen", icon: "🍳", outlet: "Bakery", outletId: "bakery" },
  { key: "PRODUCTION", label: "Production", icon: "🏭", outlet: "Bakery", outletId: "bakery" },
  { key: "PUFF_ROOM", label: "Puff Room", icon: "🥐", outlet: "Bakery", outletId: "bakery" },
  { key: "CAKE_ROOM", label: "Cake Room", icon: "🎂", outlet: "Bakery", outletId: "bakery" },
  // Oreta World
  { key: "ORETA_SHOP_CLEANING", label: "House Keeping", icon: "🧹", outlet: "Oreta World", outletId: "oreta-world" },
  { key: "ORETA_EQUIPMENT", label: "Oreta Equipment", icon: "⚙️", outlet: "Oreta World", outletId: "oreta-world" },
  { key: "ORETA_FRIDGE", label: "Oreta Fridge", icon: "🧊", outlet: "Oreta World", outletId: "oreta-world" },
  { key: "ORETA_GLASS", label: "Oreta Glass", icon: "🪟", outlet: "Oreta World", outletId: "oreta-world" },
  { key: "ORETA_MONTHLY", label: "Oreta Monthly", icon: "🗓️", outlet: "Oreta World", outletId: "oreta-world" },
  { key: "ORETA_FOOD", label: "Oreta Food", icon: "🍲", outlet: "Oreta World", outletId: "oreta-world" },
  // RNS World
  { key: "RNS_EQUIPMENT", label: "RNS Equipment", icon: "🏢", outlet: "RNS World", outletId: "rns-world" },
  // Symphony World
  { key: "SYMPHONY_EQUIPMENT", label: "Symphony Equip", icon: "🎼", outlet: "Symphony World", outletId: "symphony-world" },
];

interface UserType {
  id: string;
  name: string;
  email: string;
  role?: string;
  outletId?: string | null;
  jobTitle?: string | null;
}
interface AccessRecord { userId: string; sheet: string; }

export default function AccessMatrixClient({
  users, initialAccess,
}: { users: UserType[]; initialAccess: AccessRecord[] }) {
  const [access, setAccess] = useState<Set<string>>(
    new Set(initialAccess.map((a) => `${a.userId}:${a.sheet}`))
  );
  const [toggling, setToggling] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [outletFilter, setOutletFilter] = useState<"all" | "bakery" | "oreta-world" | "rns-world" | "symphony-world">("all");
  const [employeeOutletFilter, setEmployeeOutletFilter] = useState<"all" | "bakery" | "oreta-world" | "rns-world" | "symphony-world">("all");

  function hasAccess(userId: string, sheet: string) {
    return access.has(`${userId}:${sheet}`);
  }

  async function toggle(userId: string, sheet: string) {
    const key = `${userId}:${sheet}`;
    const granting = !access.has(key);
    setToggling(key);
    setAlert(null);

    const res = await fetch("/api/admin/access", {
      method: granting ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, sheet }),
    });

    if (res.ok) {
      setAccess((prev) => {
        const next = new Set(prev);
        granting ? next.add(key) : next.delete(key);
        return next;
      });
    } else {
      setAlert({ type: "error", msg: "Failed to update access. Please try again." });
    }
    setToggling(null);
  }

  function grantAll(userId: string, targetOutlet?: string) {
    const list = targetOutlet ? SHEETS.filter((s) => s.outletId === targetOutlet) : SHEETS;
    list.forEach(({ key }) => {
      if (!hasAccess(userId, key)) toggle(userId, key);
    });
  }

  function revokeAll(userId: string, targetOutlet?: string) {
    const list = targetOutlet ? SHEETS.filter((s) => s.outletId === targetOutlet) : SHEETS;
    list.forEach(({ key }) => {
      if (hasAccess(userId, key)) toggle(userId, key);
    });
  }

  const visibleSheets = outletFilter === "all" ? SHEETS : SHEETS.filter((s) => s.outletId === outletFilter);
  const filteredUsers = users.filter((u) => {
    if (employeeOutletFilter === "all") return true;
    if (!u.outletId || u.outletId === "all") return true;
    const parts = u.outletId.split(",").map((s) => s.trim());
    return parts.includes(employeeOutletFilter);
  });

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="page-header-text">
          <h1>🔐 Multi-Outlet Access Matrix</h1>
          <p>Assign sheets and permissions to employees across Bakery, Oreta World, RNS World, and Symphony World. Only authorized staff appear on forms.</p>
        </div>
      </div>

      {alert && <div className={`alert alert-${alert.type}`} style={{ marginBottom: "1rem" }}>{alert.msg}</div>}

      {/* Filter Toolbar */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)" }}>Sheet Columns:</span>
          <button
            type="button"
            className={`btn btn-sm ${outletFilter === "all" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setOutletFilter("all")}
          >
            All Sheets ({SHEETS.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${outletFilter === "bakery" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setOutletFilter("bakery")}
          >
            🥐 Bakery (7)
          </button>
          <button
            type="button"
            className={`btn btn-sm ${outletFilter === "oreta-world" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setOutletFilter("oreta-world")}
          >
            🌐 Oreta World (6)
          </button>
          <button
            type="button"
            className={`btn btn-sm ${outletFilter === "rns-world" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setOutletFilter("rns-world")}
          >
            🏢 RNS World (1)
          </button>
          <button
            type="button"
            className={`btn btn-sm ${outletFilter === "symphony-world" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setOutletFilter("symphony-world")}
          >
            🎼 Symphony World (1)
          </button>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)" }}>Filter Staff:</span>
          <button
            type="button"
            className={`btn btn-sm ${employeeOutletFilter === "all" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setEmployeeOutletFilter("all")}
          >
            All Staff ({users.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${employeeOutletFilter === "bakery" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setEmployeeOutletFilter("bakery")}
          >
            🥐 Bakery
          </button>
          <button
            type="button"
            className={`btn btn-sm ${employeeOutletFilter === "oreta-world" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setEmployeeOutletFilter("oreta-world")}
          >
            🌐 Oreta
          </button>
          <button
            type="button"
            className={`btn btn-sm ${employeeOutletFilter === "rns-world" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setEmployeeOutletFilter("rns-world")}
          >
            🏢 RNS
          </button>
          <button
            type="button"
            className={`btn btn-sm ${employeeOutletFilter === "symphony-world" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setEmployeeOutletFilter("symphony-world")}
          >
            🎼 Symphony
          </button>
        </div>
      </div>

      <div className="card">
        <div className="access-matrix">
          <table>
            <thead>
              <tr>
                <th style={{ minWidth: 220 }}>Employee Details</th>
                {visibleSheets.map((s) => (
                  <th key={s.key} style={{ textAlign: "center", minWidth: 90 }}>
                    <div>{s.icon}</div>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, marginTop: "2px" }}>{s.label}</div>
                    <div style={{ fontSize: "0.6rem", color: "var(--accent)" }}>{s.outlet}</div>
                  </th>
                ))}
                <th style={{ minWidth: 160 }}>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={visibleSheets.length + 2} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                    No employees found matching filter. Add employees in the Users section first.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{u.name}</span>
                        {u.role && (
                          <span
                            className={`badge ${
                              u.role === "SUPERVISOR"
                                ? "badge-submitted"
                                : "badge-pending"
                            }`}
                            style={{ fontSize: "0.65rem", padding: "1px 6px" }}
                          >
                            {u.role}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        {u.email}
                        {u.jobTitle && ` • ${u.jobTitle}`}
                        {u.outletId && ` • ${
                          !u.outletId || u.outletId === "all"
                            ? "All Outlets"
                            : u.outletId
                                .split(",")
                                .map((o) =>
                                  o === "bakery"
                                    ? "Bakery"
                                    : o === "oreta-world"
                                    ? "Oreta"
                                    : o === "rns-world"
                                    ? "RNS"
                                    : o === "symphony-world"
                                    ? "Symphony"
                                    : o
                                )
                                .join(", ")
                        }`}
                      </div>
                    </td>
                    {visibleSheets.map((s) => {
                      const key = `${u.id}:${s.key}`;
                      const on = hasAccess(u.id, s.key);
                      const busy = toggling === key;
                      return (
                        <td key={s.key} style={{ textAlign: "center" }}>
                          <button
                            className={`access-toggle ${on ? "on" : "off"}`}
                            onClick={() => toggle(u.id, s.key)}
                            disabled={busy}
                            title={on ? `Remove ${u.name}'s access to ${s.label}` : `Grant ${u.name} access to ${s.label}`}
                          />
                        </td>
                      );
                    })}
                    <td>
                      <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                        <button className="btn btn-sm btn-success" onClick={() => grantAll(u.id)} title="Grant all visible sheets">
                          All ✓
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => revokeAll(u.id)} title="Revoke all visible sheets">
                          None ✗
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: "1.5rem", padding: "1rem", background: "rgba(120,53,15,0.06)", borderRadius: "8px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
          <strong style={{ color: "var(--text-primary)" }}>ℹ️ Dynamic Staff & Supervisor Permission Rules:</strong>
          <ul style={{ margin: "0.5rem 0 0 1.25rem", padding: 0 }}>
            <li>When an employee is granted access to a sheet here, their name immediately appears in that sheet&apos;s staff selection dropdowns.</li>
            <li>If an employee is toggled OFF, they will not see the sheet tab in their dashboard and will not appear in the assignment dropdown.</li>
            <li>Admins and Supervisors assigned to an outlet appear in the &quot;Verified / Supervised By&quot; dropdowns.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

