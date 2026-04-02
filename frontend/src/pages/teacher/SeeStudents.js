import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { getTeacherStudents } from "../../api";

export default function SeeStudents() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    getTeacherStudents().then((res) => setGroups(res.data));
  }, []);

  return (
    <DashboardLayout>
      <div className="page-content fade-in">
        <div className="page-header">
          <div>
            <h1>Students</h1>
            <p>Track enrollments and progress across your courses.</p>
          </div>
        </div>
        {!groups.length ? (
          <div className="empty-state card"><p>No student enrollments yet.</p></div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {groups.map((group) => (
              <div key={group.course_id} className="card">
                <div className="card-header">
                  <span className="card-title">{group.course_title}</span>
                  <span className="badge badge-primary">{group.enrollment_count} students</span>
                </div>
                {!group.students.length ? (
                  <p className="text-muted">No paid enrollments yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {group.students.map((student) => (
                      <div key={student.enrollment_id} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", flexWrap: "wrap", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{student.student_name}</div>
                          <div className="text-muted text-sm">{student.student_email}</div>
                        </div>
                        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                          <span className="badge badge-primary">{student.progress_percentage}% complete</span>
                          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/teacher/students/${student.enrollment_id}`)}>View Progress</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
