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
export const getCourseChat = (id) => api.get(`/courses/${id}/chat`);
export const sendCourseChat = (id, content) => api.post(`/courses/${id}/chat`, { content });
export const clearCourseChat = (id) => api.delete(`/courses/${id}/chat`);
export const createReservationOrder = (id) => api.post(`/courses/${id}/reserve/order`);
export const verifyReservationPayment = (id, payload) => api.post(`/courses/${id}/reserve/verify`, payload);

// ── Courses (Teacher) ────────────────────────────────────────────────────────
export const getMyCourses = () => api.get("/courses/my-courses");
export const createCourse = (data) => api.post("/courses/", data);
export const updateCourse = (id, data) => api.put(`/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);
export const submitCourseForReview = (id) => api.post(`/teacher/courses/${id}/submit-review`);
export const createPublicationOrder = (id) => api.post(`/teacher/courses/${id}/publication/order`);
export const verifyPublicationPayment = (id, payload) => api.post(`/teacher/courses/${id}/publication/verify`, payload);

// ── Enrollments ──────────────────────────────────────────────────────────────
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
export const getReviewCourses = (params) => api.get("/admin/courses/review", { params });
export const getReviewCourse = (id) => api.get(`/admin/courses/${id}/review`);
export const approveCourseReview = (id, payload) => api.post(`/admin/courses/${id}/approve`, payload);
export const rejectCourseReview = (id, payload) => api.post(`/admin/courses/${id}/reject`, payload);
export const requestCourseChanges = (id, payload) => api.post(`/admin/courses/${id}/request-changes`, payload);

export default api;
