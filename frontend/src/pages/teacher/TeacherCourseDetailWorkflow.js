import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { getCourse, submitCourseForReview } from "../../api";
import toast from "react-hot-toast";

export default function TeacherCourseDetailWorkflow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    getCourse(id).then((res) => setCourse(res.data));
  }, [id]);

  async function handleSubmitReview() {
    try {
      const res = await submitCourseForReview(id);
      setCourse(res.data.course);
      toast.success("Course submitted for review");
    } catch (error) {
      toast.error(error.response?.data?.error || "Could not submit course");
    }
  }

  if (!course) {
    return <DashboardLayout><div className="page-content"><p className="text-muted">Loading...</p></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="page-content fade-in">
        <div className="page-header">
          <div>
            <h1>{course.title}</h1>
            <p>Status: {course.approval_status}</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn btn-ghost" onClick={() => navigate(`/teacher/courses/${id}/edit`)}>Edit</button>
            {["draft", "changes_requested", "rejected"].includes(course.approval_status) ? (
              <button className="btn btn-primary" onClick={handleSubmitReview}>Submit for Review</button>
            ) : null}
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <h3>Course Overview</h3>
            <p>{course.detailed_description}</p>
            <div className="text-muted text-sm">Schedule: {course.schedule || "Not specified"}</div>
            <div className="text-muted text-sm">Resources: {course.resources || "Not specified"}</div>
          </div>
          <div className="card">
            <h3>Review Status</h3>
            <div className="text-muted text-sm">Admin notes: {course.review_notes || "No notes yet"}</div>
            <div className="text-muted text-sm">Publication fee: Rs {(course.publication_fee || 0).toLocaleString()}</div>
            <div className="text-muted text-sm">Publication payment: {course.publication_payment_status}</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
