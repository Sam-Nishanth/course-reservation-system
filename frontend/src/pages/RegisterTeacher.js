import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { register } from "../api";
import toast from "react-hot-toast";

export default function RegisterTeacher() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", qualification: "", expertise: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email address";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await register({
        name: form.name, email: form.email,
        password: form.password, role: "teacher",
      });
      loginUser(res.data.token, res.data.user);
      toast.success("Teacher account created! Welcome 🎓");
      navigate("/teacher/dashboard");
    } catch (err) {
      setErrors({ api: err.response?.data?.error || "Registration failed" });
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "", api: "" }));
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: "1.5rem" }}>🎓</span>
          <span style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--text-primary)" }}>CourseHub</span>
        </Link>

        <div className="card" style={{ padding: "2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🏫</div>
            <h2>Become a Teacher</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Share your knowledge with thousands of students
            </p>
          </div>

          {errors.api && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>⚠️ {errors.api}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" name="name" placeholder="Dr. Jane Smith" value={form.name} onChange={handleChange} />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" name="password" placeholder="At least 6 characters" value={form.password} onChange={handleChange} />
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" name="confirm" placeholder="Repeat your password" value={form.confirm} onChange={handleChange} />
              {errors.confirm && <div className="form-error">{errors.confirm}</div>}
            </div>
            <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: "center", padding: "0.75rem", marginTop: "0.25rem", background: "#D97706" }} disabled={loading}>
              {loading ? "Creating account..." : "Create Teacher Account"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>Sign in</Link>
          </div>
          <div style={{ textAlign: "center", marginTop: "0.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Are you a student?{" "}
            <Link to="/register/student" style={{ color: "var(--primary)", fontWeight: 600 }}>Register as Student</Link>
          </div>
        </div>
      </div>
    </div>
  );
}