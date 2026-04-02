import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { createCourse } from "../../api";
import toast from "react-hot-toast";

const CATEGORIES = ["Data Science", "Web Development", "Marketing", "Design", "Business", "Finance", "Photography", "Music", "Health", "Other"];

const emptyModule = () => ({ week_number: 1, title: "", video_url: "", notes: "", assignment: "", duration_minutes: 0 });

export default function AddCourse() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", short_description: "", detailed_description: "",
    category: "General", price: 0, thumbnail_url: "", intro_video_url: "",
    duration: "", prerequisites: "", learning_outcomes: "",
    total_seats: 30, is_published: false,
  });
  const [modules, setModules] = useState([{ ...emptyModule(), week_number: 1 }]);

  function handleForm(e) {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  }

  function handleModuleChange(index, field, value) {
    setModules((prev) => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  }

  function addModule() {
    setModules((prev) => [...prev, { ...emptyModule(), week_number: prev.length + 1 }]);
  }

  function removeModule(index) {
    setModules((prev) => prev.filter((_, i) => i !== index).map((m, i) => ({ ...m, week_number: i + 1 })));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Course title is required"); return; }
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price) || 0, total_seats: parseInt(form.total_seats) || 30, modules };
      const res = await createCourse(payload);
      toast.success("Course created successfully!");
      navigate(`/teacher/courses/${res.data.course.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create course");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="page-content fade-in" style={{ maxWidth: 900 }}>
        <div className="page-header">
          <div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/teacher/courses")} style={{ marginBottom: "0.5rem" }}>← Back</button>
            <h1>Create New Course</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ marginBottom: "1.5rem" }}>📋 Basic Information</h3>
            <div className="form-group">
              <label className="form-label">Course Title *</label>
              <input className="form-input" name="title" placeholder="e.g. Python for Data Science" value={form.title} onChange={handleForm} required />
            </div>
            <div className="form-group">
              <label className="form-label">Short Description</label>
              <input className="form-input" name="short_description" placeholder="Brief one-liner about the course" value={form.short_description} onChange={handleForm} />
            </div>
            <div className="form-group">
              <label className="form-label">Detailed Description</label>
              <textarea className="form-textarea" name="detailed_description" rows={5} placeholder="Full course description..." value={form.detailed_description} onChange={handleForm} />
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
                <input className="form-input" type="number" name="price" min={0} step={1} value={form.price} onChange={handleForm} />
                <div className="form-hint">Set 0 for a free course</div>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Duration</label>
                <input className="form-input" name="duration" placeholder="e.g. 8 weeks" value={form.duration} onChange={handleForm} />
              </div>
              <div className="form-group">
                <label className="form-label">Total Seats</label>
                <input className="form-input" type="number" name="total_seats" min={1} value={form.total_seats} onChange={handleForm} />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ marginBottom: "1.5rem" }}>🎥 Media</h3>
            <div className="form-group">
              <label className="form-label">Thumbnail Image URL</label>
              <input className="form-input" name="thumbnail_url" placeholder="https://..." value={form.thumbnail_url} onChange={handleForm} />
              {form.thumbnail_url && <img src={form.thumbnail_url} alt="" style={{ marginTop: "0.75rem", width: 200, height: 120, objectFit: "cover", borderRadius: "var(--radius)" }} onError={(e) => e.target.style.display = "none"} />}
            </div>
            <div className="form-group">
              <label className="form-label">Intro Video URL (YouTube embed)</label>
              <input className="form-input" name="intro_video_url" placeholder="https://www.youtube.com/embed/..." value={form.intro_video_url} onChange={handleForm} />
            </div>
          </div>

          {/* Requirements */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ marginBottom: "1.5rem" }}>📚 Requirements & Outcomes</h3>
            <div className="form-group">
              <label className="form-label">Prerequisites</label>
              <textarea className="form-textarea" name="prerequisites" rows={3} placeholder="What should students know before taking this course?" value={form.prerequisites} onChange={handleForm} />
            </div>
            <div className="form-group">
              <label className="form-label">Learning Outcomes (one per line)</label>
              <textarea className="form-textarea" name="learning_outcomes" rows={4} placeholder={"Write Python scripts\nAnalyze data with Pandas\n..."} value={form.learning_outcomes} onChange={handleForm} />
            </div>
          </div>

          {/* Modules */}
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
                  <label className="form-label">Module Title *</label>
                  <input className="form-input" placeholder="e.g. Introduction to Python" value={m.title} onChange={(e) => handleModuleChange(i, "title", e.target.value)} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Video URL (YouTube embed)</label>
                    <input className="form-input" placeholder="https://www.youtube.com/embed/..." value={m.video_url} onChange={(e) => handleModuleChange(i, "video_url", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (minutes)</label>
                    <input className="form-input" type="number" min={0} value={m.duration_minutes} onChange={(e) => handleModuleChange(i, "duration_minutes", parseInt(e.target.value) || 0)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes / Study Material</label>
                  <textarea className="form-textarea" rows={3} placeholder="Module notes, reading material..." value={m.notes} onChange={(e) => handleModuleChange(i, "notes", e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Assignment / Quiz</label>
                  <textarea className="form-textarea" rows={2} placeholder="Assignment instructions or quiz questions..." value={m.assignment} onChange={(e) => handleModuleChange(i, "assignment", e.target.value)} />
                </div>
              </div>
            ))}
          </div>

          {/* Publish */}
          <div className="card" style={{ marginBottom: "2rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>🚀 Publishing</h3>
            <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
              <input type="checkbox" name="is_published" checked={form.is_published} onChange={handleForm} style={{ width: 18, height: 18 }} />
              <div>
                <div style={{ fontWeight: 600 }}>Publish this course immediately</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>If unchecked, the course will be saved as a draft</div>
              </div>
            </label>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? "Creating..." : "Create Course"}
            </button>
            <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate("/teacher/courses")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}