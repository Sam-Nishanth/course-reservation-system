import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { createPublicationOrder, getMyCourses, submitCourseForReview, verifyPublicationPayment } from "../../api";
import toast from "react-hot-toast";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const STATUS_LABELS = {
  draft: "Draft",
  pending_review: "Pending Review",
  changes_requested: "Changes Requested",
  rejected: "Rejected",
  approved_pending_payment: "Approved - Payment Pending",
  published: "Published",
};

export default function ManageCoursesWorkflow() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    getMyCourses().then((res) => setCourses(res.data));
  }, []);

  async function handleSubmitReview(courseId) {
    try {
      const res = await submitCourseForReview(courseId);
      setCourses((current) => current.map((course) => (course.id === courseId ? res.data.course : course)));
      toast.success("Submitted for admin review");
    } catch (error) {
      toast.error(error.response?.data?.error || "Could not submit for review");
    }
  }

  async function handlePublicationPayment(course) {
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Unable to load Razorpay checkout");
      }
      const res = await createPublicationOrder(course.id);
      const { order, razorpay_key_id } = res.data;
      const razorpay = new window.Razorpay({
        key: razorpay_key_id,
        amount: order.amount,
        currency: order.currency,
        name: "CourseHub",
        description: `Publication fee for ${course.title}`,
        order_id: order.id,
        handler: async (response) => {
          const verifyRes = await verifyPublicationPayment(course.id, response);
          setCourses((current) => current.map((item) => (item.id === course.id ? verifyRes.data.course : item)));
          toast.success("Course published successfully");
        },
      });
      razorpay.open();
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || "Could not start payment");
    }
  }

  return (
    <DashboardLayout>
      <div className="page-content fade-in">
        <div className="page-header">
          <div>
            <h1>My Courses</h1>
            <p>Draft, submit, review, and publish your courses from one place.</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/teacher/courses/add")}>Create Draft</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {courses.map((course) => (
            <div key={course.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <h3 style={{ marginBottom: "0.35rem" }}>{course.title}</h3>
                  <div className="text-muted text-sm">{course.category} · Rs {course.price.toLocaleString()}</div>
                  <div style={{ marginTop: "0.5rem" }}>
                    <span className={`badge ${course.approval_status === "published" ? "badge-success" : "badge-warning"}`}>
                      {STATUS_LABELS[course.approval_status] || course.approval_status}
                    </span>
                  </div>
                  {course.review_notes ? <p className="text-muted text-sm" style={{ marginTop: "0.75rem" }}>Admin notes: {course.review_notes}</p> : null}
                </div>

                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/teacher/courses/${course.id}`)}>View</button>
                  {["draft", "changes_requested", "rejected"].includes(course.approval_status) ? (
                    <>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/teacher/courses/${course.id}/edit`)}>Edit</button>
                      <button className="btn btn-primary btn-sm" onClick={() => handleSubmitReview(course.id)}>Submit for Review</button>
                    </>
                  ) : null}
                  {course.approval_status === "approved_pending_payment" ? (
                    <button className="btn btn-primary btn-sm" onClick={() => handlePublicationPayment(course)}>
                      Pay Publication Fee (Rs {course.publication_fee.toLocaleString()})
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
