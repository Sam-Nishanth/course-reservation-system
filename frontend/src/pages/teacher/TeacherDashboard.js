import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { getMyCourses, deleteCourse, togglePublish } from "../../api";
import toast from "react-hot-toast";

export default function ManageCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    getMyCourses().then((r) => setCourses(r.data)).finally(() => setLoading(false));
  }, []);

  async function handleToggle(id) {
    try {
      const res = await togglePublish(id);
      setCourses((p) => p.map((c) => c.id === id ? { ...c, is_published: res.data.is_published } : c));
      toast.success(res.data.message);
    } catch { toast.error("Could not update course status"); }
  }

  async function handleDelete(id) {
    try {
      await deleteCourse(id);
      setCourses((p) => p.filter((c) => c.id !== id));
      toast.success("Course deleted");
    } catch (err) {
      toast.error(err.response?.data?.error || "Delete failed");
    } finally {
      setConfirmDelete(null);
    }
  }

  return (
    <DashboardLayout>
      <div className="page-content fade-in">
        <div className="page-header">
          <div><h1>My Courses</h1><p>{courses.length} course{courses.length !== 1 ? "s" : ""} total</p></div>
          <button className="btn btn-primary" onClick={() => navigate("/teacher/courses/add")}>+ Add Course</button>
        </div>

        {loading ? (
          <p className="text-muted">Loading courses...</p>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎓</div>
            <h3>No courses yet</h3>
            <p>Create your first course to start teaching!</p>
            <button className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={() => navigate("/teacher/courses/add")}>
              Create Course
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {courses.map((c) => (
              <div key={c.id} className="card" style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "var(--radius)",
                  background: c.thumbnail_url ? undefined : "var(--primary-light)",
                  overflow: "hidden", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem",
                }}>
                  {c.thumbnail_url
                    ? <img src={c.thumbnail_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : "🎓"}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    <h4 style={{ margin: 0, fontSize: "1rem" }}>{c.title}</h4>
                    <span className={`badge ${c.is_published ? "badge-success" : "badge-warning"}`}>
                      {c.is_published ? "Published" : "Draft"}
                    </span>
                    <span className="badge badge-gray">{c.category}</span>
                  </div>
                  <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.35rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>💰 {c.price === 0 ? "Free" : `₹${c.price.toLocaleString()}`}</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>👥 {c.enrollment_count} students</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>⏱ {c.duration || "Self-paced"}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, flexWrap: "wrap" }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/teacher/courses/${c.id}`)}>👁 View</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/teacher/courses/${c.id}/edit`)}>✏️ Edit</button>
                  <button
                    className={`btn btn-sm ${c.is_published ? "btn-warning" : "btn-success"}`}
                    style={{ background: c.is_published ? "#FEF3C7" : "#DCFCE7", color: c.is_published ? "#D97706" : "var(--success)" }}
                    onClick={() => handleToggle(c.id)}
                  >
                    {c.is_published ? "Unpublish" : "Publish"}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(c.id)}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3>Delete Course</h3>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Are you sure you want to delete this course? This action cannot be undone and all enrollments will be lost.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(confirmDelete)}>Delete Course</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}