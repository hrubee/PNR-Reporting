"use client";
import { useState } from "react";
import {
  FOOD_GUIDELINES,
  ORETA_TEMP_CONTROL_ITEMS,
  ORETA_VEG_FILLING_ITEMS,
  ORETA_NON_VEG_FILLING_ITEMS,
  COOKING_TEMP_OPTIONS,
  HOLDING_TEMP_OPTIONS,
  FRIDGE_TEMP_OPTIONS,
  USE_BY_OPTIONS,
  WASTAGE_OPTIONS,
  TIME_PRESET_OPTIONS,
  ORETA_STAFF,
} from "@/lib/outlets";
import { SUPERVISORS } from "@/lib/permissions";

export interface TempCheck {
  id: number;
  product: string;
  cookingTemp: string;
  holdingTemp: string;
  time: string;
  fridgeTemp: string;
  useBy: string;
}

export interface VegFillingCheck {
  id: number;
  product: string;
  receivedDate: string;
  openDate?: string;
  openTime: string;
  useBy: string;
  wastage: string;
  staffName: string;
  hasOpenDate?: boolean;
}

export interface NonVegFillingCheck {
  id: number;
  product: string;
  receivedDate: string;
  openTime: string;
  useBy: string;
  wastage: string;
  staffName: string;
}

export interface EntryType {
  id: string;
  date: string;
  day: string;
  supervisorName: string;
  tempChecks: string;
  vegChecks: string;
  nonVegChecks: string;
  comments: string;
  correctiveAction: string;
  submittedBy?: { name: string };
  createdAt: string;
}

interface Props {
  today: string;
  todayLabel: string;
  dayName: string;
  todayEntries: EntryType[];
  history: EntryType[];
  userName: string;
  staffList?: string[];
  supervisorsList?: string[];
}

function getCurrentTimeString(): string {
  const d = new Date();
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const mm = minutes < 10 ? `0${minutes}` : minutes;
  const hh = hours < 10 ? `0${hours}` : hours;
  return `${hh}:${mm} ${ampm}`;
}

