import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const PAGE_TITLES = {
  "/student/dashboard":  "Dashboard",
  "/student/my-courses": "My Courses",
  "/student/courses":    "Browse Courses",
  "/student/settings":   "Settings",
  "/teacher/dashboard":  "Dashboard",
  "/teacher/courses":    "Manage Courses",
  "/teacher/courses/add":"Add New Course",
  "/teacher/students":   "Students",
  "/teacher/settings":   "Settings",
  "/admin/dashboard":    "Dashboard",
  "/admin/users":        "Manage Users",
  "/admin/courses":      "All Courses",
  "/admin/analytics":    "Analytics",
};

export default function Navbar({ onMenuClick }) {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = React.useState(false);

  const title = PAGE_TITLES[location.pathname] || "CourseHub";

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  function handleLogout() {
    logoutUser();
    toast.success("Logged out successfully");
    navigate("/login");
  }

  const settingsPath = `/${user?.role}/settings`;

  return (
    <header style={{
      position: "fixed",
      top: 0,
      left: "var(--sidebar-width)",
      right: 0,
      height: "var(--navbar-height)",
      background: "rgba(248, 247, 255, 0.92)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 1.5rem",
      zIndex: 90,
    }}>
      {/* Left: hamburger + title */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={onMenuClick}
          style={{
            display: "none",
            background: "none",
            border: "none",
            fontSize: "1.25rem",
            cursor: "pointer",
            padding: "0.25rem",
            color: "var(--text-secondary)",
          }}
          className="menu-btn"
        >
          ☰
        </button>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>{title}</h2>
      </div>

      {/* Right: avatar + dropdown */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setDropOpen((p) => !p)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            background: "var(--surface)",
            border: "1.5px solid var(--border)",
            borderRadius: "100px",
            padding: "0.375rem 0.875rem 0.375rem 0.375rem",
            cursor: "pointer",
            transition: "all 0.15s",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
        >
          <div style={{
            width: 32, height: 32,
            borderRadius: "50%",
            background: "var(--primary)",
            color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700,
            fontSize: "0.8rem",
          }}>
            {initials}
          </div>
          <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
            {user?.name?.split(" ")[0]}
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>▾</span>
        </button>

        {dropOpen && (
          <>
            <div
              onClick={() => setDropOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 100 }}
            />
            <div style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 0.5rem)",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-lg)",
              minWidth: 200,
              zIndex: 101,
              overflow: "hidden",
              animation: "modalIn 0.15s ease",
            }}>
              <div style={{ padding: "0.875rem 1rem", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{user?.name}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>{user?.email}</div>
              </div>
              <div style={{ padding: "0.375rem" }}>
                <button
                  onClick={() => { navigate(settingsPath); setDropOpen(false); }}
                  style={dropItemStyle}
                >
                  ⚙️ Settings
                </button>
                <button onClick={handleLogout} style={{ ...dropItemStyle, color: "var(--danger)" }}>
                  🚪 Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

const dropItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  width: "100%",
  padding: "0.625rem 0.75rem",
  background: "none",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "var(--text-primary)",
  textAlign: "left",
  transition: "background 0.15s",
};