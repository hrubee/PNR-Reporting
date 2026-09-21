"use client";
import { useOutlet } from "./OutletContext";
import { OUTLETS } from "@/lib/outlets";

export default function DashboardOutletTabs() {
  const { activeOutlet, setOutlet } = useOutlet();

  return (
    <div
      style={{
        display: "flex",
        gap: "0.4rem",
        background: "var(--bg-card)",
        padding: "0.35rem",
        borderRadius: "10px",
        border: "1px solid var(--border)",
        flexWrap: "wrap",
      }}
    >
      {OUTLETS.map((out) => {
        const isActive = out.id === activeOutlet.id;
        return (
          <button
            key={out.id}
            type="button"
            onClick={() => setOutlet(out.id)}
            className={`btn btn-sm ${isActive ? "btn-primary" : "btn-secondary"}`}
            style={{
              padding: "0.4rem 0.85rem",
              fontSize: "0.85rem",
              fontWeight: isActive ? 700 : 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {out.icon} {out.name}
          </button>
        );
      })}
    </div>
  );
}
