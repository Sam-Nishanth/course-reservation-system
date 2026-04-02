import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { getMyCourses, getTeacherStats } from "../../api";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    Promise.all([getTeacherStats(), getMyCourses()]).then(([statsRes, coursesRes]) => {
      setStats(statsRes.data);
      setCourses(coursesRes.data);
    });
  }, []);

  return (
    <DashboardLayout>
      <div className="page-content fade-in">
        <div style={{ background: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)", color: "white", borderRadius: "var(--radius-xl)", padding: "2rem", marginBottom: "1.5rem" }}>
          <h1 style={{ color: "white", marginBottom: "0.5rem" }}>Teacher Dashboard</h1>
          <p style={{ opacity: 0.9, marginBottom: 0 }}>Manage courses, publishing, and student progress from one place.</p>
        </div>

        <div className="grid-4" style={{ marginBottom: "1.5rem" }}>
          {[
            { label: "Total Courses", value: stats?.total_courses ?? 0 },
            { label: "Published", value: stats?.published_courses ?? 0 },
            { label: "Students", value: stats?.total_students ?? 0 },
            { label: "Revenue", value: `Rs ${stats?.total_revenue ?? 0}` },
          ].map((item) => (
            <div key={item.label} className="stat-card">
              <div>
                <div className="stat-value">{item.value}</div>
                <div className="stat-label">{item.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Courses</span>
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/teacher/courses/add")}>Add Course</button>
          </div>
          {!courses.length ? (
            <div className="empty-state">
              <div className="empty-state-icon">Courses</div>
              <p>No courses created yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {courses.slice(0, 5).map((course) => (
                <div key={course.id} className="card" style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                    <div>
                      <h3 style={{ marginBottom: "0.25rem" }}>{course.title}</h3>
                      <div className="text-muted text-sm">{course.category} · {course.enrollment_count} students</div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <span className={`badge ${course.is_published ? "badge-success" : "badge-warning"}`}>{course.is_published ? "Published" : "Draft"}</span>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/teacher/courses/${course.id}`)}>Open</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
