import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { getProgress, updateRemarks } from "../../api";
import toast from "react-hot-toast";

export default function StudentProgress() {
  const { enrollmentId } = useParams();
  const [progress, setProgress] = useState(null);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    getProgress(enrollmentId).then((res) => setProgress(res.data));
  }, [enrollmentId]);

  async function handleSave() {
    try {
      await updateRemarks(enrollmentId, remarks);
      toast.success("Remarks saved");
    } catch (error) {
      toast.error(error.response?.data?.error || "Could not save remarks");
    }
  }

  return (
    <DashboardLayout>
      <div className="page-content fade-in">
        <div className="page-header">
          <div>
            <h1>Student Progress</h1>
            <p>Detailed module completion for enrollment #{enrollmentId}</p>
          </div>
        </div>
        {!progress ? (
          <p className="text-muted">Loading progress...</p>
        ) : (
          <div className="grid-2">
            <div className="card">
              <h3>Completion</h3>
              <div className="progress-bar-wrap" style={{ margin: "1rem 0" }}>
                <div className="progress-bar-fill" style={{ width: `${progress.progress_percentage}%` }} />
              </div>
              <p className="text-muted">{progress.completed_modules} of {progress.total_modules} modules complete</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
                {progress.records.map((record) => (
                  <div key={record.id} className="card" style={{ padding: "0.85rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                      <span>{record.module_title}</span>
                      <span className={`badge ${record.is_completed ? "badge-success" : "badge-warning"}`}>
                        {record.is_completed ? "Completed" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3>Teacher Remarks</h3>
              <textarea className="form-textarea" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add coaching notes, feedback, or reminders." />
              <button className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={handleSave}>Save Remarks</button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
