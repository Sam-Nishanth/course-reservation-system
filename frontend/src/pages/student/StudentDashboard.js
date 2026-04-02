import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { getMyEnrollments, getTransactions } from "../../api";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyEnrollments(), getTransactions()])
      .then(([eRes, tRes]) => {
        setEnrollments(eRes.data);
        setTransactions(tRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalSpent = transactions.filter((t) => t.status === "success").reduce((s, t) => s + t.amount, 0);
  const completed = enrollments.filter((e) => e.progress_percentage === 100).length;
  const inProgress = enrollments.filter((e) => e.progress_percentage > 0 && e.progress_percentage < 100).length;

  return (
    <DashboardLayout>
      <div className="page-content fade-in">
        {/* Welcome */}
        <div style={{
          background: "linear-gradient(135deg, var(--primary) 0%, #9B6DFF 100%)",
          borderRadius: "var(--radius-xl)",
          padding: "2rem",
          color: "white",
          marginBottom: "2rem",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h1 style={{ color: "white", fontSize: "1.75rem", marginBottom: "0.5rem" }}>
              Welcome back, {user?.name?.split(" ")[0]}! 👋
            </h1>
            <p style={{ opacity: 0.85 }}>Keep up the great work. You're making progress!</p>
            <button
              className="btn"
              onClick={() => navigate("/student/courses")}
              style={{ background: "white", color: "var(--primary)", marginTop: "1.25rem" }}
            >
              Browse New Courses →
            </button>
          </div>
          <div style={{ position: "absolute", right: "-1rem", top: "-1rem", fontSize: "8rem", opacity: 0.1 }}>🎓</div>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: "2rem" }}>
          {[
            { icon: "📚", label: "Enrolled Courses", value: enrollments.length,        bg: "#EEE9FF", color: "var(--primary)" },
            { icon: "✅", label: "Completed",         value: completed,                 bg: "#DCFCE7", color: "var(--success)" },
            { icon: "🔄", label: "In Progress",       value: inProgress,               bg: "#FEF3C7", color: "var(--warning)" },
            { icon: "💰", label: "Total Spent",       value: `₹${totalSpent.toLocaleString()}`, bg: "#FEE2E2", color: "var(--danger)" },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg }}>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
              <div>
                <div className="stat-value">{loading ? "—" : s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid-2">
          {/* My Courses — recent */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Continue Learning</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/student/my-courses")}>View All</button>
            </div>
            {loading ? (
              <p className="text-muted text-sm">Loading...</p>
            ) : enrollments.length === 0 ? (
              <div className="empty-state" style={{ padding: "2rem 0" }}>
                <div className="empty-state-icon">📭</div>
                <p>No courses yet. <button className="btn btn-primary btn-sm" onClick={() => navigate("/student/courses")}>Browse courses</button></p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {enrollments.slice(0, 4).map((e) => (
                  <div key={e.id} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: 42, height: 42, background: "var(--primary-light)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1.25rem" }}>🎓</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.course_title}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.3rem" }}>
                        <div className="progress-bar-wrap" style={{ flex: 1, height: 6 }}>
                          <div className="progress-bar-fill" style={{ width: `${e.progress_percentage}%` }} />
                        </div>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", flexShrink: 0 }}>{e.progress_percentage}%</span>
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/student/learn/${e.id}`)}>
                      Go
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent transactions */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Transactions</span>
            </div>
            {loading ? (
              <p className="text-muted text-sm">Loading...</p>
            ) : transactions.length === 0 ? (
              <div className="empty-state" style={{ padding: "2rem 0" }}>
                <div className="empty-state-icon">💳</div>
                <p>No transactions yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {transactions.slice(0, 5).map((t) => (
                  <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.625rem 0", borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160 }}>{t.course_title}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{new Date(t.paid_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, fontSize: "0.875rem", color: t.status === "success" ? "var(--success)" : "var(--danger)" }}>
                        {t.status === "success" ? "+" : ""}₹{t.amount.toLocaleString()}
                      </div>
                      <span className={`badge ${t.status === "success" ? "badge-success" : "badge-danger"}`} style={{ fontSize: "0.65rem" }}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}