export default function OretaFoodForm({
  today,
  todayLabel,
  dayName,
  todayEntries: initialTodayEntries,
  history: initialHistory,
  userName,
  staffList = [],
  supervisorsList = [],
}: Props) {
  const availableStaff = staffList.length > 0 ? staffList : ORETA_STAFF;
  const availableSupervisors = supervisorsList.length > 0 ? supervisorsList : SUPERVISORS;
  const defaultStaffMember = availableStaff[0] || "Rameshwar";
  const defaultSupervisor = availableSupervisors[0] || "Aboli Wagh";

  const initTemp: TempCheck[] = ORETA_TEMP_CONTROL_ITEMS.map((item) => ({
    id: item.id,
    product: item.name,
    cookingTemp: "",
    holdingTemp: "",
    time: "",
    fridgeTemp: "",
    useBy: "",
  }));

  const initVeg: VegFillingCheck[] = ORETA_VEG_FILLING_ITEMS.map((item) => ({
    id: item.id,
    product: item.name,
    receivedDate: today,
    openDate: item.hasOpenDate ? today : "",
    openTime: "",
    useBy: "",
    wastage: "",
    staffName: defaultStaffMember,
    hasOpenDate: item.hasOpenDate,
  }));

  const initNonVeg: NonVegFillingCheck[] = ORETA_NON_VEG_FILLING_ITEMS.map((item) => ({
    id: item.id,
    product: item.name,
    receivedDate: today,
    openTime: "",
    useBy: "",
    wastage: "",
    staffName: defaultStaffMember,
  }));

  const [todayEntries, setTodayEntries] = useState<EntryType[]>(initialTodayEntries);
  const [history, setHistory] = useState<EntryType[]>(initialHistory);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(initialTodayEntries.length === 0);

  const [tempChecks, setTempChecks] = useState<TempCheck[]>(initTemp);
  const [vegChecks, setVegChecks] = useState<VegFillingCheck[]>(initVeg);
  const [nonVegChecks, setNonVegChecks] = useState<NonVegFillingCheck[]>(initNonVeg);

  const [supervisorName, setSupervisorName] = useState(defaultSupervisor);
  const [comments, setComments] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "temp" | "veg" | "nonveg">("all");
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState(today);

  function startNewSubmission() {
    setEditingId(null);
    setTempChecks(initTemp);
    setVegChecks(initVeg);
    setNonVegChecks(initNonVeg);
    setSupervisorName(SUPERVISORS[0] || "Aboli Wagh");
    setComments("");
    setCorrectiveAction("");
    setIsEditing(true);
    setAlert(null);
  }

  function startEditSubmission(entry: EntryType) {
    setEditingId(entry.id);
    try {
      const parsedTemp = JSON.parse(entry.tempChecks || "[]");
      if (Array.isArray(parsedTemp) && parsedTemp.length > 0) {
        setTempChecks(
          ORETA_TEMP_CONTROL_ITEMS.map((def) => {
            const found = parsedTemp.find(
              (p: any) =>
                p.product?.trim().toLowerCase() === def.name.trim().toLowerCase() ||
                p.id === def.id
            );
            return {
              id: def.id,
              product: def.name,
              cookingTemp: found?.cookingTemp || "",
              holdingTemp: found?.holdingTemp || "",
              time: found?.time || "",
              fridgeTemp: found?.fridgeTemp || "",
              useBy: found?.useBy || "",
            };
          })
        );
      } else {
        setTempChecks(initTemp);
      }
    } catch {
      setTempChecks(initTemp);
    }

    try {
      const parsedVeg = JSON.parse(entry.vegChecks || "[]");
      if (Array.isArray(parsedVeg) && parsedVeg.length > 0) {
        setVegChecks(
          ORETA_VEG_FILLING_ITEMS.map((def) => {
            const found = parsedVeg.find(
              (p: any) =>
                p.product?.trim().toLowerCase() === def.name.trim().toLowerCase() ||
                p.id === def.id
            );
            return {
              id: def.id,
              product: def.name,
              receivedDate: found?.receivedDate || today,
              openDate: def.hasOpenDate ? (found?.openDate || today) : "",
              openTime: found?.openTime || "",
              useBy: found?.useBy || "",
              wastage: found?.wastage || "",
              staffName: found?.staffName || "Rameshwar",
              hasOpenDate: def.hasOpenDate,
            };
          })
        );
      } else {
        setVegChecks(initVeg);
      }
    } catch {
      setVegChecks(initVeg);
    }

    try {
      const parsedNonVeg = JSON.parse(entry.nonVegChecks || "[]");
      if (Array.isArray(parsedNonVeg) && parsedNonVeg.length > 0) {
        setNonVegChecks(
          ORETA_NON_VEG_FILLING_ITEMS.map((def) => {
            const found = parsedNonVeg.find(
              (p: any) =>
                p.product?.trim().toLowerCase() === def.name.trim().toLowerCase() ||
                p.id === def.id
            );
            return {
              id: def.id,
              product: def.name,
              receivedDate: found?.receivedDate || today,
              openTime: found?.openTime || "",
              useBy: found?.useBy || "",
              wastage: found?.wastage || "",
              staffName: found?.staffName || "Rameshwar",
            };
          })
        );
      } else {
        setNonVegChecks(initNonVeg);
      }
    } catch {
      setNonVegChecks(initNonVeg);
    }

    setSupervisorName(entry.supervisorName || SUPERVISORS[0] || "Aboli Wagh");
    setComments(entry.comments || "");
    setCorrectiveAction(entry.correctiveAction || "");
    setIsEditing(true);
    setAlert(null);
  }

  function updateTemp(idx: number, field: keyof TempCheck, val: string) {
    setTempChecks((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  }

  function updateVeg(idx: number, field: keyof VegFillingCheck, val: string) {
    setVegChecks((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  }

  function updateNonVeg(idx: number, field: keyof NonVegFillingCheck, val: string) {
    setNonVegChecks((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  }

  // Quick Preset Handlers
  function setAllCurrentTimes() {
    const timeNow = getCurrentTimeString();
    setTempChecks((prev) => prev.map((t) => ({ ...t, time: t.time || timeNow })));
    setVegChecks((prev) => prev.map((v) => ({ ...v, openTime: v.openTime || timeNow })));
    setNonVegChecks((prev) => prev.map((nv) => ({ ...nv, openTime: nv.openTime || timeNow })));
  }

  function setAllUseBy48Hrs() {
    setTempChecks((prev) => prev.map((t) => ({ ...t, useBy: t.useBy || "48 hrs / OK" })));
    setVegChecks((prev) => prev.map((v) => ({ ...v, useBy: v.useBy || "48 hrs / OK" })));
    setNonVegChecks((prev) => prev.map((nv) => ({ ...nv, useBy: nv.useBy || "48 hrs / OK" })));
  }

  function setAllZeroWastage() {
    setVegChecks((prev) => prev.map((v) => ({ ...v, wastage: v.wastage || "0 / None" })));
    setNonVegChecks((prev) => prev.map((nv) => ({ ...nv, wastage: nv.wastage || "0 / None" })));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    const payload = {
      id: editingId || undefined,
      date: today,
      day: dayName,
      supervisorName,
      tempChecks: JSON.stringify(tempChecks),
      vegChecks: JSON.stringify(vegChecks),
      nonVegChecks: JSON.stringify(nonVegChecks),
      comments,
      correctiveAction,
    };

    try {
      const res = await fetch("/api/entries/oreta-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved: EntryType = await res.json();
        const withSubmitter = { ...saved, submittedBy: { name: userName } };

        if (editingId) {
          setTodayEntries((prev) => prev.map((e) => (e.id === editingId ? withSubmitter : e)));
          setHistory((prev) => prev.map((e) => (e.id === editingId ? withSubmitter : e)));
          setAlert({ type: "success", msg: "✅ Oreta Food Safety & Product log updated!" });
        } else {
          setTodayEntries((prev) => [withSubmitter, ...prev]);
          setHistory((prev) => [withSubmitter, ...prev]);
          setAlert({
            type: "success",
            msg: `✅ New Food Safety report recorded at ${new Date(saved.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}!`,
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
          <h1>🍲 Oreta World Food Safety & Product Logs</h1>
          <p>Temperature Control, Holding & Filling Shelf-Life Logs — {todayLabel}</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowGuidelines((s) => !s)}
          >
            {showGuidelines ? "📖 Hide SOP Guidelines" : "📖 View SOP Guidelines"}
          </button>
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

      {/* SOP Guidelines Collapsible Banner */}
      {showGuidelines && (
        <div className="card" style={{ marginBottom: "1.5rem", borderLeft: "4px solid var(--primary)" }}>
          <div className="card-header">
            <div className="card-title">📖 Food Storage & Handling Directions (SOP)</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            {FOOD_GUIDELINES.map((g, idx) => (
              <div
                key={idx}
                style={{
                  padding: "0.75rem 1rem",
                  background: "var(--bg-input)",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  {g.condition}
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--primary)", marginTop: "2px" }}>
                  {g.requirement}
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text)", marginTop: "2px" }}>
                  {g.notes}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TODAY'S RECORDED SUBMISSIONS */}
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

      {/* EDIT / NEW FORM */}
      {isEditing && (
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <div className="card-header" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
              <div className="card-title">
                {editingId ? "✏️ Edit Food Safety & Logs Report" : "➕ New Food Safety & Logs Submission"}
              </div>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={setAllCurrentTimes}
                  title="Fills current time into empty time fields"
                >
                  ⚡ Set Current Time
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={setAllUseBy48Hrs}
                  title="Sets '48 hrs / OK' into empty Use By fields"
                >
                  ⚡ Use By 48 hrs
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={setAllZeroWastage}
                  title="Sets '0 / None' into empty wastage fields"
                >
                  ⚡ 0 Wastage
                </button>
              </div>
            </div>

            {/* Section Switcher Tabs */}
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === "all" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setActiveTab("all")}
              >
                📋 All Logs
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === "temp" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setActiveTab("temp")}
              >
                🌡️ Temp Control Log
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === "veg" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setActiveTab("veg")}
              >
                🥬 Veg Fillings & Sauces
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === "nonveg" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setActiveTab("nonveg")}
              >
                🍗 Non-Veg Fillings
              </button>
            </div>

            {/* 1. TEMPERATURE CONTROL & HOLDING LOG */}
            {(activeTab === "all" || activeTab === "temp") && (
              <div style={{ marginBottom: "2rem" }}>
                <div
                  style={{
                    padding: "0.6rem 1rem",
                    background: "var(--bg-card-hover, rgba(255,255,255,0.03))",
                    borderRadius: "8px",
                    borderLeft: "4px solid #3b82f6",
                    marginBottom: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <strong style={{ color: "#3b82f6" }}>🌡️ Section 1: Temperature Control & Holding Log</strong>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Rule: Cooking &gt; 70°C, Holding &lt; 60°C / Fridge +1 to +5°C
                  </span>
                </div>

                <div className="mobile-cards-container" style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {tempChecks.map((item, idx) => (
                    <div
                      key={item.id}
                      style={{
                        padding: "1rem",
                        background: "var(--bg-input)",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span className="badge badge-submitted">#{idx + 1}</span>
                        <span>{item.product}</span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "0.75rem" }}>
                        {/* Cooking Temp */}
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: "0.8rem" }}>Cooking Temp (&gt;70°C)</label>
                          <select
                            value={item.cookingTemp}
                            onChange={(e) => updateTemp(idx, "cookingTemp", e.target.value)}
                            style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)" }}
                          >
                            <option value="">Select Temp...</option>
                            {COOKING_TEMP_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        {/* Holding Temp */}
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: "0.8rem" }}>Holding Temp (&lt;60°C)</label>
                          <select
                            value={item.holdingTemp}
                            onChange={(e) => updateTemp(idx, "holdingTemp", e.target.value)}
                            style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)" }}
                          >
                            <option value="">Select Temp...</option>
                            {HOLDING_TEMP_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        {/* Time */}
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: "0.8rem" }}>Time</label>
                          <select
                            value={item.time}
                            onChange={(e) => updateTemp(idx, "time", e.target.value)}
                            style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)" }}
                          >
                            <option value="">Select Time...</option>
                            {TIME_PRESET_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        {/* Fridge Temp */}
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: "0.8rem" }}>Fridge Temp</label>
                          <select
                            value={item.fridgeTemp}
                            onChange={(e) => updateTemp(idx, "fridgeTemp", e.target.value)}
                            style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)" }}
                          >
                            <option value="">Select Fridge Temp...</option>
                            {FRIDGE_TEMP_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        {/* Use By */}
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: "0.8rem" }}>Use By</label>
                          <select
                            value={item.useBy}
                            onChange={(e) => updateTemp(idx, "useBy", e.target.value)}
                            style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)" }}
                          >
                            <option value="">Select Use By...</option>
                            {USE_BY_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. VEG FILLING LOG */}
            {(activeTab === "all" || activeTab === "veg") && (
              <div style={{ marginBottom: "2rem" }}>
                <div
                  style={{
                    padding: "0.6rem 1rem",
                    background: "var(--bg-card-hover, rgba(255,255,255,0.03))",
                    borderRadius: "8px",
                    borderLeft: "4px solid #10b981",
                    marginBottom: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <strong style={{ color: "#10b981" }}>🥬 Section 2: VEG Filling & Sauce Log</strong>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Rule: Once opened use within 2 days (48 hrs)
                  </span>
                </div>

                <div className="mobile-cards-container" style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {vegChecks.map((item, idx) => (
                    <div
                      key={item.id}
                      style={{
                        padding: "1rem",
                        background: "var(--bg-input)",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span className="badge badge-submitted">#{idx + 1}</span>
                        <span>{item.product}</span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
                        {/* Received Date */}
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: "0.8rem" }}>Received Date</label>
                          <input
                            type="date"
                            value={item.receivedDate}
                            onChange={(e) => updateVeg(idx, "receivedDate", e.target.value)}
                            style={{ width: "100%", padding: "0.45rem", borderRadius: "6px", border: "1px solid var(--border)" }}
                          />
                        </div>

                        {/* Open Date if applicable */}
                        {item.hasOpenDate && (
                          <div className="form-group" style={{ margin: 0 }}>
                            <label style={{ fontSize: "0.8rem" }}>Open Date</label>
                            <input
                              type="date"
                              value={item.openDate || ""}
                              onChange={(e) => updateVeg(idx, "openDate", e.target.value)}
                              style={{ width: "100%", padding: "0.45rem", borderRadius: "6px", border: "1px solid var(--border)" }}
                            />
                          </div>
                        )}

                        {/* Open Time */}
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: "0.8rem" }}>Open Time</label>
                          <select
                            value={item.openTime}
                            onChange={(e) => updateVeg(idx, "openTime", e.target.value)}
                            style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)" }}
                          >
                            <option value="">Select Time...</option>
                            {TIME_PRESET_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        {/* Use By */}
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: "0.8rem" }}>Use By</label>
                          <select
                            value={item.useBy}
                            onChange={(e) => updateVeg(idx, "useBy", e.target.value)}
                            style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)" }}
                          >
                            <option value="">Select Use By...</option>
                            {USE_BY_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        {/* Wastage */}
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: "0.8rem" }}>Wastage</label>
                          <select
                            value={item.wastage}
                            onChange={(e) => updateVeg(idx, "wastage", e.target.value)}
                            style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)" }}
                          >
                            <option value="">Select Wastage...</option>
                            {WASTAGE_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        {/* Staff Name */}
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: "0.8rem" }}>Staff / Prep By</label>
                          <select
                            value={item.staffName}
                            onChange={(e) => updateVeg(idx, "staffName", e.target.value)}
                            style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)" }}
                          >
                            {availableStaff.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. NON-VEG FILLING LOG */}
            {(activeTab === "all" || activeTab === "nonveg") && (
              <div style={{ marginBottom: "2rem" }}>
                <div
                  style={{
                    padding: "0.6rem 1rem",
                    background: "var(--bg-card-hover, rgba(255,255,255,0.03))",
                    borderRadius: "8px",
                    borderLeft: "4px solid #f59e0b",
                    marginBottom: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <strong style={{ color: "#f59e0b" }}>🍗 Section 3: NON-VEG Filling Log</strong>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Rule: Once opened use within 2 days (48 hrs)
                  </span>
                </div>

                <div className="mobile-cards-container" style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {nonVegChecks.map((item, idx) => (
                    <div
                      key={item.id}
                      style={{
                        padding: "1rem",
                        background: "var(--bg-input)",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span className="badge badge-submitted">#{idx + 1}</span>
                        <span>{item.product}</span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
                        {/* Received Date */}
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: "0.8rem" }}>Received Date</label>
                          <input
                            type="date"
                            value={item.receivedDate}
                            onChange={(e) => updateNonVeg(idx, "receivedDate", e.target.value)}
                            style={{ width: "100%", padding: "0.45rem", borderRadius: "6px", border: "1px solid var(--border)" }}
                          />
                        </div>

                        {/* Open Time */}
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: "0.8rem" }}>Open Time</label>
                          <select
                            value={item.openTime}
                            onChange={(e) => updateNonVeg(idx, "openTime", e.target.value)}
                            style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)" }}
                          >
                            <option value="">Select Time...</option>
                            {TIME_PRESET_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        {/* Use By */}
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: "0.8rem" }}>Use By</label>
                          <select
                            value={item.useBy}
                            onChange={(e) => updateNonVeg(idx, "useBy", e.target.value)}
                            style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)" }}
                          >
                            <option value="">Select Use By...</option>
                            {USE_BY_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        {/* Wastage */}
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: "0.8rem" }}>Wastage</label>
                          <select
                            value={item.wastage}
                            onChange={(e) => updateNonVeg(idx, "wastage", e.target.value)}
                            style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)" }}
                          >
                            <option value="">Select Wastage...</option>
                            {WASTAGE_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        {/* Staff Name */}
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: "0.8rem" }}>Staff / Prep By</label>
                          <select
                            value={item.staffName}
                            onChange={(e) => updateNonVeg(idx, "staffName", e.target.value)}
                            style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)" }}
                          >
                            {availableStaff.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supervisor, Remarks & Corrective Actions */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
              <div className="form-group">
                <label>Verified / Supervised By</label>
                <select
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)" }}
                >
                  {availableSupervisors.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Food Safety Remarks</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="e.g. All fillings checked, temperatures within limits."
                  rows={2}
                />
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label>Corrective Actions</label>
                <textarea
                  value={correctiveAction}
                  onChange={(e) => setCorrectiveAction(e.target.value)}
                  placeholder="e.g. Discarded expired batch of chutney; thawed chicken moved to chiller."
                  rows={2}
                />
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: "1.5rem" }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "⏳ Saving..." : editingId ? "💾 Update Food Safety Report" : "💾 Submit Food Safety Report"}
              </button>
              {todayEntries.length > 0 && (
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      )}

      {/* HISTORY LOG */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">🕒 Oreta Food Safety History Log</div>
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
            <div className="empty-state-icon">🍲</div>
            <p>No food safety records found for {selectedDate}.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {selectedDateEntries.map((entry) => {
              let parsedT: TempCheck[] = [];
              let parsedV: VegFillingCheck[] = [];
              let parsedNV: NonVegFillingCheck[] = [];
              try { parsedT = JSON.parse(entry.tempChecks); } catch {}
              try { parsedV = JSON.parse(entry.vegChecks); } catch {}
              try { parsedNV = JSON.parse(entry.nonVegChecks); } catch {}

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
                      <strong>📅 {entry.date} ({entry.day})</strong> · Supervisor: <strong>{entry.supervisorName || "Aboli Wagh"}</strong> · Submitted by <strong>{entry.submittedBy?.name || "Admin"}</strong>
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      ⏰ {new Date(entry.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </div>
                  </div>

                  {/* Summary badges */}
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                    <span className="badge badge-active">🌡️ {parsedT.length} Temp Checks</span>
                    <span className="badge badge-active" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>🥬 {parsedV.length} Veg Fillings</span>
                    <span className="badge badge-active" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>🍗 {parsedNV.length} Non-Veg Fillings</span>
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
