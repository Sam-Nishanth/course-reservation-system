import React from "react";
import { useNavigate } from "react-router-dom";

export default function CourseCard({ course, actionLabel, onAction, showProgress, progress }) {
  const navigate = useNavigate();

  const thumb = course.thumbnail_url;
  const price = course.price === 0
    ? <span className="course-price course-price-free">Free</span>
    : <span className="course-price">₹{course.price.toLocaleString()}</span>;

  return (
    <div className="course-card fade-in">
      <div className="course-thumb">
        {thumb
          ? <img src={thumb} alt={course.title} onError={(e) => { e.target.style.display = "none"; }} />
          : <span>🎓</span>}
      </div>

      <div className="course-card-body">
        <div className="course-card-category">{course.category}</div>
        <div className="course-card-title">{course.title}</div>
        <div className="course-card-teacher">by {course.teacher_name}</div>

        <div className="course-card-meta">
          <span>⏱ {course.duration || "Self-paced"}</span>
          <span>👥 {course.enrollment_count || 0} enrolled</span>
        </div>

        {showProgress && (
          <div style={{ marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.35rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Progress</span>
              <span style={{ fontWeight: 700, color: "var(--primary)" }}>{progress || 0}%</span>
            </div>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill" style={{ width: `${progress || 0}%` }} />
            </div>
          </div>
        )}

        <div className="course-card-footer">
          {price}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate(`/student/courses/${course.id}`)}
            >
              Details
            </button>
            {actionLabel && (
              <button
                className="btn btn-primary btn-sm"
                onClick={(e) => { e.stopPropagation(); onAction && onAction(course); }}
              >
                {actionLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}