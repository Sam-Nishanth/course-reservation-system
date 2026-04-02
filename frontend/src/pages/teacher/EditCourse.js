import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { getCourse, updateCourse } from "../../api";
import toast from "react-hot-toast";

const CATEGORIES = ["Data Science", "Web Development", "Marketing", "Design", "Business", "Finance", "Photography", "Music", "Health", "Other"];

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    getCourse(id).then((res) => {
      const c = res.data;
      setForm({
        title: c.title, short_description: c.short_description,
        detailed_description: c.detailed_description, category: c.category,
        price: c.price, thumbnail_url: c.thumbnail_url,
        intro_video_url: c.intro_video_url, duration: c.duration,
        prerequisites: c.prerequisites, learning_outcomes: c.learning_outcomes,
        total_seats: c.total_seats, is_published: c.is_published,
      });
      setModules(c.modules || []);
    }).finally(() => setLoading(false));
  }, [id]);

  function handleForm(e) {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  }

  function handleModuleChange(index, field, value) {
    setModules((prev) => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  }

  function addModule() {
    setModules((prev) => [...prev, { week_number: prev.length + 1, title: "", video_url: "", notes: "", assignment: "", duration_minutes: 0 }]);
  }

  function removeModule(index) {
    setModules((prev) => prev.filter((_, i) => i !== index).map((m, i) => ({ ...m, week_number: i + 1 })));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Course title is required"); return; }
    setSaving(true);
    try {
      await updateCourse(id, { ...form, price: parseFloat(form.price) || 0, total_seats: parseInt(form.total_seats) || 30, modules });
      toast.success("Course updated successfully!");
      navigate(`/teacher/courses/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <DashboardLayout><div className="page-content"><p className="text-muted">Loading...</p></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="page-content fade-in" style={{ maxWidth: 900 }}>
        <div className="page-header">
          <div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/teacher/courses/${id}`)} style={{ marginBottom: "0.5rem" }}>← Back</button>
            <h1>Edit Course</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ marginBottom: "1.5rem" }}>📋 Basic Information</h3>
            <div className="form-group">
              <label className="form-label">Course Title *</label>
              <input className="form-input" name="title" value={form.title} onChange={handleForm} required />
            </div>
            <div className="form-group">
              <label className="form-label">Short Description</label>
              <input className="form-input" name="short_description" value={form.short_description} onChange={handleForm} />
            </div>
            <div className="form-group">
              <label className="form-label">Detailed Description</label>
              <textarea className="form-textarea" name="detailed_description" rows={5} value={form.detailed_description} onChange={handleForm} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" name="category" value={form.category} onChange={handleForm}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input className="form-input" type="number" name="price" min={0} value={form.price} onChange={handleForm} />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Duration</label>
                <input className="form-input" name="duration" value={form.duration} onChange={handleForm} />
              </div>
              <div className="form-group">
                <label className="form-label">Total Seats</label>
                <input className="form-input" type="number" name="total_seats" min={1} value={form.total_seats} onChange={handleForm} />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ marginBottom: "1.5rem" }}>🎥 Media</h3>
            <div className="form-group">
              <label className="form-label">Thumbnail Image URL</label>
              <input className="form-input" name="thumbnail_url" value={form.thumbnail_url} onChange={handleForm} />
              {form.thumbnail_url && <img src={form.thumbnail_url} alt="" style={{ marginTop: "0.75rem", width: 200, height: 120, objectFit: "cover", borderRadius: "var(--radius)" }} onError={(e) => e.target.style.display = "none"} />}
            </div>
            <div className="form-group">
              <label className="form-label">Intro Video URL</label>
              <input className="form-input" name="intro_video_url" value={form.intro_video_url} onChange={handleForm} />
            </div>
          </div>

          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ marginBottom: "1.5rem" }}>📚 Requirements & Outcomes</h3>
            <div className="form-group">
              <label className="form-label">Prerequisites</label>
              <textarea className="form-textarea" name="prerequisites" rows={3} value={form.prerequisites} onChange={handleForm} />
            </div>
            <div className="form-group">
              <label className="form-label">Learning Outcomes (one per line)</label>
              <textarea className="form-textarea" name="learning_outcomes" rows={4} value={form.learning_outcomes} onChange={handleForm} />
            </div>
          </div>

          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0 }}>📦 Course Modules</h3>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addModule}>+ Add Module</button>
            </div>
            {modules.map((m, i) => (
              <div key={i} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.25rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <span style={{ fontWeight: 700, color: "var(--primary)" }}>Week {i + 1}</span>
                  {modules.length > 1 && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeModule(i)}>Remove</button>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Module Title</label>
                  <input className="form-input" value={m.title} onChange={(e) => handleModuleChange(i, "title", e.target.value)} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Video URL</label>
                    <input className="form-input" value={m.video_url} onChange={(e) => handleModuleChange(i, "video_url", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (minutes)</label>
                    <input className="form-input" type="number" min={0} value={m.duration_minutes} onChange={(e) => handleModuleChange(i, "duration_minutes", parseInt(e.target.value) || 0)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" rows={3} value={m.notes} onChange={(e) => handleModuleChange(i, "notes", e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Assignment</label>
                  <textarea className="form-textarea" rows={2} value={m.assignment} onChange={(e) => handleModuleChange(i, "assignment", e.target.value)} />
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: "2rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>🚀 Publishing</h3>
            <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
              <input type="checkbox" name="is_published" checked={form.is_published} onChange={handleForm} style={{ width: 18, height: 18 }} />
              <div>
                <div style={{ fontWeight: 600 }}>Course is published</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Uncheck to save as draft and hide from students</div>
              </div>
            </label>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate(`/teacher/courses/${id}`)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}