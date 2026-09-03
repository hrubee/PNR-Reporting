"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface NavItem {
  href: string;
  icon: string;
  label: string;
  badge?: "done" | "pending" | null;
}

interface SidebarProps {
  user: { name: string; email: string; role: string };
  sheetStatuses?: Record<string, boolean | null>; // null = no access
}

const SHEET_NAV: NavItem[] = [
  { href: "/hygiene", icon: "🧹", label: "Hygiene Report" },
  { href: "/glass", icon: "🪟", label: "Glass Report" },
  { href: "/fridge", icon: "🧊", label: "Fridge Report" },
  { href: "/kitchen", icon: "🍳", label: "Kitchen" },
  { href: "/production", icon: "🏭", label: "Production" },
  { href: "/puff-room", icon: "🥐", label: "Puff Room" },
  { href: "/cake-room", icon: "🎂", label: "Cake Room" },
];

export default function Sidebar({ user, sheetStatuses = {} }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = user.role === "ADMIN";
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const doneCount = Object.values(sheetStatuses).filter((v) => v === true).length;
  const accessibleTotal = isAdmin
    ? 7
    : Object.values(sheetStatuses).filter((v) => v !== null).length;

  return (
    <>
      {/* Mobile Top App Bar */}
      <header className="mobile-topbar">
        <button
          className="mobile-hamburger-btn"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle Navigation Menu"
          aria-expanded={mobileOpen}
        >
          <span className="hamburger-icon">{mobileOpen ? "✕" : "☰"}</span>
        </button>

        <Link href="/dashboard" className="mobile-brand" onClick={() => setMobileOpen(false)}>
          <span className="brand-icon">🧹</span>
          <span className="brand-text">PNR Hygiene</span>
        </Link>

        <div className="mobile-status-pill">
          <span className="pill-dot" />
          <span>
            {doneCount}/{accessibleTotal} Done
          </span>
        </div>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar (Desktop fixed + Mobile Drawer) */}
      <nav className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-header">
            <h1>
              <span>🧹</span> PNR Hygiene
            </h1>
            <button
              className="sidebar-close-btn mobile-only"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              ✕
            </button>
          </div>
          <p>Report Management System</p>
        </div>

        <div className="sidebar-nav">
          {/* Dashboard */}
          <Link
            href="/dashboard"
            className={`nav-item ${pathname === "/dashboard" ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </Link>

          {/* Sheet Links */}
          <div className="nav-section-title">Daily Sheets</div>

          {SHEET_NAV.map((item) => {
            const status = sheetStatuses[item.href];
            const hasAccess = status !== null && status !== undefined;
            const done = status === true;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`nav-item ${pathname === item.href ? "active" : ""} ${
                  !hasAccess && !isAdmin ? "no-access" : ""
                }`}
                style={
                  !hasAccess && !isAdmin ? { opacity: 0.35, pointerEvents: "none" } : {}
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {(hasAccess || isAdmin) && (
                  <span className={`nav-badge ${done ? "done" : ""}`}>
                    {done ? "✓" : "⏳"}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Admin Links */}
          {isAdmin && (
            <>
              <div className="nav-section-title">Admin</div>
              <Link
                href="/admin/reports"
                className={`nav-item ${
                  pathname.startsWith("/admin/reports") ? "active" : ""
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="nav-icon">📈</span>
                <span className="nav-label">All Reports</span>
              </Link>
              <Link
                href="/admin/users"
                className={`nav-item ${
                  pathname.startsWith("/admin/users") ? "active" : ""
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="nav-icon">👥</span>
                <span className="nav-label">Users</span>
              </Link>
              <Link
                href="/admin/access"
                className={`nav-item ${
                  pathname.startsWith("/admin/access") ? "active" : ""
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="nav-icon">🔐</span>
                <span className="nav-label">Access Matrix</span>
              </Link>
            </>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role">{user.role.toLowerCase()}</div>
            </div>
            <button
              className="logout-btn"
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Sign out"
              aria-label="Sign out"
            >
              ↩
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
