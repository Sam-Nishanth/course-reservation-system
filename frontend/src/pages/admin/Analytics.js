import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { getAdminAnalytics } from "../../api";

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    getAdminAnalytics().then((res) => setAnalytics(res.data));
  }, []);

  return (
    <DashboardLayout>
      <div className="page-content fade-in">
        <div className="page-header"><div><h1>Analytics</h1><p>Key numbers for the current demo dataset.</p></div></div>
        <div className="grid-2">
          {[
            ["Total Users", analytics?.total_users ?? 0],
            ["Total Teachers", analytics?.total_teachers ?? 0],
            ["Total Students", analytics?.total_students ?? 0],
            ["Published Courses", analytics?.published_courses ?? 0],
            ["Paid Enrollments", analytics?.total_enrollments ?? 0],
            ["Revenue", `Rs ${analytics?.total_revenue ?? 0}`],
          ].map(([label, value]) => (
            <div key={label} className="card">
              <div className="text-muted text-sm">{label}</div>
              <div className="stat-value" style={{ marginTop: "0.5rem" }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
