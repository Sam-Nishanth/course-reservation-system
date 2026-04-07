import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import {
  approveCourseReview,
  getReviewCourses,
  rejectCourseReview,
  requestCourseChanges,
} from "../../api";
import toast from "react-hot-toast";

export default function AdminCoursesReview() {
  const [courses, setCourses] = useState([]);
  const [notes, setNotes] = useState({});
  const [fees, setFees] = useState({});

  useEffect(() => {
    getReviewCourses().then((res) => setCourses(res.data));
  }, []);

  async function handleAction(courseId, action) {
    try {
      let res;
      if (action === "approve") {
        res = await approveCourseReview(courseId, { review_notes: notes[courseId] || "", publication_fee: fees[courseId] || 0 });
      } else if (action === "reject") {
        res = await rejectCourseReview(courseId, { review_notes: notes[courseId] || "" });
      } else {
        res = await requestCourseChanges(courseId, { review_notes: notes[courseId] || "" });
      }
      setCourses((current) => current.map((course) => (course.id === courseId ? res.data.course : course)));
      toast.success("Review updated");
    } catch (error) {
      toast.error(error.response?.data?.error || "Could not update course review");
    }
  }

  return (
    <DashboardLayout>
      <div className="page-content fade-in">
        <div className="page-header">
          <div>
            <h1>Course Reviews</h1>
            <p>Approve, reject, or request changes from teachers.</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {courses.map((course) => (
            <div key={course.id} className="card">
              <h3 style={{ marginBottom: "0.35rem" }}>{course.title}</h3>
              <div className="text-muted text-sm" style={{ marginBottom: "0.75rem" }}>{course.teacher_name} · {course.approval_status}</div>
              <p>{course.detailed_description}</p>
              <div className="grid-2" style={{ marginTop: "1rem" }}>
                <textarea className="form-textarea" placeholder="Review notes" value={notes[course.id] ?? course.review_notes ?? ""} onChange={(e) => setNotes({ ...notes, [course.id]: e.target.value })} />
                <div>
                  <div className="form-group">
                    <label className="form-label">Publication Fee</label>
                    <input className="form-input" type="number" value={fees[course.id] ?? course.publication_fee ?? 0} onChange={(e) => setFees({ ...fees, [course.id]: Number(e.target.value) })} />
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <button className="btn btn-primary btn-sm" onClick={() => handleAction(course.id, "approve")}>Approve</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleAction(course.id, "changes")}>Request Changes</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleAction(course.id, "reject")}>Reject</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
