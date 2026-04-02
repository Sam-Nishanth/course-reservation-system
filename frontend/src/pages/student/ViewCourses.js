import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import CourseCard from "../../components/CourseCard";
import { getPublishedCourses, getCategories } from "../../api";

export default function ViewCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", category: "", sort: "latest" });

  function fetchCourses(f = filters) {
    setLoading(true);
    const params = {};
    if (f.search)   params.search   = f.search;
    if (f.category) params.category = f.category;
    if (f.sort)     params.sort     = f.sort;
    getPublishedCourses(params)
      .then((r) => setCourses(r.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchCourses();
    getCategories().then((r) => setCategories(r.data));
  }, []); // eslint-disable-line

  function handleFilter(key, val) {
    const next = { ...filters, [key]: val };
    setFilters(next);
    fetchCourses(next);
  }

  return (
    <DashboardLayout>
      <div className="page-content fade-in">
        <div className="page-header">
          <div>
            <h1>Browse Courses</h1>
            <p>{courses.length} course{courses.length !== 1 ? "s" : ""} available</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          display: "flex", gap: "0.75rem", marginBottom: "1.75rem",
          flexWrap: "wrap", alignItems: "center",
          background: "var(--surface)", padding: "1rem",
          borderRadius: "var(--radius-lg)", border: "1px solid var(--border)",
        }}>
          <input
            className="form-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="🔍 Search courses..."
            value={filters.search}
            onChange={(e) => handleFilter("search", e.target.value)}
          />
          <select
            className="form-select"
            style={{ width: 160 }}
            value={filters.category}
            onChange={(e) => handleFilter("category", e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            className="form-select"
            style={{ width: 160 }}
            value={filters.sort}
            onChange={(e) => handleFilter("sort", e.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

        {loading ? (
          <div className="empty-state"><div className="empty-state-icon">⏳</div><p>Loading courses...</p></div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No courses found</h3>
            <p>Try a different search or category filter</p>
          </div>
        ) : (
          <div className="grid-3">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                actionLabel="Enroll Now"
                onAction={(c) => navigate(`/student/courses/${c.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}