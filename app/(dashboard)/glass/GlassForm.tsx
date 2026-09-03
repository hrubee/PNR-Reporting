"use client";
import { useState } from "react";
import { SUPERVISORS, SHEET_STAFF, ALL_STAFF } from "@/lib/permissions";

interface LocationCheck {
  location: string;
  name: string;
}

interface GlassEntryType {
  id: string;
  date: string;
  locationChecks: string;
  supervisorName: string;
  comments: string;
  correctiveAction: string;
  submittedBy: { name: string };
  createdAt: string;
}

interface Props {
  locations: string[];
  today: string;
  todayLabel: string;
  todayEntries: GlassEntryType[];
  history: GlassEntryType[];
  userName: string;
}

export default function GlassForm({
  locations,
  today,
  todayLabel,
  todayEntries: initialTodayEntries,
  history: initialHistory,
  userName,
}: Props) {
  const teamMembers = SHEET_STAFF.GLASS_REPORT || ALL_STAFF;
  const defaultWorker = teamMembers[0] || "Sanjay Jadhav";

  const init: LocationCheck[] = locations.map((l) => ({
    location: l,
    name: defaultWorker,
  }));

  const [todayEntries, setTodayEntries] = useState<GlassEntryType[]>(initialTodayEntries);
  const [history, setHistory] = useState<GlassEntryType[]>(initialHistory);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(initialTodayEntries.length === 0);

  const [checks, setChecks] = useState<LocationCheck[]>(init);
  const [supervisorName, setSupervisorName] = useState(SUPERVISORS[0] || "Aboli Wagh");
  const [comments, setComments] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState(today);

  function startNewSubmission() {
    setEditingId(null);
    setChecks(init);
    setSupervisorName(SUPERVISORS[0] || "Aboli Wagh");
    setComments("");
    setCorrectiveAction("");
    setIsEditing(true);
    setAlert(null);
  }

  function startEditSubmission(entry: GlassEntryType) {
    setEditingId(entry.id);
    setChecks(JSON.parse(entry.locationChecks));
    setSupervisorName(entry.supervisorName || SUPERVISORS[0] || "Aboli Wagh");
    setComments(entry.comments || "");
    setCorrectiveAction(entry.correctiveAction || "");
    setIsEditing(true);
    setAlert(null);
  }

  function updateCheck(idx: number, value: string) {
    const copy = [...checks];
    copy[idx] = { ...copy[idx], name: value };
    setChecks(copy);
  }

  function assignAllTo(name: string) {
    if (!name) return;
    setChecks((prev) => prev.map((c) => ({ ...c, name })));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setAlert(null);
    try {
      const res = await fetch("/api/entries/glass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          date: today,
          locationChecks: checks,
          supervisorName,
          comments,
          correctiveAction,
        }),
      });
      if (res.ok) {
        const saved: GlassEntryType = await res.json();
        const withSubmitter = { ...saved, submittedBy: { name: userName } };

        if (editingId) {
          setTodayEntries((prev) => prev.map((e) => (e.id === editingId ? withSubmitter : e)));
          setHistory((prev) => prev.map((e) => (e.id === editingId ? withSubmitter : e)));
          setAlert({ type: "success", msg: "✅ Glass Report updated!" });
        } else {
          setTodayEntries((prev) => [withSubmitter, ...prev]);
          setHistory((prev) => [withSubmitter, ...prev]);
          setAlert({
            type: "success",
            msg: `✅ New Glass Report recorded at ${new Date(saved.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}!`,
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
          <h1>🪟 Glass Hygiene Report</h1>
          <p>Glass & Window Cleaning Check — {todayLabel}</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {!isEditing && (
            <button className="btn btn-primary btn-sm" onClick={startNewSubmission}>
              ➕ New Submission for Today
            </button>
          )}
        </div>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ marginBottom: "1rem" }}>
          {alert.msg}
        </div>
      )}

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
                    <span>Supervisor: <strong>{entry.supervisorName || "Aboli Wagh"}</strong></span>
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
                {editingId ? "✏️ Edit Glass Report" : "➕ New Glass Surface Check"}
              </div>
            </div>

            {/* 1-Tap Quick Action Bar */}
            <div className="quick-action-bar">
              <span>⚡ 1-Tap Quick Actions:</span>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                <span style={{ fontSize: "0.72rem" }}>👤 Assign All:</span>
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
                  {ALL_STAFF.filter((a) => !teamMembers.includes(a)).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">Locations</div>
              <div style={{ overflowX: "auto" }}>
                <table className="checklist-table">
                  <thead>
                    <tr>
                      <th style={{ width: "50%" }}>Location</th>
                      <th>Cleaned By (Staff Select)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checks.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 500 }}>{row.location}</td>
                        <td>
                          <select
                            value={row.name}
                            onChange={(e) => updateCheck(idx, e.target.value)}
                          >
                            <optgroup label="Glass Cleaning Staff">
                              {teamMembers.map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </optgroup>
                            <optgroup label="All Staff">
                              {ALL_STAFF.filter((a) => !teamMembers.includes(a)).map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </optgroup>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="form-grid" style={{ marginTop: "1.25rem" }}>
              <div className="form-group">
                <label>Bakery Supervisor</label>
                <select
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  style={{ fontWeight: 600, color: "var(--accent)" }}
                >
                  {SUPERVISORS.map((sup) => (
                    <option key={sup} value={sup}>{sup}</option>
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
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
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
                const locs: LocationCheck[] = JSON.parse(entry.locationChecks);
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
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        Submission #{selectedDateEntries.length - idx} (Supervisor:{" "}
                        <strong style={{ color: "var(--text-primary)" }}>{entry.supervisorName || "—"}</strong>)
                      </div>
                      <span className="badge badge-submitted">
                        ⏰ {new Date(entry.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <table className="checklist-table">
                      <thead><tr><th>Location</th><th>Cleaned By</th></tr></thead>
                      <tbody>
                        {locs.map((r, i) => (
                          <tr key={i}><td>{r.location}</td><td>{r.name || "—"}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead><tr><th>Date</th><th>Time</th><th>Supervisor</th><th>Submitted By</th><th>Status</th></tr></thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>No entries yet.</td></tr>
                  ) : (
                    history.map((h) => (
                      <tr key={h.id} style={{ cursor: "pointer" }} onClick={() => setSelectedDate(h.date)}>
                        <td>{h.date}</td>
                        <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                          {new Date(h.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td>{h.supervisorName || "—"}</td>
                        <td>{h.submittedBy?.name || "—"}</td>
                        <td><span className="badge badge-submitted">Recorded</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
