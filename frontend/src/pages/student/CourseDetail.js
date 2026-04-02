import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { getCourse, checkEnrollment } from "../../api";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    Promise.all([getCourse(id), checkEnrollment(id)])
      .then(([cRes, eRes]) => {
        setCourse(cRes.data);
        setEnrolled(eRes.data.enrolled);
        setEnrollmentId(eRes.data.enrollment_id);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DashboardLayout><div className="page-content"><p className="text-muted">Loading course...</p></div></DashboardLayout>;
  if (!course) return <DashboardLayout><div className="page-content"><p>Course not found.</p></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="page-content fade-in">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/student/courses")} style={{ marginBottom: "1rem" }}>
          ← Back to Courses
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", alignItems: "start" }}>
          {/* Left: course info */}
          <div>
            <span className="badge badge-primary" style={{ marginBottom: "0.75rem" }}>{course.category}</span>
            <h1 style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{course.title}</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.7, marginBottom: "1rem" }}>
              {course.short_description}
            </p>
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>👨‍🏫 <strong>{course.teacher_name}</strong></span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>⏱ {course.duration || "Self-paced"}</span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>👥 {course.enrollment_count} students</span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>🪑 {course.total_seats} seats</span>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "0.25rem", borderBottom: "2px solid var(--border)", marginBottom: "1.5rem" }}>
              {["overview", "modules", "instructor"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "0.625rem 1rem", border: "none", background: "none",
                    fontFamily: "inherit", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer",
                    color: activeTab === tab ? "var(--primary)" : "var(--text-muted)",
                    borderBottom: activeTab === tab ? "2px solid var(--primary)" : "2px solid transparent",
                    marginBottom: "-2px", textTransform: "capitalize", transition: "all 0.15s",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div>
                <h3 style={{ marginBottom: "0.75rem" }}>About this course</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "1.5rem" }}>{course.detailed_description}</p>
                {course.learning_outcomes && (
                  <>
                    <h3 style={{ marginBottom: "0.75rem" }}>What you'll learn</h3>
                    <ul style={{ paddingLeft: "1.25rem", color: "var(--text-secondary)", lineHeight: 2 }}>
                      {course.learning_outcomes.split("\n").filter(Boolean).map((o, i) => <li key={i}>{o}</li>)}
                    </ul>
                  </>
                )}
                {course.prerequisites && (
                  <div style={{ marginTop: "1.5rem" }}>
                    <h3 style={{ marginBottom: "0.75rem" }}>Prerequisites</h3>
                    <p style={{ color: "var(--text-secondary)" }}>{course.prerequisites}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "modules" && (
              <div>
                <h3 style={{ marginBottom: "1rem" }}>Course Curriculum ({course.modules?.length || 0} modules)</h3>
                {(course.modules || []).map((m, i) => (
                  <div key={m.id} style={{
                    border: "1px solid var(--border)", borderRadius: "var(--radius)",
                    padding: "1rem", marginBottom: "0.75rem",
                    display: "flex", alignItems: "flex-start", gap: "1rem",
                  }}>
                    <div style={{
                      width: 36, height: 36, background: "var(--primary-light)",
                      borderRadius: "50%", display: "flex", alignItems: "center",
                      justifyContent: "center", fontWeight: 700, color: "var(--primary)",
                      fontSize: "0.875rem", flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>Week {m.week_number}: {m.title}</div>
                      {m.duration_minutes > 0 && (
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                          ⏱ {m.duration_minutes} minutes
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "instructor" && (
              <div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
                  <div style={{
                    width: 64, height: 64, background: "var(--primary)",
                    borderRadius: "50%", display: "flex", alignItems: "center",
                    justifyContent: "center", color: "white", fontSize: "1.5rem", fontWeight: 700,
                  }}>
                    {course.teacher_name?.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ margin: 0 }}>{course.teacher_name}</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>Course Instructor</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: sticky enrollment card */}
          <div style={{ position: "sticky", top: "calc(var(--navbar-height) + 1.5rem)" }}>
            <div className="card" style={{ padding: "1.5rem" }}>
              {course.thumbnail_url && (
                <img src={course.thumbnail_url} alt={course.title} style={{ width: "100%", borderRadius: "var(--radius)", marginBottom: "1rem", height: 160, objectFit: "cover" }} />
              )}
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)", marginBottom: "1rem" }}>
                {course.price === 0 ? "Free" : `₹${course.price.toLocaleString()}`}
              </div>

              {enrolled ? (
                <>
                  <div className="alert alert-success" style={{ marginBottom: "1rem" }}>✅ You are enrolled</div>
                  <button className="btn btn-primary w-full" style={{ justifyContent: "center" }} onClick={() => navigate(`/student/learn/${enrollmentId}`)}>
                    Continue Learning →
                  </button>
                </>
              ) : (
                <button className="btn btn-primary w-full" style={{ justifyContent: "center", padding: "0.875rem" }} onClick={() => navigate(`/student/courses/${id}/pay`)}>
                  Enroll Now
                </button>
              )}

              <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {[
                  `⏱ Duration: ${course.duration || "Self-paced"}`,
                  `📦 ${course.modules?.length || 0} modules`,
                  `👥 ${course.enrollment_count} students enrolled`,
                  `🪑 ${course.total_seats - course.enrollment_count} seats remaining`,
                ].map((line) => (
                  <div key={line} style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{line}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}