import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";

// Public pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import RegisterStudent from "./pages/RegisterStudent";
import RegisterTeacher from "./pages/RegisterTeacher";

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import MyCourses from "./pages/student/MyCourses";
import ViewCourses from "./pages/student/ViewCourses";
import CourseDetail from "./pages/student/CourseDetailWorkflow";
import LearningPage from "./pages/student/LearningPage";
import PaymentPage from "./pages/student/PaymentPageWorkflow";
import StudentSettings from "./pages/student/StudentSettings";

// Teacher pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import ManageCourses from "./pages/teacher/ManageCoursesWorkflow";
import AddCourse from "./pages/teacher/AddCourseWorkflow";
import EditCourse from "./pages/teacher/EditCourseWorkflow";
import TeacherCourseDetail from "./pages/teacher/TeacherCourseDetailWorkflow";
import SeeStudents from "./pages/teacher/SeeStudents";
import StudentProgress from "./pages/teacher/StudentProgress";
import TeacherSettings from "./pages/teacher/TeacherSettings";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import AdminCourses from "./pages/admin/AdminCoursesReview";
import Analytics from "./pages/admin/Analytics";

// Shared
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingScreen from "./components/LoadingScreen";

export default function App() {
  const { loading } = useAuth();
  if (loading) return <LoadingScreen />;

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/student" element={<RegisterStudent />} />
        <Route path="/register/teacher" element={<RegisterTeacher />} />

        {/* Student */}
        <Route path="/student" element={<ProtectedRoute role="student" />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="courses" element={<ViewCourses />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route path="courses/:id/pay" element={<PaymentPage />} />
          <Route path="learn/:enrollmentId" element={<LearningPage />} />
          <Route path="settings" element={<StudentSettings />} />
        </Route>

        {/* Teacher */}
        <Route path="/teacher" element={<ProtectedRoute role="teacher" />}>
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="courses" element={<ManageCourses />} />
          <Route path="courses/add" element={<AddCourse />} />
          <Route path="courses/:id" element={<TeacherCourseDetail />} />
          <Route path="courses/:id/edit" element={<EditCourse />} />
          <Route path="students" element={<SeeStudents />} />
          <Route path="students/:enrollmentId" element={<StudentProgress />} />
          <Route path="settings" element={<TeacherSettings />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute role="admin" />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
