import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ────────────────────────────────────────────────────────────────────
export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);
export const getProfile = () => api.get("/auth/profile");
export const updateProfile = (data) => api.put("/auth/profile", data);
export const changePassword = (data) => api.put("/auth/change-password", data);

// ── Courses (Public) ─────────────────────────────────────────────────────────
export const getPublishedCourses = (params) => api.get("/courses/", { params });
export const getCourse = (id) => api.get(`/courses/${id}`);
export const getCategories = () => api.get("/courses/categories");

// ── Courses (Teacher) ────────────────────────────────────────────────────────
export const getMyCourses = () => api.get("/courses/my-courses");
export const createCourse = (data) => api.post("/courses/", data);
export const updateCourse = (id, data) => api.put(`/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);
export const togglePublish = (id) => api.patch(`/courses/${id}/publish`);

// ── Enrollments ──────────────────────────────────────────────────────────────
export const enroll = (data) => api.post("/enrollments/enroll", data);
export const getMyEnrollments = () => api.get("/enrollments/my-enrollments");
export const getTransactions = () => api.get("/enrollments/transactions");
export const checkEnrollment = (courseId) => api.get(`/enrollments/check/${courseId}`);

// ── Progress ─────────────────────────────────────────────────────────────────
export const getProgress = (enrollmentId) => api.get(`/progress/${enrollmentId}`);
export const toggleModule = (data) => api.post("/progress/toggle", data);

// ── Teacher ──────────────────────────────────────────────────────────────────
export const getTeacherStudents = () => api.get("/teacher/students");
export const updateRemarks = (enrollmentId, remarks) =>
  api.put(`/teacher/remarks/${enrollmentId}`, { remarks });
export const getTeacherStats = () => api.get("/teacher/stats");

// ── Admin ────────────────────────────────────────────────────────────────────
export const getAdminAnalytics = () => api.get("/admin/analytics");
export const getAdminUsers = (params) => api.get("/admin/users", { params });
export const toggleUserActive = (id) => api.patch(`/admin/users/${id}/toggle-active`);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const getAdminCourses = () => api.get("/admin/courses");
export const adminDeleteCourse = (id) => api.delete(`/admin/courses/${id}`);

export default api;