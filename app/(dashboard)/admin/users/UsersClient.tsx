"use client";
import { useState } from "react";
import Link from "next/link";

export const ALL_OUTLET_OPTIONS = [
  { id: "bakery", label: "Bakery", icon: "🥐" },
  { id: "oreta-world", label: "Oreta World", icon: "🌐" },
  { id: "rns-world", label: "RNS World", icon: "🏢" },
  { id: "symphony-world", label: "Symphony World", icon: "🎼" },
];

export function parseOutlets(outletId?: string | null): string[] {
  if (outletId === "all") return ALL_OUTLET_OPTIONS.map((o) => o.id);
  if (!outletId) return [];
  const list = outletId.split(",").map((s) => s.trim()).filter(Boolean);
  return list;
}

export function encodeOutlets(selected: string[]): string {
  if (selected.length === 0) return "";
  return selected.join(",");
}

interface UserType {
  id: string;
  name: string;
  email: string;
  role: string;
  outletId?: string | null;
  jobTitle?: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function UsersClient({ initialUsers }: { initialUsers: UserType[] }) {
  const [users, setUsers] = useState<UserType[]>(initialUsers);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    selectedOutlets: ALL_OUTLET_OPTIONS.map((o) => o.id),
    jobTitle: "",
  });

  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [outletFilter, setOutletFilter] = useState<string>("all");

  function openCreateModal() {
    setIsEditing(false);
    setEditId(null);
    setForm({
      name: "",
      email: "",
      password: "",
      role: "EMPLOYEE",
      selectedOutlets: ALL_OUTLET_OPTIONS.map((o) => o.id),
      jobTitle: "",
    });
    setShowModal(true);
    setAlert(null);
  }

  function openEditModal(u: UserType) {
    setIsEditing(true);
    setEditId(u.id);
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      selectedOutlets: parseOutlets(u.outletId),
      jobTitle: u.jobTitle || "",
    });
    setShowModal(true);
    setAlert(null);
  }

  function toggleOutlet(id: string) {
    setForm((prev) => {
      const exists = prev.selectedOutlets.includes(id);
      const updated = exists
        ? prev.selectedOutlets.filter((x) => x !== id)
        : [...prev.selectedOutlets, id];
      return { ...prev, selectedOutlets: updated };
    });
  }

  function selectAllOutlets() {
    setForm((prev) => ({ ...prev, selectedOutlets: ALL_OUTLET_OPTIONS.map((o) => o.id) }));
  }

  function clearAllOutlets() {
    setForm((prev) => ({ ...prev, selectedOutlets: [] }));
  }

  async function handleSaveUser(e: React.FormEvent) {
    e.preventDefault();
    if (form.selectedOutlets.length === 0) {
      setAlert({ type: "error", msg: "Please select at least one outlet for this user." });
      return;
    }

    setSaving(true);
    setAlert(null);

    const encodedOutletId = encodeOutlets(form.selectedOutlets);

    if (isEditing && editId) {
      // Update existing user
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editId,
          name: form.name,
          role: form.role,
          outletId: encodedOutletId,
          jobTitle: form.jobTitle,
          password: form.password || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.map((x) => (x.id === editId ? { ...x, ...data } : x)));
        setAlert({ type: "success", msg: `✅ User "${form.name}" updated successfully!` });
        setShowModal(false);
      } else {
        setAlert({ type: "error", msg: data.error || "Failed to update user." });
      }
    } else {
      // Create new user
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          outletId: encodedOutletId,
          jobTitle: form.jobTitle,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((u) => [...u, data]);
        setAlert({ type: "success", msg: `✅ User "${data.name}" created! Configure sheet access in Access Matrix.` });
        setShowModal(false);
      } else {
        setAlert({ type: "error", msg: data.error || "Failed to create user." });
      }
    }
    setSaving(false);
  }

  async function toggleActive(id: string, current: boolean) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !current }),
    });
    if (res.ok) {
      setUsers((u) => u.map((x) => (x.id === id ? { ...x, isActive: !current } : x)));
    }
  }

  const filteredUsers = users.filter((u) => {
    if (outletFilter === "all") return true;
    if (!u.outletId || u.outletId === "all") return true;
    const userOutlets = parseOutlets(u.outletId);
    return userOutlets.includes(outletFilter);
  });

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="page-header-text">
          <h1>👥 Employee & User Management</h1>
          <p>Dynamically manage employees, assign multiple outlets & configure roles</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href="/admin/access" className="btn btn-secondary">
            🔐 Access Matrix
          </Link>
          <button className="btn btn-primary" onClick={openCreateModal}>
            ➕ Add Employee
          </button>
        </div>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ marginBottom: "1rem" }}>
          {alert.msg}
        </div>
      )}

      {/* Outlet Filter Tabs */}
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <button
          type="button"
          className={`btn btn-sm ${outletFilter === "all" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setOutletFilter("all")}
        >
          All Employees ({users.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${outletFilter === "bakery" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setOutletFilter("bakery")}
        >
          🥐 Bakery Staff
        </button>
        <button
          type="button"
          className={`btn btn-sm ${outletFilter === "oreta-world" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setOutletFilter("oreta-world")}
        >
          🌐 Oreta World Staff
        </button>
        <button
          type="button"
          className={`btn btn-sm ${outletFilter === "rns-world" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setOutletFilter("rns-world")}
        >
          🏢 RNS World Staff
        </button>
        <button
          type="button"
          className={`btn btn-sm ${outletFilter === "symphony-world" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setOutletFilter("symphony-world")}
        >
          🎼 Symphony World Staff
        </button>
      </div>

      <div className="card">
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name / Details</th>
                <th>Email</th>
                <th>Role</th>
                <th>Assigned Outlets</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const assigned = parseOutlets(u.outletId);
                const isAll = !u.outletId || u.outletId === "all" || assigned.length === ALL_OUTLET_OPTIONS.length;

                return (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background:
                              u.role === "ADMIN"
                                ? "linear-gradient(135deg,#ef4444,#dc2626)"
                                : u.role === "SUPERVISOR"
                                ? "linear-gradient(135deg,#f59e0b,#d97706)"
                                : "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            color: "white",
                          }}
                        >
                          {(u.name || u.email || "U")
                            .split(" ")
                            .filter(Boolean)
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase() || "U"}
                        </div>
                        <div>
                          <div>{u.name}</div>
                          {u.jobTitle && (
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 400 }}>
                              {u.jobTitle}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{u.email}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background:
                            u.role === "ADMIN"
                              ? "rgba(239,68,68,0.15)"
                              : u.role === "SUPERVISOR"
                              ? "rgba(245,158,11,0.15)"
                              : "rgba(59,130,246,0.15)",
                          color:
                            u.role === "ADMIN"
                              ? "#ef4444"
                              : u.role === "SUPERVISOR"
                              ? "#f59e0b"
                              : "#3b82f6",
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", maxWidth: "240px" }}>
                        {isAll ? (
                          <span className="badge badge-submitted" style={{ fontWeight: 600 }}>
                            🌐 All Outlets (4)
                          </span>
                        ) : (
                          assigned.map((oid) => {
                            const opt = ALL_OUTLET_OPTIONS.find((o) => o.id === oid);
                            return (
                              <span
                                key={oid}
                                className="badge"
                                style={{
                                  background: "rgba(255,255,255,0.06)",
                                  border: "1px solid var(--border)",
                                  fontSize: "0.72rem",
                                  padding: "2px 6px",
                                }}
                              >
                                {opt ? `${opt.icon} ${opt.label}` : oid}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${u.isActive ? "active" : "inactive"}`}>
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                      {u.createdAt ? String(u.createdAt).slice(0, 10) : "—"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(u)}>
                          ✏️ Edit
                        </button>
                        <button
                          className={`btn btn-sm ${u.isActive ? "btn-danger" : "btn-success"}`}
                          onClick={() => toggleActive(u.id, u.isActive)}
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: "520px" }}>
            <div className="modal-header">
              <div className="modal-title">
                {isEditing ? `✏️ Edit Employee: ${form.name}` : "➕ Add New Employee"}
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveUser}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Rameshwar Shinde"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. rameshwar@pnr.com"
                    required
                    disabled={isEditing}
                  />
                </div>

                <div className="form-group">
                  <label>{isEditing ? "Password (Leave blank to keep unchanged)" : "Password"}</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={isEditing ? "••••••••" : "Min 6 characters"}
                    required={!isEditing}
                    minLength={6}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div className="form-group">
                    <label>Role</label>
                    <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                      <option value="EMPLOYEE">Staff / Employee</option>
                      <option value="SUPERVISOR">Supervisor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Job Title / Designation</label>
                    <input
                      type="text"
                      value={form.jobTitle}
                      onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                      placeholder="e.g. Area Supervisor, Cake Chef"
                    />
                  </div>
                </div>

                {/* Multi-Outlet Checkbox Selector */}
                <div className="form-group" style={{ marginTop: "0.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <label style={{ margin: 0, fontWeight: 600 }}>
                      Assigned Outlets <span style={{ color: "var(--accent)", fontSize: "0.75rem", fontWeight: 400 }}>(Check 1 or more outlets)</span>
                    </label>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        style={{ fontSize: "0.7rem", padding: "1px 6px" }}
                        onClick={selectAllOutlets}
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        style={{ fontSize: "0.7rem", padding: "1px 6px" }}
                        onClick={clearAllOutlets}
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.5rem",
                      background: "var(--surface)",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {ALL_OUTLET_OPTIONS.map((opt) => {
                      const isChecked = form.selectedOutlets.includes(opt.id);
                      return (
                        <label
                          key={opt.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            cursor: "pointer",
                            padding: "0.5rem 0.65rem",
                            borderRadius: "6px",
                            border: isChecked ? "1px solid var(--accent)" : "1px solid transparent",
                            background: isChecked ? "rgba(224, 86, 36, 0.08)" : "transparent",
                            transition: "all 0.15s ease",
                            userSelect: "none",
                            fontSize: "0.85rem",
                            fontWeight: isChecked ? 600 : 400,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleOutlet(opt.id)}
                            style={{ width: "16px", height: "16px", accentColor: "var(--accent)", cursor: "pointer" }}
                          />
                          <span>{opt.icon} {opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
                    {form.selectedOutlets.length === 0 ? (
                      <span style={{ color: "#ef4444" }}>⚠️ Please select at least 1 outlet.</span>
                    ) : form.selectedOutlets.length === ALL_OUTLET_OPTIONS.length ? (
                      <span>🌐 Assigned to <strong>all 4 outlets</strong></span>
                    ) : (
                      <span>
                        Assigned to <strong>{form.selectedOutlets.length} outlet{form.selectedOutlets.length > 1 ? "s" : ""}</strong> (
                        {form.selectedOutlets.map((id) => ALL_OUTLET_OPTIONS.find((o) => o.id === id)?.label).join(", ")})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: "1.25rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "⏳ Saving..." : isEditing ? "💾 Update Employee" : "➕ Create Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
