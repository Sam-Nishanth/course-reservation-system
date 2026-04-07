import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import {
  checkEnrollment,
  clearCourseChat,
  getCourse,
  getCourseChat,
  sendCourseChat,
} from "../../api";
import toast from "react-hot-toast";

export default function CourseDetailWorkflow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const token = localStorage.getItem("token");
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [enrollmentState, setEnrollmentState] = useState({ enrolled: false, payment_status: null, enrollment_id: null });

  useEffect(() => {
    const requests = [getCourse(id)];
    if (token) {
      requests.push(checkEnrollment(id));
    }

    Promise.all(requests)
      .then(([courseRes, enrollmentRes]) => {
        setCourse(courseRes.data);
        if (enrollmentRes) {
          setEnrollmentState(enrollmentRes.data);
        }
      })
      .finally(() => setLoading(false));
  }, [id, token]);

  useEffect(() => {
    if (!enrollmentState.enrolled) {
      return;
    }
    setChatLoading(true);
    getCourseChat(id)
      .then((res) => setChatMessages(res.data))
      .catch((error) => setChatError(error.response?.data?.error || "Unable to load course chat"))
      .finally(() => setChatLoading(false));
  }, [id, enrollmentState.enrolled]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  async function handleSend() {
    if (!chatInput.trim()) {
      return;
    }
    setSending(true);
    setChatError("");
    try {
      const res = await sendCourseChat(id, chatInput);
      setChatMessages((current) => [
        ...current,
        { role: "user", content: chatInput, timestamp: new Date().toISOString(), id: `temp-${Date.now()}` },
        res.data.message,
      ]);
      setChatInput("");
    } catch (error) {
      const message = error.response?.data?.error || "Tutor chat is unavailable right now";
      setChatError(message);
      toast.error(message);
    } finally {
      setSending(false);
    }
  }

  async function handleClearChat() {
    try {
      await clearCourseChat(id);
      setChatMessages([]);
      toast.success("Course chat cleared");
    } catch (error) {
      toast.error(error.response?.data?.error || "Could not clear chat");
    }
  }

  if (loading) {
    return <DashboardLayout><div className="page-content"><p className="text-muted">Loading course...</p></div></DashboardLayout>;
  }

  if (!course) {
    return <DashboardLayout><div className="page-content"><p>Course not found.</p></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="page-content fade-in">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/student/courses")} style={{ marginBottom: "1rem" }}>
          Back to Courses
        </button>

        <div className="grid-2" style={{ alignItems: "start" }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: "0.75rem" }}>{course.category}</span>
            <h1 style={{ marginBottom: "0.5rem" }}>{course.title}</h1>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>{course.detailed_description || course.short_description}</p>

            <div className="grid-2" style={{ marginTop: "1.5rem" }}>
              <div className="card">
                <h3>Course Details</h3>
                <div className="text-muted text-sm">Fee: Rs {course.price.toLocaleString()}</div>
                <div className="text-muted text-sm">Duration: {course.duration || `${course.duration_weeks} weeks` || "Not specified"}</div>
                <div className="text-muted text-sm">Schedule: {course.schedule || "Not specified"}</div>
                <div className="text-muted text-sm">Teacher: {course.teacher_name}</div>
              </div>
              <div className="card">
                <h3>Resources</h3>
                <div className="text-muted text-sm">{course.resources || "Resources will be shared inside the course modules."}</div>
                {course.video_links && <div className="text-muted text-sm" style={{ marginTop: "0.5rem" }}>{course.video_links}</div>}
              </div>
            </div>

            <div className="card" style={{ marginTop: "1.5rem" }}>
              <h3>Weekly Schedule</h3>
              {course.schedule ? (
                <p style={{ whiteSpace: "pre-wrap", color: "var(--text-secondary)" }}>{course.schedule}</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {(course.modules || []).map((module) => (
                    <div key={module.id} className="card" style={{ padding: "0.85rem" }}>
                      <strong>Week {module.week_number}:</strong> {module.title}
                      <div className="text-muted text-sm" style={{ marginTop: "0.35rem" }}>{module.notes}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {enrollmentState.enrolled && (
              <div className="card" style={{ marginTop: "1.5rem" }}>
                <div className="card-header">
                  <span className="card-title">AI Tutor for This Course</span>
                  <button className="btn btn-ghost btn-sm" onClick={handleClearChat}>Clear Chat</button>
                </div>

                {chatLoading ? <p className="text-muted">Loading previous messages...</p> : null}
                {chatError ? <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{chatError}</div> : null}

                <div style={{ maxHeight: 360, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
                  {!chatMessages.length && !chatLoading ? (
                    <div className="card" style={{ padding: "1rem", background: "var(--surface-2)" }}>
                      Ask anything related to this course. The tutor will stay within the current course scope.
                    </div>
                  ) : null}
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      style={{
                        alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                        maxWidth: "85%",
                        background: message.role === "user" ? "var(--primary)" : "var(--surface-2)",
                        color: message.role === "user" ? "#fff" : "var(--text-primary)",
                        padding: "0.85rem 1rem",
                        borderRadius: "14px",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {message.content}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <textarea
                    className="form-textarea"
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    placeholder="Ask a doubt about this course..."
                    style={{ minHeight: 80 }}
                  />
                  <button className="btn btn-primary" disabled={sending} onClick={handleSend}>
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="card" style={{ position: "sticky", top: "calc(var(--navbar-height) + 1.5rem)" }}>
            {course.thumbnail_url && <img src={course.thumbnail_url} alt={course.title} style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: "var(--radius)", marginBottom: "1rem" }} />}
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)", marginBottom: "1rem" }}>Rs {course.price.toLocaleString()}</div>

            {enrollmentState.enrolled ? (
              <>
                <div className="alert alert-success" style={{ marginBottom: "1rem" }}>You are enrolled in this course.</div>
                <button className="btn btn-primary w-full" style={{ justifyContent: "center" }} onClick={() => navigate(`/student/learn/${enrollmentState.enrollment_id}`)}>
                  Continue Learning
                </button>
              </>
            ) : (
              <>
                {enrollmentState.payment_status === "created" ? <div className="alert alert-error" style={{ marginBottom: "1rem" }}>Payment pending. Complete checkout to confirm enrollment.</div> : null}
                <button className="btn btn-primary w-full" style={{ justifyContent: "center" }} onClick={() => navigate(`/student/courses/${id}/pay`)}>
                  Pay & Enroll
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
