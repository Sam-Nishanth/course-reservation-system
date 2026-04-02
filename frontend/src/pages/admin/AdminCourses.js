import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { adminDeleteCourse, getAdminCourses } from "../../api";
import toast from "react-hot-toast";

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    getAdminCourses().then((res) => setCourses(res.data));
  }, []);

  async function handleDelete(id) {
    await adminDeleteCourse(id);
    setCourses((current) => current.filter((course) => course.id !== id));
    toast.success("Course deleted");
  }

  return (
    <DashboardLayout>
      <div className="page-content fade-in">
        <div className="page-header"><div><h1>All Courses</h1><p>Administrative view of the full course catalog.</p></div></div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {courses.map((course) => (
            <div key={course.id} className="card" style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{course.title}</div>
                <div className="text-muted text-sm">{course.teacher_name} · {course.category}</div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                <span className={`badge ${course.is_published ? "badge-success" : "badge-warning"}`}>{course.is_published ? "Published" : "Draft"}</span>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(course.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
