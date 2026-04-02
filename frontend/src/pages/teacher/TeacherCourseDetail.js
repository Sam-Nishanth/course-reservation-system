import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { getCourse, togglePublish, deleteCourse } from "../../api";
import toast from "react-hot-toast";

export default function TeacherCourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    getCourse(id).then((r) => setCourse(r.data)).finally(() => setLoading(false));
  }, [id]);

  async function handleToggle() {
    try {
      const res = await togglePublish(id);
      setCourse((p) => ({ ...p, is_published: res.data.is_published }));
      toast.success(res.data.message);
    } catch { toast.error("Could not update status"); }
  }

  async function handleDelete() {
    try {
      await deleteCourse(id);
      toast.success("Course deleted");
      navigate("/teacher/courses");
    } catch (err) {
      toast.error(err.response?.data?.error || "Delete failed");
    }
  }

  if (loading) return <DashboardLayout><div className="page-content"><p className="text-muted">Loading...</p></div></DashboardLayout>;
  if (!course) return <DashboardLayout><div className="page-content"><p>Course not found.</p></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="page-content fade-in">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/teacher/courses")} style={{ marginBottom: "1rem" }}>
          ← Back to Courses
        </button>

        {/* Header */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ width: 120, height: 80, borderRadius: "var(--radius)", overflow: "hidden", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>
              {course.thumbnail_url ? <img src={course.thumbnail_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🎓"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                <h2 style={{ margin: 0 }}>{course.title}</h2>
                <span className={`badge ${course.is_published ? "badge-success" : "badge-warning"}`}>
                  {course.is_published ? "Published" : "Draft"}
                </span>
                <span className="badge badge-gray">{course.category}</span>
              </div>
              <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>{course.short_description}</p>
              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>💰 {course.price === 0 ? "Free" : `₹${course.price.toLocaleString()}`}</span>
                <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>⏱ {course.duration || "Self-paced"}</span>
                <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>👥 {course.enrollment_count} enrolled</span>
                <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>🪑 {course.total_seats} seats</span>
                <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>📦 {course.modules?.length || 0} modules</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
              <button className="btn btn-ghost" onClick={() => navigate(`/teacher/courses/${id}/edit`)}>✏️ Edit</button>
              <button
                className="btn"
                style={{ background: course.is_published ? "#FEF3C7" : "#DCFCE7", color: course.is_published ? "#D97706" : "var(--success)" }}
                onClick={handleToggle}
              >
                {course.is_published ? "Unpublish" : "Publish"}
              </button>
              <button className="btn btn-danger" onClick={() => setConfirmDelete(true)}>🗑 Delete</button>
            </div>
          </div>
        </div>

        <div className="grid-2">
          {/* Modules */}
          <div className="card">
            <h3 style={{ marginBottom: "1.25rem" }}>📦 Modules ({course.modules?.length || 0})</h3>
            {(course.modules || []).length === 0 ? (
              <p className="text-muted text-sm">No modules yet. Edit the course to add modules.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {course.modules.map((m, i) => (
                  <div key={m.id} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "0.75rem", background: "var(--surface-2)", borderRadius: "var(--radius)" }}>
                    <div style={{ width: 28, height: 28, background: "var(--primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.75rem", flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{m.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {m.duration_minutes > 0 && `⏱ ${m.duration_minutes} min`}
                        {m.video_url && " · 🎥 Video"}
                        {m.notes && " · 📄 Notes"}
                        {m.assignment && " · ✏️ Assignment"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Course details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {course.learning_outcomes && (
              <div className="card">
                <h4 style={{ marginBottom: "0.75rem" }}>🎯 Learning Outcomes</h4>
                <ul style={{ paddingLeft: "1.25rem", color: "var(--text-secondary)", lineHeight: 2, fontSize: "0.875rem" }}>
                  {course.learning_outcomes.split("\n").filter(Boolean).map((o, i) => <li key={i}>{o}</li>)}
                </ul>
              </div>
            )}
            {course.prerequisites && (
              <div className="card">
                <h4 style={{ marginBottom: "0.75rem" }}>📋 Prerequisites</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{course.prerequisites}</p>
              </div>
            )}
            <div className="card">
              <h4 style={{ marginBottom: "0.75rem" }}>📊 Quick Stats</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {[
                  ["Created", new Date(course.created_at).toLocaleDateString()],
                  ["Enrollments", course.enrollment_count],
                  ["Seats Remaining", course.total_seats - course.enrollment_count],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--text-muted)" }}>{k}</span>
                    <span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3>Delete Course</h3>
              <button className="modal-close" onClick={() => setConfirmDelete(false)}>✕</button>
            </div>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Are you sure? This will permanently delete the course and all enrollments.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}