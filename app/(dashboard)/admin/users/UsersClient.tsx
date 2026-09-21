"use client";
import { useState } from "react";
import Link from "next/link";

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
    outletId: "all",
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
      outletId: "all",
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
      outletId: u.outletId || "all",
      jobTitle: u.jobTitle || "",
    });
    setShowModal(true);
    setAlert(null);
  }

  async function handleSaveUser(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    if (isEditing && editId) {
      // Update existing user
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editId,
          name: form.name,
          role: form.role,
          outletId: form.outletId,
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
        body: JSON.stringify(form),
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
    if (outletFilter === "bakery") return u.outletId === "bakery" || u.outletId === "all" || !u.outletId;
    if (outletFilter === "oreta-world") return u.outletId === "oreta-world" || u.outletId === "all" || !u.outletId;
    return true;
  });

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="page-header-text">
          <h1>👥 Employee & User Management</h1>
          <p>Dynamically manage employees, assign outlets & configure roles</p>
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
      </div>

      <div className="card">
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name / Details</th>
                <th>Email</th>
                <th>Role</th>
                <th>Assigned Outlet</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
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
                    <span className="badge badge-submitted">
                      {u.outletId === "bakery" ? "🥐 Bakery" : u.outletId === "oreta-world" ? "🌐 Oreta World" : "🌐 All Outlets"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${u.isActive ? "active" : "inactive"}`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    {new Date(u.createdAt).toLocaleDateString("en-IN")}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: "480px" }}>
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
                    <label>Assigned Outlet</label>
                    <select value={form.outletId} onChange={(e) => setForm({ ...form, outletId: e.target.value })}>
                      <option value="all">All Outlets</option>
                      <option value="bakery">🥐 Bakery</option>
                      <option value="oreta-world">🌐 Oreta World</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Job Title / Designation (Optional)</label>
                  <input
                    type="text"
                    value={form.jobTitle}
                    onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                    placeholder="e.g. Kitchen Staff, Cleaner, Barista, Cake Chef"
                  />
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
