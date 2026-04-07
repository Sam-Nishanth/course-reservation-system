import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { getCourse, updateCourse } from "../../api";
import toast from "react-hot-toast";

export default function EditCourseWorkflow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    getCourse(id).then((res) => {
      const course = res.data;
      setForm({
        title: course.title,
        short_description: course.short_description,
        detailed_description: course.detailed_description,
        category: course.category,
        price: course.price,
        duration: course.duration,
        duration_weeks: course.duration_weeks || 0,
        schedule: course.schedule || "",
        resources: course.resources || "",
        thumbnail_url: course.thumbnail_url,
        intro_video_url: course.intro_video_url,
        video_links: course.video_links || "",
        prerequisites: course.prerequisites,
        learning_outcomes: course.learning_outcomes,
        total_seats: course.total_seats,
      });
      setModules(course.modules || []);
    }).finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await updateCourse(id, { ...form, modules });
      toast.success("Course updated");
      navigate(`/teacher/courses/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || "Could not update course");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return <DashboardLayout><div className="page-content"><p className="text-muted">Loading...</p></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="page-content fade-in" style={{ maxWidth: 920 }}>
        <div className="page-header"><div><h1>Edit Course Draft</h1></div></div>
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: "1rem" }}>
            <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Detailed Description</label><textarea className="form-textarea" value={form.detailed_description} onChange={(e) => setForm({ ...form, detailed_description: e.target.value })} /></div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Schedule</label><textarea className="form-textarea" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Resources</label><textarea className="form-textarea" value={form.resources} onChange={(e) => setForm({ ...form, resources: e.target.value })} /></div>
            </div>
          </div>
          <div className="card" style={{ marginBottom: "1rem" }}>
            <div className="card-header"><span className="card-title">Modules</span></div>
            {modules.map((module, index) => (
              <div key={index} className="card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
                <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={module.title} onChange={(e) => setModules((current) => current.map((item, currentIndex) => currentIndex === index ? { ...item, title: e.target.value } : item))} /></div>
                <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" value={module.notes} onChange={(e) => setModules((current) => current.map((item, currentIndex) => currentIndex === index ? { ...item, notes: e.target.value } : item))} /></div>
              </div>
            ))}
          </div>
          <button className="btn btn-primary" disabled={saving} type="submit">{saving ? "Saving..." : "Save Changes"}</button>
        </form>
      </div>
    </DashboardLayout>
  );
}
