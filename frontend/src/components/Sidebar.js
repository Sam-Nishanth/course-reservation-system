import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const NAV = {
  student: [
    { to: "/student/dashboard",  icon: "⊞", label: "Dashboard" },
    { to: "/student/my-courses", icon: "📚", label: "My Courses" },
    { to: "/student/courses",    icon: "🔍", label: "Browse Courses" },
    { to: "/student/settings",   icon: "⚙️", label: "Settings" },
  ],
  teacher: [
    { to: "/teacher/dashboard", icon: "⊞", label: "Dashboard" },
    { to: "/teacher/courses",   icon: "🎓", label: "My Courses" },
    { to: "/teacher/students",  icon: "👥", label: "Students" },
    { to: "/teacher/settings",  icon: "⚙️", label: "Settings" },
  ],
  admin: [
    { to: "/admin/dashboard",  icon: "⊞", label: "Dashboard" },
    { to: "/admin/users",      icon: "👥", label: "Manage Users" },
    { to: "/admin/courses",    icon: "🎓", label: "All Courses" },
    { to: "/admin/analytics",  icon: "📊", label: "Analytics" },
  ],
};

const ROLE_COLORS = {
  student: { bg: "#EEE9FF", color: "#6C47FF" },
  teacher: { bg: "#FEF3C7", color: "#D97706" },
  admin:   { bg: "#DCFCE7", color: "#16A34A" },
};

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const links = NAV[user?.role] || [];
  const roleStyle = ROLE_COLORS[user?.role] || {};

  function handleLogout() {
    logoutUser();
    toast.success("Logged out successfully");
    navigate("/login");
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            zIndex: 98,
          }}
          className="mobile-overlay"
        />
      )}

      <aside style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "var(--sidebar-width)",
        height: "100vh",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        zIndex: 99,
        transition: "transform 0.25s ease",
        transform: mobileOpen ? "translateX(0)" : undefined,
        overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{
          padding: "1.5rem 1.25rem 1rem",
          borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: 38, height: 38,
              background: "var(--primary)",
              borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.1rem",
              flexShrink: 0,
            }}>🎓</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)" }}>
                CourseHub
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>
                Learning Platform
              </div>
            </div>
          </div>
        </div>

        {/* User info */}
        <div style={{
          padding: "1rem 1.25rem",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}>
          <div style={{
            width: 40, height: 40,
            borderRadius: "50%",
            background: "var(--primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white",
            fontWeight: 700,
            fontSize: "0.9rem",
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{
              fontWeight: 600, fontSize: "0.875rem",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {user?.name}
            </div>
            <span style={{
              display: "inline-block",
              padding: "1px 8px",
              borderRadius: "100px",
              fontSize: "0.7rem",
              fontWeight: 600,
              background: roleStyle.bg,
              color: roleStyle.color,
              textTransform: "capitalize",
              marginTop: "2px",
            }}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "0.75rem 0.75rem" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", padding: "0 0.5rem", marginBottom: "0.5rem", textTransform: "uppercase" }}>
            Menu
          </div>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.625rem 0.75rem",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
                marginBottom: "2px",
                transition: "all 0.15s ease",
                background: isActive ? "var(--primary-light)" : "transparent",
                color: isActive ? "var(--primary)" : "var(--text-secondary)",
              })}
            >
              <span style={{ fontSize: "1rem", width: 20, textAlign: "center" }}>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: "0.75rem" }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.625rem 0.75rem",
              borderRadius: "10px",
              border: "none",
              background: "transparent",
              color: "var(--danger)",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "background 0.15s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#FEE2E2"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <span style={{ fontSize: "1rem", width: 20, textAlign: "center" }}>🚪</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
