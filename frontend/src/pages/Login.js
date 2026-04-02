import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login } from "../api";
import toast from "react-hot-toast";

export default function Login() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate(`/${res.data.user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(email, password) {
    setForm({ email, password });
    setError("");
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      background: "linear-gradient(135deg, #F8F7FF 0%, #EEE9FF 100%)",
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "2rem",
      }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
            <span style={{ fontSize: "1.5rem" }}>🎓</span>
            <span style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--text-primary)" }}>CourseHub</span>
          </Link>

          <div className="card" style={{ padding: "2rem" }}>
            <h2 style={{ marginBottom: "0.25rem" }}>Welcome back</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.75rem" }}>
              Sign in to your account to continue
            </p>

            {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>⚠️ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input
                  className="form-input"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full"
                style={{ marginTop: "0.5rem", justifyContent: "center", padding: "0.75rem" }}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              Don't have an account?{" "}
              <Link to="/register/student" style={{ color: "var(--primary)", fontWeight: 600 }}>
                Register here
              </Link>
            </div>
          </div>

          {/* Demo credentials */}
          <div className="card" style={{ marginTop: "1rem", padding: "1.25rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Demo Accounts (click to fill)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { label: "👑 Admin",   email: "admin@coursehub.com",  pass: "admin123" },
                { label: "🎓 Teacher", email: "priya@teacher.com",    pass: "teacher123" },
                { label: "📚 Student", email: "rahul@student.com",    pass: "student123" },
              ].map((d) => (
                <button
                  key={d.email}
                  onClick={() => fillDemo(d.email, d.pass)}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "0.5rem 0.75rem", borderRadius: "8px",
                    border: "1px solid var(--border)", background: "var(--surface-2)",
                    cursor: "pointer", fontFamily: "inherit", fontSize: "0.8rem",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  <span style={{ fontWeight: 600 }}>{d.label}</span>
                  <span style={{ color: "var(--text-muted)" }}>{d.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right decorative panel — hidden on small screens */}
      <div style={{
        flex: 1,
        background: "var(--primary)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: "2rem", padding: "3rem",
        color: "white",
      }} className="hide-mobile">
        <div style={{ fontSize: "4rem" }}>🎓</div>
        <h2 style={{ color: "white", textAlign: "center", fontSize: "2rem" }}>
          Start your learning journey today
        </h2>
        <p style={{ opacity: 0.8, textAlign: "center", lineHeight: 1.7 }}>
          Access hundreds of courses from expert teachers. Track your progress and earn certificates.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: 300 }}>
          {["✅ 500+ expert-led courses", "✅ Self-paced learning", "✅ Progress tracking", "✅ Mock certificates"].map((f) => (
            <div key={f} style={{ fontSize: "0.9rem", opacity: 0.9 }}>{f}</div>
          ))}
        </div>
      </div>
    </div>
  );
}