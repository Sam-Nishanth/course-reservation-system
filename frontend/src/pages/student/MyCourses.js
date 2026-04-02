import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { getMyEnrollments } from "../../api";

export default function MyCourses() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyEnrollments()
      .then((r) => setEnrollments(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="page-content fade-in">
        <div className="page-header">
          <div>
            <h1>My Courses</h1>
            <p>Courses you're currently enrolled in</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/student/courses")}>
            + Browse Courses
          </button>
        </div>

        {loading ? (
          <p className="text-muted">Loading your courses...</p>
        ) : enrollments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>No courses yet</h3>
            <p>You haven't enrolled in any courses. Start learning today!</p>
            <button className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={() => navigate("/student/courses")}>
              Browse Courses
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {enrollments.map((e) => (
              <div key={e.id} className="card" style={{ display: "flex", gap: "1.5rem", alignItems: "center", padding: "1.25rem" }}>
                {/* Icon */}
                <div style={{
                  width: 64, height: 64, background: "var(--primary-light)",
                  borderRadius: "var(--radius)", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "1.75rem", flexShrink: 0,
                }}>🎓</div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    <h4 style={{ margin: 0 }}>{e.course_title}</h4>
                    <span className={`badge ${e.progress_percentage === 100 ? "badge-success" : "badge-primary"}`}>
                      {e.progress_percentage === 100 ? "✅ Completed" : "🔄 In Progress"}
                    </span>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: "0.25rem 0 0.75rem" }}>
                    Enrolled on {new Date(e.enrolled_at).toLocaleDateString()} · {e.completed_modules}/{e.total_modules} modules done
                  </p>

                  {/* Progress bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div className="progress-bar-wrap" style={{ flex: 1 }}>
                      <div className="progress-bar-fill" style={{ width: `${e.progress_percentage}%` }} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--primary)", flexShrink: 0 }}>
                      {e.progress_percentage}%
                    </span>
                  </div>
                </div>

                {/* Action */}
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  <span className={`badge ${e.payment_status === "paid" ? "badge-success" : "badge-warning"}`}>
                    💳 {e.payment_status}
                  </span>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/student/learn/${e.id}`)}
                  >
                    {e.progress_percentage === 100 ? "Review" : "Continue →"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}