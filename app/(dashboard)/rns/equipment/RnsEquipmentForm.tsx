"use client";
import React, { useState } from "react";
import { RNS_EQUIPMENT_ITEMS, RNS_STAFF } from "@/lib/outlets";
import { SUPERVISORS, OUTLET_SUPERVISORS } from "@/lib/permissions";

interface EquipmentCheck {
  id: number;
  equipment: string;
  category: string;
  yesNo: string;
  time: string;
  name: string;
}

interface EntryType {
  id: string;
  date: string;
  equipmentChecks: string;
  supervisorName: string;
  comments: string;
  correctiveAction: string;
  submittedBy: { name: string };
  createdAt: string;
}

interface Props {
  today: string;
  todayLabel: string;
  todayEntries: EntryType[];
  history: EntryType[];
  userName: string;
  staffList?: string[];
  supervisorsList?: string[];
}

function getCurrentTimeString(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export default function RnsEquipmentForm({
  today,
  todayLabel,
  todayEntries: initialTodayEntries,
  history: initialHistory,
  userName,
  staffList = [],
  supervisorsList = [],
}: Props) {
  const availableStaff = staffList;
  const availableSupervisors = supervisorsList.length > 0 ? supervisorsList : (OUTLET_SUPERVISORS["rns-world"] || []);
  const defaultSupervisor = availableSupervisors[0] || "";
  const defaultStaff = "";

  const init: EquipmentCheck[] = RNS_EQUIPMENT_ITEMS.map((item) => ({
    id: item.id,
    equipment: item.name,
    category: item.category,
    yesNo: "",
    time: "",
    name: "",
  }));

  const [todayEntries, setTodayEntries] = useState<EntryType[]>(initialTodayEntries);
  const [history, setHistory] = useState<EntryType[]>(initialHistory);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(initialTodayEntries.length === 0);

  const [checks, setChecks] = useState<EquipmentCheck[]>(init);
  const [supervisorName, setSupervisorName] = useState(defaultSupervisor);
  const [comments, setComments] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState(today);

  const categories = Array.from(new Set(RNS_EQUIPMENT_ITEMS.map((i) => i.category)));

  function startNewSubmission() {
    setEditingId(null);
    setChecks(init);
    setSupervisorName(defaultSupervisor);
    setComments("");
    setCorrectiveAction("");
    setIsEditing(true);
    setAlert(null);
  }

  function startEditSubmission(entry: EntryType) {
    setEditingId(entry.id);
    try {
      const parsed = JSON.parse(entry.equipmentChecks);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const normalized = RNS_EQUIPMENT_ITEMS.map((itemDef) => {
          const matched = parsed.find(
            (p: any) =>
              (p.equipment && p.equipment.trim().toLowerCase() === itemDef.name.trim().toLowerCase()) ||
              (p.name && p.name.trim().toLowerCase() === itemDef.name.trim().toLowerCase())
          );
          return {
            id: itemDef.id,
            equipment: itemDef.name,
            category: itemDef.category,
            yesNo: matched ? (matched.yesNo || matched.status || "") : "",
            time: matched ? (matched.time || "") : "",
            name: matched ? (matched.name || matched.cleanedBy || "") : "",
          };
        });
        setChecks(normalized);
      } else {
        setChecks(init);
      }
    } catch {
      setChecks(init);
    }
    setSupervisorName(entry.supervisorName || defaultSupervisor);
    setComments(entry.comments || "");
    setCorrectiveAction(entry.correctiveAction || "");
    setIsEditing(true);
    setAlert(null);
  }

  function update(idx: number, field: keyof EquipmentCheck, value: string | number) {
    const copy = [...checks];
    copy[idx] = { ...copy[idx], [field]: value };
    setChecks(copy);
  }

  function markAllYes() {
    const timeNow = getCurrentTimeString();
    setChecks((prev) =>
      prev.map((c) => {
        if (activeCategory === "all" || c.category === activeCategory) {
          return { ...c, yesNo: "YES", time: c.time || timeNow };
        }
        return c;
      })
    );
  }

  function setAllCurrentTime() {
    const timeNow = getCurrentTimeString();
    setChecks((prev) =>
      prev.map((c) => {
        if (activeCategory === "all" || c.category === activeCategory) {
          return { ...c, time: timeNow };
        }
        return c;
      })
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    const payload = {
      id: editingId || undefined,
      date: today,
      equipmentChecks: JSON.stringify(checks),
      supervisorName,
      comments,
      correctiveAction,
    };

    try {
      const res = await fetch("/api/entries/rns-equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save entry");
      }

      const saved = await res.json();
      const savedFormatted: EntryType = {
        ...saved,
        submittedBy: { name: userName },
      };

      if (editingId) {
        setTodayEntries((prev) => prev.map((item) => (item.id === editingId ? savedFormatted : item)));
        setHistory((prev) => prev.map((item) => (item.id === editingId ? savedFormatted : item)));
        setAlert({ type: "success", msg: "✅ RNS World equipment log updated successfully!" });
      } else {
        setTodayEntries((prev) => [savedFormatted, ...prev]);
        setHistory((prev) => [savedFormatted, ...prev]);
        setAlert({ type: "success", msg: "✅ RNS World equipment checklist submitted successfully!" });
      }

      setIsEditing(false);
      setEditingId(null);
    } catch (err: any) {
      setAlert({ type: "error", msg: err.message || "Failed to submit checklist." });
    } finally {
      setSaving(false);
    }
  }

  const filteredChecks =
    activeCategory === "all"
      ? checks
      : checks.filter((c) => c.category === activeCategory);

  const doneCount = checks.filter((c) => c.yesNo === "YES").length;
  const progressPct = Math.round((doneCount / checks.length) * 100);

  const selectedDateEntries = history.filter((h) => h.date === selectedDate);

  return (
    <div className="page-container fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>🏢 RNS World Equipment & Hygiene Checklist</h1>
          <p>{todayLabel} · Daily Equipment Cleaning & Sanitation Checklist (30 Items)</p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          {todayEntries.length > 0 && !isEditing && (
            <button className="btn btn-primary" onClick={startNewSubmission}>
              ➕ New Entry
            </button>
          )}
        </div>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ marginBottom: "1.25rem" }}>
          {alert.msg}
        </div>
      )}

      {/* Progress & Category Filter */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ fontWeight: 600 }}>
            Overall Completion: <span style={{ color: progressPct === 100 ? "var(--success)" : "var(--primary)" }}>{doneCount} / {checks.length} Items Done ({progressPct}%)</span>
          </div>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <button type="button" className="btn btn-sm btn-secondary" onClick={markAllYes}>
              ✓ Mark All Yes
            </button>
            <button type="button" className="btn btn-sm btn-secondary" onClick={setAllCurrentTime}>
              ⏰ Set Current Time
            </button>
          </div>
        </div>

        <div className="progress-bar-track" style={{ marginBottom: "1rem" }}>
          <div
            className="progress-bar-fill"
            style={{
              width: `${progressPct}%`,
              background: progressPct === 100 ? "var(--success)" : "var(--accent)",
            }}
          />
        </div>

        {/* Category Tabs */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className={`btn btn-sm ${activeCategory === "all" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveCategory("all")}
          >
            All Items (30)
          </button>
          {categories.map((cat) => {
            const catCount = checks.filter((c) => c.category === cat && c.yesNo === "YES").length;
            const catTotal = checks.filter((c) => c.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                className={`btn btn-sm ${activeCategory === cat ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat} ({catCount}/{catTotal})
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Form */}
      {isEditing && (
        <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                {editingId ? "✏️ Edit RNS World Equipment Log" : "📝 New RNS World Equipment Record"}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="desktop-table-container" style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "40px" }}>#</th>
                    <th>Equipment Name</th>
                    <th>Category</th>
                    <th style={{ minWidth: "200px" }}>Status</th>
                    <th style={{ width: "130px" }}>Time</th>
                    <th style={{ minWidth: "160px" }}>Cleaned By</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChecks.map((item) => {
                    const originalIndex = checks.findIndex((c) => c.id === item.id);
                    return (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td style={{ fontWeight: 600 }}>{item.equipment}</td>
                        <td>
                          <span className="badge badge-submitted">{item.category}</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "0.3rem" }}>
                            {["YES", "NO", "N/A"].map((val) => (
                              <button
                                key={val}
                                type="button"
                                className={`btn btn-sm ${item.yesNo === val ? (val === "YES" ? "btn-success" : val === "NO" ? "btn-danger" : "btn-primary") : "btn-secondary"}`}
                                style={{ padding: "0.2rem 0.6rem", fontSize: "0.75rem" }}
                                onClick={() => {
                                  update(originalIndex, "yesNo", val);
                                  if (val === "YES" && !item.time) {
                                    update(originalIndex, "time", getCurrentTimeString());
                                  }
                                }}
                              >
                                {val === "YES" ? "✅ YES" : val === "NO" ? "❌ NO" : "⚪ N/A"}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td>
                          <input
                            type="time"
                            value={item.time}
                            onChange={(e) => update(originalIndex, "time", e.target.value)}
                            style={{ padding: "0.3rem 0.5rem", width: "100%", borderRadius: "6px", border: "1px solid var(--border)" }}
                          />
                        </td>
                        <td>
                          <select
                            value={item.name}
                            onChange={(e) => update(originalIndex, "name", e.target.value)}
                            style={{ padding: "0.35rem 0.5rem", width: "100%", borderRadius: "6px", border: "1px solid var(--border)" }}
                          >
                            {availableStaff.map((staff) => (
                              <option key={staff} value={staff}>{staff}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="mobile-cards-container" style={{ display: "none" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {filteredChecks.map((item) => {
                  const originalIndex = checks.findIndex((c) => c.id === item.id);
                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: "0.85rem",
                        background: "var(--bg-input)",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{item.id}. {item.equipment}</span>
                        <span className="badge badge-submitted" style={{ fontSize: "0.7rem" }}>{item.category}</span>
                      </div>

                      <div style={{ display: "flex", gap: "0.3rem", marginBottom: "0.6rem" }}>
                        {["YES", "NO", "N/A"].map((val) => (
                          <button
                            key={val}
                            type="button"
                            className={`btn btn-sm ${item.yesNo === val ? (val === "YES" ? "btn-success" : val === "NO" ? "btn-danger" : "btn-primary") : "btn-secondary"}`}
                            style={{ flex: 1, padding: "0.35rem 0.2rem", fontSize: "0.75rem" }}
                            onClick={() => {
                              update(originalIndex, "yesNo", val);
                              if (val === "YES" && !item.time) {
                                update(originalIndex, "time", getCurrentTimeString());
                              }
                            }}
                          >
                            {val === "YES" ? "✅ YES" : val === "NO" ? "❌ NO" : "⚪ N/A"}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                        <div>
                          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "2px" }}>Time</label>
                          <input
                            type="time"
                            value={item.time}
                            onChange={(e) => update(originalIndex, "time", e.target.value)}
                            style={{ padding: "0.35rem 0.5rem", width: "100%", borderRadius: "6px", border: "1px solid var(--border)" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "2px" }}>Cleaned By</label>
                          <select
                            value={item.name}
                            onChange={(e) => update(originalIndex, "name", e.target.value)}
                            style={{ padding: "0.35rem 0.5rem", width: "100%", borderRadius: "6px", border: "1px solid var(--border)" }}
                          >
                            <option value="">-- Select Staff --</option>
                            {availableStaff.map((staff) => (
                              <option key={staff} value={staff}>{staff}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Supervisor & Corrective Actions */}
            <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
                <div className="form-group">
                  <label>Verified / Supervised By</label>
                  <select
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    style={{ width: "100%", padding: "0.55rem", borderRadius: "6px", border: "1px solid var(--border)" }}
                  >
                    {availableSupervisors.map((sup) => (
                      <option key={sup} value={sup}>{sup}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Comments / Observations</label>
                  <input
                    type="text"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="General equipment hygiene observations..."
                    style={{ width: "100%", padding: "0.55rem", borderRadius: "6px", border: "1px solid var(--border)" }}
                  />
                </div>

                <div className="form-group">
                  <label>Corrective Action (If any issues)</label>
                  <input
                    type="text"
                    value={correctiveAction}
                    onChange={(e) => setCorrectiveAction(e.target.value)}
                    placeholder="Actions taken for maintenance or cleaning..."
                    style={{ width: "100%", padding: "0.55rem", borderRadius: "6px", border: "1px solid var(--border)" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "⏳ Submitting..." : editingId ? "💾 Update Record" : "📤 Submit Checklist"}
                </button>
                {todayEntries.length > 0 && (
                  <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      )}

      {/* HISTORY LOG */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">🕒 RNS World Equipment History Log</div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <label style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: "0.3rem 0.5rem", fontSize: "0.82rem", borderRadius: "6px", border: "1px solid var(--border)" }}
            />
          </div>
        </div>

        {selectedDateEntries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚙️</div>
            <p>No equipment cleaning records found for {selectedDate}.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {selectedDateEntries.map((entry) => {
              let parsed: EquipmentCheck[] = [];
              try {
                parsed = JSON.parse(entry.equipmentChecks);
              } catch {}
              const yesItems = parsed.filter((p) => p.yesNo === "YES").length;

              return (
                <div
                  key={entry.id}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "1rem",
                    background: "var(--bg-input)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <div>
                      <strong>📅 {entry.date}</strong> · Supervisor: <strong>{entry.supervisorName || "—"}</strong> · Submitted by <strong>{entry.submittedBy?.name || "Admin"}</strong>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span className="badge badge-submitted">{yesItems} / {parsed.length || 30} Items Cleaned</span>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => startEditSubmission(entry)}
                        style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </div>

                  {entry.comments && (
                    <p style={{ fontSize: "0.83rem", color: "var(--text-muted)", margin: "0.25rem 0" }}>
                      💬 <em>{entry.comments}</em>
                    </p>
                  )}
                  {entry.correctiveAction && (
                    <p style={{ fontSize: "0.83rem", color: "#ef4444", margin: "0.25rem 0" }}>
                      ⚠️ Corrective Action: <em>{entry.correctiveAction}</em>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
