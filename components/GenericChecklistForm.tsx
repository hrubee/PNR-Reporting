"use client";
import React, { useState } from "react";
import { SUPERVISORS, OUTLET_SUPERVISORS, ALL_STAFF, SHEET_STAFF, SheetId } from "@/lib/permissions";

export interface EquipmentItemDef {
  id?: number;
  name: string;
  category?: string;
  defaultWorker?: string;
}

interface EquipmentCheck {
  id?: number;
  equipment: string;
  category?: string;
  yesNo: string;
  time: string;
  name: string;
}

interface EntryType {
  id: string;
  date: string;
  equipmentChecks: string;
  supervisorName: string;
  workerName: string;
  comments: string;
  correctiveAction: string;
  submittedBy: { name: string };
  createdAt: string;
}

interface Props {
  title: string;
  icon: string;
  sheet: string;
  sheetKey: SheetId;
  equipment: (string | EquipmentItemDef)[];
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

export default function GenericChecklistForm({
  title,
  icon,
  sheet,
  sheetKey,
  equipment,
  today,
  todayLabel,
  todayEntries: initialTodayEntries,
  history: initialHistory,
  userName,
  staffList = [],
  supervisorsList = [],
}: Props) {
  const teamMembers = staffList;
  const availableSupervisors = supervisorsList.length > 0 ? supervisorsList : (OUTLET_SUPERVISORS["bakery"] || []);
  const defaultWorker = teamMembers[0] || "";
  const defaultSupervisor = availableSupervisors[0] || "";

  const normalizedEquipment: { id: number; name: string; category: string }[] = equipment.map((item, idx) => {
    if (typeof item === "string") {
      return { id: idx + 1, name: item, category: "General Equipment" };
    }
    return { id: item.id || idx + 1, name: item.name, category: item.category || "General Equipment" };
  });

  const categories = Array.from(new Set(normalizedEquipment.map((e) => e.category)));

  const init: EquipmentCheck[] = normalizedEquipment.map((e) => ({
    id: e.id,
    equipment: e.name,
    category: e.category,
    yesNo: "",
    time: "",
    name: defaultWorker,
  }));

  const [todayEntries, setTodayEntries] = useState<EntryType[]>(initialTodayEntries);
  const [history, setHistory] = useState<EntryType[]>(initialHistory);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(initialTodayEntries.length === 0);

  const [checks, setChecks] = useState<EquipmentCheck[]>(init);
  const [supervisorName, setSupervisorName] = useState(defaultSupervisor);
  const [workerName, setWorkerName] = useState(defaultWorker);
  const [comments, setComments] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState(today);

  function startNewSubmission() {
    setEditingId(null);
    setChecks(init);
    setSupervisorName(defaultSupervisor);
    setWorkerName(defaultWorker);
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
        const normalized = normalizedEquipment.map((itemDef) => {
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
            name: matched ? (matched.name || matched.cleanedBy || defaultWorker) : defaultWorker,
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
    setWorkerName(entry.workerName || defaultWorker);
    setComments(entry.comments || "");
    setCorrectiveAction(entry.correctiveAction || "");
    setIsEditing(true);
    setAlert(null);
  }

  function update(idx: number, field: keyof EquipmentCheck, value: string) {
    const copy = [...checks];
    copy[idx] = { ...copy[idx], [field]: value };
    setChecks(copy);
  }

  // 1-Tap Quick Actions
  function markAllYes() {
    const timeNow = getCurrentTimeString();
    setChecks((prev) =>
      prev.map((c) => {
        if (activeCategory === "all" || c.category === activeCategory) {
          return {
            ...c,
            yesNo: "YES",
            time: c.time || timeNow,
            name: c.name || workerName || defaultWorker,
          };
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

  function assignAllTo(name: string) {
    if (!name) return;
    setWorkerName(name);
    setChecks((prev) =>
      prev.map((c) => {
        if (activeCategory === "all" || c.category === activeCategory) {
          return { ...c, name };
        }
        return c;
      })
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setAlert(null);
    try {
      const res = await fetch(`/api/entries/${sheet}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          date: today,
          equipmentChecks: checks,
          supervisorName,
          workerName,
          comments,
          correctiveAction,
        }),
      });
      if (res.ok) {
        const saved: EntryType = await res.json();
        const withSubmitter = { ...saved, submittedBy: { name: userName } };

        if (editingId) {
          setTodayEntries((prev) => prev.map((e) => (e.id === editingId ? withSubmitter : e)));
          setHistory((prev) => prev.map((e) => (e.id === editingId ? withSubmitter : e)));
          setAlert({ type: "success", msg: `✅ ${title} updated!` });
        } else {
          setTodayEntries((prev) => [withSubmitter, ...prev]);
          setHistory((prev) => [withSubmitter, ...prev]);
          setAlert({
            type: "success",
            msg: `✅ New ${title} recorded at ${new Date(saved.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}!`,
          });
        }
        setIsEditing(false);
      } else {
        const d = await res.json();
        setAlert({ type: "error", msg: d.error || "Failed to save." });
      }
    } catch {
      setAlert({ type: "error", msg: "Network error. Please try again." });
    }
    setSaving(false);
  }

  const selectedDateEntries = history.filter((h) => h.date === selectedDate);

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="page-header-text">
          <h1>{icon} {title}</h1>
          <p>Equipment Hygiene & Sanitation Check ({checks.length} Items) — {todayLabel}</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {!isEditing && (
            <button className="btn btn-primary btn-sm" onClick={startNewSubmission}>
              ➕ New Submission for Today
            </button>
          )}
        </div>
      </div>

      {alert && <div className={`alert alert-${alert.type}`} style={{ marginBottom: "1rem" }}>{alert.msg}</div>}

      {/* TODAY'S SUBMISSIONS */}
      {!isEditing && todayEntries.length > 0 && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div className="card-header">
            <div className="card-title">
              📋 Today&apos;s Recorded Submissions ({todayEntries.length})
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {todayEntries.map((entry, idx) => (
              <div
                key={entry.id}
                style={{
                  padding: "0.85rem 1rem",
                  background: "var(--bg-input)",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span className="badge badge-submitted">#{todayEntries.length - idx}</span>
                    <span>Worker: <strong>{entry.workerName || "—"}</strong></span>
                    {entry.supervisorName && (
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        (Supervisor: {entry.supervisorName})
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    ⏰ {new Date(entry.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    {entry.comments && ` • "${entry.comments}"`}
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => startEditSubmission(entry)}>
                  ✏️ View / Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isEditing && (
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <div className="card-header">
              <div className="card-title">
                {editingId ? `✏️ Edit ${title}` : `➕ New ${title}`}
              </div>
            </div>

            {/* Category Filter Pills (Identical to Oreta World) */}
            {categories.length > 1 && (
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                <button
                  type="button"
                  className={`btn btn-sm ${activeCategory === "all" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setActiveCategory("all")}
                >
                  📋 All Items ({checks.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`btn btn-sm ${activeCategory === cat ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* 1-Tap Quick Action Bar */}
            <div className="quick-action-bar">
              <span>⚡ 1-Tap Quick Actions:</span>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={markAllYes}
              >
                ✅ Mark {activeCategory === "all" ? "All" : activeCategory} YES
              </button>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={setAllCurrentTime}
              >
                🕒 Set Current Time
              </button>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                <span style={{ fontSize: "0.72rem" }}>👤 Assign:</span>
                <select
                  value=""
                  onChange={(e) => assignAllTo(e.target.value)}
                  style={{
                    padding: "0.25rem 0.5rem",
                    fontSize: "0.75rem",
                    borderRadius: "4px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="" disabled>Select Staff</option>
                  {teamMembers.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="checklist-table">
                <thead>
                  <tr>
                    <th style={{ width: "35%" }}>Equipment / Item</th>
                    <th style={{ width: "170px" }}>Status</th>
                    <th style={{ width: "130px" }}>Time</th>
                    <th>Cleaned By</th>
                  </tr>
                </thead>
                <tbody>
                  {checks.map((row, idx) => {
                    if (activeCategory !== "all" && row.category !== activeCategory) {
                      return null;
                    }

                    return (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>
                          <div>
                            <span>{row.equipment}</span>
                            {row.category && (
                              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                                ({row.category})
                              </span>
                            )}
                          </div>
                          {row.yesNo && (
                            <span
                              style={{
                                fontSize: "0.75rem",
                                padding: "2px 8px",
                                borderRadius: "99px",
                                fontWeight: 700,
                                background:
                                  row.yesNo === "YES"
                                    ? "rgba(16,185,129,0.15)"
                                    : row.yesNo === "NO"
                                    ? "rgba(239,68,68,0.15)"
                                    : "rgba(148,163,184,0.15)",
                                color:
                                  row.yesNo === "YES"
                                    ? "var(--success)"
                                    : row.yesNo === "NO"
                                    ? "var(--danger)"
                                    : "var(--text-muted)",
                              }}
                            >
                              {row.yesNo}
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="touch-btn-toggle">
                            <button
                              type="button"
                              className={`touch-btn-option ${row.yesNo === "YES" ? "active-yes" : ""}`}
                              onClick={() => update(idx, "yesNo", "YES")}
                            >
                              ✅ YES
                            </button>
                            <button
                              type="button"
                              className={`touch-btn-option ${row.yesNo === "NO" ? "active-no" : ""}`}
                              onClick={() => update(idx, "yesNo", "NO")}
                            >
                              ❌ NO
                            </button>
                            <button
                              type="button"
                              className={`touch-btn-option ${row.yesNo === "N/A" ? "active-na" : ""}`}
                              onClick={() => update(idx, "yesNo", "N/A")}
                            >
                              ⚪ N/A
                            </button>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", width: "100%" }}>
                            <input
                              type="time"
                              value={row.time}
                              onChange={(e) => update(idx, "time", e.target.value)}
                              style={{ flex: 1 }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              style={{ padding: "0.45rem 0.5rem", fontSize: "0.75rem", minHeight: "44px" }}
                              onClick={() => update(idx, "time", getCurrentTimeString())}
                              title="Set current time"
                            >
                              Now
                            </button>
                          </div>
                        </td>
                        <td>
                          <select
                            value={row.name}
                            onChange={(e) => update(idx, "name", e.target.value)}
                          >
                            {teamMembers.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="form-grid" style={{ marginTop: "1.25rem" }}>
              <div className="form-group">
                <label>Verified / Supervised By</label>
                <select
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  style={{ fontWeight: 600, color: "var(--accent)" }}
                >
                  {availableSupervisors.map((sup) => (
                    <option key={sup} value={sup}>{sup}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Lead Worker / Operator</label>
                <select
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                >
                  {teamMembers.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Comments</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Comments..."
                />
              </div>
              <div className="form-group">
                <label>Corrective Action</label>
                <textarea
                  value={correctiveAction}
                  onChange={(e) => setCorrectiveAction(e.target.value)}
                  placeholder="Actions taken..."
                />
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "⏳ Saving..." : editingId ? "💾 Update Report" : "💾 Save & Record Report"}
            </button>
            {todayEntries.length > 0 && (
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
            )}
          </div>
        </form>
      )}

      {/* HISTORY */}
      <div className="history-section" style={{ marginTop: "2rem" }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">📆 Submission History (Date-wise)</div>
            <input
              type="date"
              value={selectedDate}
              max={today}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                background: "var(--bg-input)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                padding: "0.4rem 0.6rem",
                color: "var(--text-primary)",
                fontSize: "0.82rem",
                outline: "none",
              }}
            />
          </div>
          {selectedDate !== today && selectedDateEntries.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <p className="text-sm text-muted">
                Found {selectedDateEntries.length} submission(s) for {selectedDate}:
              </p>
              {selectedDateEntries.map((entry, idx) => {
                const eqChecks: EquipmentCheck[] = JSON.parse(entry.equipmentChecks);
                return (
                  <div
                    key={entry.id}
                    style={{
                      background: "var(--bg-input)",
                      borderRadius: "8px",
                      padding: "1rem",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                      <div>
                        <strong>Submission #{selectedDateEntries.length - idx}</strong> — Submitted by{" "}
                        <strong>{entry.submittedBy?.name || "Staff"}</strong> at{" "}
                        {new Date(entry.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        {entry.supervisorName && ` • Verified by: ${entry.supervisorName}`}
                        {entry.workerName && ` • Worker: ${entry.workerName}`}
                      </div>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table className="checklist-table" style={{ fontSize: "0.82rem" }}>
                        <thead>
                          <tr>
                            <th>Equipment / Item</th>
                            <th>Status</th>
                            <th>Time</th>
                            <th>Checked By</th>
                          </tr>
                        </thead>
                        <tbody>
                          {eqChecks.map((c, i) => (
                            <tr key={i}>
                              <td style={{ fontWeight: 500 }}>
                                <span>{c.equipment}</span>
                                {c.category && (
                                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginLeft: "0.4rem" }}>
                                    ({c.category})
                                  </span>
                                )}
                              </td>
                              <td>
                                <span className={`badge ${c.yesNo === "YES" ? "badge-active" : c.yesNo === "NO" ? "badge-inactive" : ""}`}>
                                  {c.yesNo || "—"}
                                </span>
                              </td>
                              <td>{c.time || "—"}</td>
                              <td>{c.name || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : history.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Submitted By</th>
                    <th>Supervisor</th>
                    <th>Items Checked</th>
                    <th>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 15).map((h) => {
                    let count = 0;
                    try {
                      count = JSON.parse(h.equipmentChecks).length;
                    } catch {}
                    return (
                      <tr key={h.id}>
                        <td style={{ fontWeight: 600 }}>{h.date}</td>
                        <td>{new Date(h.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</td>
                        <td>{h.submittedBy?.name || "—"}</td>
                        <td>{h.supervisorName || "—"}</td>
                        <td><span className="badge badge-submitted">{count} items</span></td>
                        <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{h.comments || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted text-sm">No historical records available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
