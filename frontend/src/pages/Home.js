import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate(`/${user.role}/dashboard`);
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "Sora, sans-serif" }}>
      {/* Navbar */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1rem 2rem",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <span style={{ fontSize: "1.5rem" }}>🎓</span>
          <span style={{ fontWeight: 800, fontSize: "1.25rem" }}>CourseHub</span>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to="/login" className="btn btn-ghost">Login</Link>
          <Link to="/register/student" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        textAlign: "center",
        padding: "5rem 1.5rem 4rem",
        background: "linear-gradient(135deg, #F8F7FF 0%, #EEE9FF 100%)",
      }}>
        <div style={{
          display: "inline-block",
          background: "var(--primary-light)",
          color: "var(--primary)",
          borderRadius: "100px",
          padding: "0.375rem 1rem",
          fontSize: "0.8rem",
          fontWeight: 700,
          marginBottom: "1.5rem",
          letterSpacing: "0.05em",
        }}>
          🚀 Online Learning Platform
        </div>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, marginBottom: "1.25rem", lineHeight: 1.15 }}>
          Learn Skills That<br />
          <span style={{ color: "var(--primary)" }}>Shape Your Future</span>
        </h1>
        <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", maxWidth: 540, margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
          Join thousands of students learning from expert teachers.
          Courses in technology, marketing, design and more.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/register/student" className="btn btn-primary btn-lg">
            Start Learning Free
          </Link>
          <Link to="/register/teacher" className="btn btn-ghost btn-lg">
            Become a Teacher
          </Link>
        </div>

        {/* Stats */}
        <div style={{
          display: "flex", gap: "3rem", justifyContent: "center",
          marginTop: "4rem", flexWrap: "wrap",
        }}>
          {[
            { value: "10,000+", label: "Students" },
            { value: "500+",    label: "Courses" },
            { value: "200+",    label: "Teachers" },
            { value: "95%",     label: "Satisfaction" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)" }}>{s.value}</div>
              <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "4rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", marginBottom: "2.5rem" }}>Why Choose CourseHub?</h2>
        <div className="grid-3">
          {[
            { icon: "🎯", title: "Expert Teachers",      desc: "Learn from qualified professionals with real-world experience." },
            { icon: "📱", title: "Learn Anywhere",       desc: "Access courses on any device, at your own pace." },
            { icon: "📜", title: "Certificate Ready",    desc: "Earn certificates upon completing courses." },
            { icon: "💬", title: "Live Support",         desc: "Get help from teachers and community forums." },
            { icon: "💰", title: "Affordable Pricing",   desc: "Quality education at prices that work for everyone." },
            { icon: "🔄", title: "Progress Tracking",    desc: "Track your learning progress with detailed analytics." },
          ].map((f) => (
            <div key={f.title} className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{f.icon}</div>
              <h4 style={{ marginBottom: "0.5rem" }}>{f.title}</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: "var(--primary)",
        color: "white",
        textAlign: "center",
        padding: "4rem 1.5rem",
      }}>
        <h2 style={{ marginBottom: "1rem", color: "white" }}>Ready to Start Learning?</h2>
        <p style={{ opacity: 0.85, marginBottom: "2rem", maxWidth: 400, margin: "0 auto 2rem" }}>
          Join CourseHub today and unlock access to hundreds of courses.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/register/student" style={{
            background: "white", color: "var(--primary)",
            padding: "0.875rem 2rem", borderRadius: "12px",
            fontWeight: 700, textDecoration: "none", fontSize: "1rem",
          }}>
            Register as Student
          </Link>
          <Link to="/register/teacher" style={{
            background: "transparent", color: "white",
            border: "2px solid white",
            padding: "0.875rem 2rem", borderRadius: "12px",
            fontWeight: 700, textDecoration: "none", fontSize: "1rem",
          }}>
            Register as Teacher
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: "center",
        padding: "1.5rem",
        color: "var(--text-muted)",
        fontSize: "0.875rem",
        borderTop: "1px solid var(--border)",
      }}>
        © 2024 CourseHub. Built with React & Flask.
      </footer>
    </div>
  );
}