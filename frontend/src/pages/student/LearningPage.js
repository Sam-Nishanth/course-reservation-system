import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { getProgress, toggleModule, getMyEnrollments, getCourse } from "../../api";
import toast from "react-hot-toast";

export default function LearningPage() {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [course, setCourse] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProgress(enrollmentId)
      .then(async (res) => {
        setProgress(res.data);
        // Get course info from enrollment
        const enrollRes = await getMyEnrollments();
        const enroll = enrollRes.data.find((e) => e.id === parseInt(enrollmentId));
        if (enroll) {
          const cRes = await getCourse(enroll.course_id);
          setCourse(cRes.data);
          if (cRes.data.modules?.length) setActiveModule(cRes.data.modules[0]);
        }
      })
      .catch(() => toast.error("Could not load course"))
      .finally(() => setLoading(false));
  }, [enrollmentId]);

  async function handleToggle(moduleId) {
    try {
      const res = await toggleModule({ enrollment_id: parseInt(enrollmentId), module_id: moduleId });
      setProgress((p) => ({
        ...p,
        progress_percentage: res.data.progress_percentage,
        records: p.records.map((r) =>
          r.module_id === moduleId ? { ...r, is_completed: res.data.is_completed } : r
        ),
      }));
      toast.success(res.data.message);
    } catch {
      toast.error("Could not update progress");
    }
  }

  function isCompleted(moduleId) {
    return progress?.records?.find((r) => r.module_id === moduleId)?.is_completed || false;
  }

  if (loading) return <DashboardLayout><div className="page-content"><p className="text-muted">Loading course...</p></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", minHeight: "calc(100vh - var(--navbar-height))", marginTop: 0 }}>

        {/* Module sidebar */}
        <div style={{ borderRight: "1px solid var(--border)", background: "var(--surface)", overflowY: "auto", padding: "1rem" }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/student/my-courses")} style={{ marginBottom: "1rem", width: "100%" }}>
            ← Back to Courses
          </button>

          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "0.5rem", color: "var(--text-primary)" }}>
              {course?.title}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div className="progress-bar-wrap" style={{ flex: 1, height: 6 }}>
                <div className="progress-bar-fill" style={{ width: `${progress?.progress_percentage || 0}%` }} />
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)" }}>
                {progress?.progress_percentage || 0}%
              </span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              {progress?.completed_modules}/{progress?.total_modules} completed
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            {(course?.modules || []).map((m, i) => {
              const done = isCompleted(m.id);
              const isActive = activeModule?.id === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveModule(m)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.625rem",
                    padding: "0.625rem 0.75rem", borderRadius: "8px",
                    border: "none", background: isActive ? "var(--primary-light)" : "transparent",
                    cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                    transition: "background 0.15s",
                  }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                    background: done ? "var(--success)" : isActive ? "var(--primary)" : "var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.7rem", color: done || isActive ? "white" : "var(--text-muted)",
                    fontWeight: 700,
                  }}>
                    {done ? "✓" : i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: isActive ? "var(--primary)" : "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {m.title}
                    </div>
                    {m.duration_minutes > 0 && (
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{m.duration_minutes} min</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {progress?.progress_percentage === 100 && (
            <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#DCFCE7", borderRadius: "var(--radius)", textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>🏆</div>
              <div style={{ fontWeight: 700, color: "var(--success)", fontSize: "0.875rem" }}>Course Completed!</div>
              <div style={{ fontSize: "0.75rem", color: "#166534", marginTop: "0.25rem" }}>Certificate eligible</div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div style={{ padding: "2rem", overflowY: "auto" }}>
          {activeModule ? (
            <div className="fade-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                    Week {activeModule.week_number}
                  </div>
                  <h2>{activeModule.title}</h2>
                </div>
                <button
                  className={`btn ${isCompleted(activeModule.id) ? "btn-success" : "btn-primary"}`}
                  onClick={() => handleToggle(activeModule.id)}
                >
                  {isCompleted(activeModule.id) ? "✅ Completed" : "Mark as Complete"}
                </button>
              </div>

              {/* Video */}
              {activeModule.video_url ? (
                <div style={{ position: "relative", paddingBottom: "56.25%", borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: "2rem", background: "#000" }}>
                  <iframe
                    src={activeModule.video_url.replace("watch?v=", "embed/")}
                    title={activeModule.title}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                    allowFullScreen
                  />
                </div>
              ) : (
                <div style={{ background: "var(--surface-2)", borderRadius: "var(--radius-lg)", padding: "3rem", textAlign: "center", marginBottom: "2rem", color: "var(--text-muted)" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🎥</div>
                  <p>No video available for this module</p>
                </div>
              )}

              {/* Notes */}
              {activeModule.notes && (
                <div className="card" style={{ marginBottom: "1.5rem" }}>
                  <h4 style={{ marginBottom: "0.75rem" }}>📄 Module Notes</h4>
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                    {activeModule.notes}
                  </p>
                </div>
              )}

              {/* Assignment */}
              {activeModule.assignment && (
                <div className="card" style={{ borderLeft: "4px solid var(--primary)" }}>
                  <h4 style={{ marginBottom: "0.75rem" }}>✏️ Assignment</h4>
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                    {activeModule.assignment}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <h3>Select a module</h3>
              <p>Choose a module from the left to start learning</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}