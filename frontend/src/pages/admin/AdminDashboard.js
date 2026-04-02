import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { getAdminAnalytics, getAdminCourses, getAdminUsers } from "../../api";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    Promise.all([getAdminAnalytics(), getAdminUsers(), getAdminCourses()]).then(([a, u, c]) => {
      setAnalytics(a.data);
      setUsers(u.data);
      setCourses(c.data);
    });
  }, []);

  return (
    <DashboardLayout>
      <div className="page-content fade-in">
        <div className="page-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Platform health, moderation, and operational overview.</p>
          </div>
        </div>
        <div className="grid-4" style={{ marginBottom: "1.5rem" }}>
          {[
            { label: "Users", value: analytics?.total_users ?? 0 },
            { label: "Teachers", value: analytics?.total_teachers ?? 0 },
            { label: "Courses", value: analytics?.total_courses ?? 0 },
            { label: "Revenue", value: `Rs ${analytics?.total_revenue ?? 0}` },
          ].map((item) => (
            <div key={item.label} className="stat-card"><div><div className="stat-value">{item.value}</div><div className="stat-label">{item.label}</div></div></div>
          ))}
        </div>
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><span className="card-title">Recent Users</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {users.slice(0, 5).map((user) => (
                <div key={user.id} style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                  <div><div style={{ fontWeight: 700 }}>{user.name}</div><div className="text-muted text-sm">{user.email}</div></div>
                  <span className={`badge ${user.is_active ? "badge-success" : "badge-danger"}`}>{user.role}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Course Catalog</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {courses.slice(0, 5).map((course) => (
                <div key={course.id} style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                  <div><div style={{ fontWeight: 700 }}>{course.title}</div><div className="text-muted text-sm">{course.teacher_name}</div></div>
                  <span className={`badge ${course.is_published ? "badge-success" : "badge-warning"}`}>{course.is_published ? "Published" : "Draft"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
