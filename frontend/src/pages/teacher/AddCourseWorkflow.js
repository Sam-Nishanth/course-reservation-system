import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { createCourse } from "../../api";
import toast from "react-hot-toast";

const emptyModule = (weekNumber) => ({ week_number: weekNumber, title: "", video_url: "", notes: "", assignment: "", duration_minutes: 0 });

export default function AddCourseWorkflow() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    short_description: "",
    detailed_description: "",
    category: "General",
    price: 0,
    duration: "",
    duration_weeks: 0,
    schedule: "",
    resources: "",
    thumbnail_url: "",
    intro_video_url: "",
    video_links: "",
    prerequisites: "",
    learning_outcomes: "",
    total_seats: 30,
  });
  const [modules, setModules] = useState([emptyModule(1)]);

  function handleForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function updateModule(index, field, value) {
    setModules((current) => current.map((module, currentIndex) => (currentIndex === index ? { ...module, [field]: value } : module)));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.title.trim()) {
      toast.error("Course title is required");
      return;
    }
    setSaving(true);
    try {
      const res = await createCourse({ ...form, modules });
      toast.success("Course draft created");
      navigate(`/teacher/courses/${res.data.course.id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || "Could not create course");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="page-content fade-in" style={{ maxWidth: 920 }}>
        <div className="page-header">
          <div>
            <h1>Create Course Draft</h1>
            <p>Courses now start as drafts and move through admin review before publication.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: "1rem" }}>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Title</label><input className="form-input" name="title" value={form.title} onChange={handleForm} /></div>
              <div className="form-group"><label className="form-label">Category</label><input className="form-input" name="category" value={form.category} onChange={handleForm} /></div>
            </div>
            <div className="form-group"><label className="form-label">Short Description</label><input className="form-input" name="short_description" value={form.short_description} onChange={handleForm} /></div>
            <div className="form-group"><label className="form-label">Detailed Description</label><textarea className="form-textarea" name="detailed_description" value={form.detailed_description} onChange={handleForm} /></div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Fee</label><input className="form-input" type="number" name="price" value={form.price} onChange={handleForm} /></div>
              <div className="form-group"><label className="form-label">Duration (weeks)</label><input className="form-input" type="number" name="duration_weeks" value={form.duration_weeks} onChange={handleForm} /></div>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Duration Label</label><input className="form-input" name="duration" value={form.duration} onChange={handleForm} /></div>
              <div className="form-group"><label className="form-label">Seats</label><input className="form-input" type="number" name="total_seats" value={form.total_seats} onChange={handleForm} /></div>
            </div>
            <div className="form-group"><label className="form-label">Schedule</label><textarea className="form-textarea" name="schedule" value={form.schedule} onChange={handleForm} /></div>
            <div className="form-group"><label className="form-label">Resources / Notes</label><textarea className="form-textarea" name="resources" value={form.resources} onChange={handleForm} /></div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Thumbnail URL</label><input className="form-input" name="thumbnail_url" value={form.thumbnail_url} onChange={handleForm} /></div>
              <div className="form-group"><label className="form-label">Intro Video URL</label><input className="form-input" name="intro_video_url" value={form.intro_video_url} onChange={handleForm} /></div>
            </div>
            <div className="form-group"><label className="form-label">Video Links</label><textarea className="form-textarea" name="video_links" value={form.video_links} onChange={handleForm} /></div>
            <div className="form-group"><label className="form-label">Prerequisites</label><textarea className="form-textarea" name="prerequisites" value={form.prerequisites} onChange={handleForm} /></div>
            <div className="form-group"><label className="form-label">Learning Outcomes</label><textarea className="form-textarea" name="learning_outcomes" value={form.learning_outcomes} onChange={handleForm} /></div>
          </div>

          <div className="card" style={{ marginBottom: "1rem" }}>
            <div className="card-header">
              <span className="card-title">Modules</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModules((current) => [...current, emptyModule(current.length + 1)])}>Add Module</button>
            </div>
            {modules.map((module, index) => (
              <div key={index} className="card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Week</label><input className="form-input" type="number" value={module.week_number} onChange={(event) => updateModule(index, "week_number", Number(event.target.value))} /></div>
                  <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={module.title} onChange={(event) => updateModule(index, "title", event.target.value)} /></div>
                </div>
                <div className="form-group"><label className="form-label">Video URL</label><input className="form-input" value={module.video_url} onChange={(event) => updateModule(index, "video_url", event.target.value)} /></div>
                <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" value={module.notes} onChange={(event) => updateModule(index, "notes", event.target.value)} /></div>
              </div>
            ))}
          </div>

          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Create Draft"}</button>
        </form>
      </div>
    </DashboardLayout>
  );
}
