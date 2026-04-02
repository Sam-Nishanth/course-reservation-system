import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { updateProfile, changePassword } from "../../api";
import toast from "react-hot-toast";

export default function StudentSettings() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || "",
    learning_preferences: user?.learning_preferences || "",
    notifications_enabled: user?.notifications_enabled ?? true,
  });
  const [passwords, setPasswords] = useState({ old_password: "", new_password: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  async function handleProfileSave(e) {
    e.preventDefault();
    if (!profile.name.trim()) { toast.error("Name cannot be empty"); return; }
    setSaving(true);
    try {
      const res = await updateProfile(profile);
      setUser(res.data.user);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (passwords.new_password.length < 6) { toast.error("New password must be at least 6 characters"); return; }
    if (passwords.new_password !== passwords.confirm) { toast.error("Passwords do not match"); return; }
    setChangingPw(true);
    try {
      await changePassword({ old_password: passwords.old_password, new_password: passwords.new_password });
      toast.success("Password changed successfully!");
      setPasswords({ old_password: "", new_password: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Password change failed");
    } finally {
      setChangingPw(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="page-content fade-in" style={{ maxWidth: 720 }}>
        <div className="page-header">
          <div><h1>Settings</h1><p>Manage your account preferences</p></div>
        </div>

        {/* Profile card */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "1.5rem" }}>👤 Profile Information</h3>
          <form onSubmit={handleProfileSave}>
            {/* Avatar placeholder */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.5rem" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "var(--primary)", color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.75rem", fontWeight: 700,
              }}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{user?.name}</div>
                <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{user?.email}</div>
                <span className="badge badge-primary" style={{ marginTop: "0.35rem" }}>Student</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
              <div className="form-hint">Email cannot be changed</div>
            </div>
            <div className="form-group">
              <label className="form-label">Learning Preferences</label>
              <textarea className="form-textarea" placeholder="e.g. Videos, morning learner, prefer short modules..."
                value={profile.learning_preferences}
                onChange={(e) => setProfile((p) => ({ ...p, learning_preferences: e.target.value }))} />
            </div>
            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "0.625rem", cursor: "pointer" }}>
                <input type="checkbox" checked={profile.notifications_enabled}
                  onChange={(e) => setProfile((p) => ({ ...p, notifications_enabled: e.target.checked }))} />
                <span className="form-label" style={{ margin: 0 }}>Enable notifications</span>
              </label>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Password card */}
        <div className="card">
          <h3 style={{ marginBottom: "1.5rem" }}>🔒 Change Password</h3>
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input className="form-input" type="password" value={passwords.old_password}
                onChange={(e) => setPasswords((p) => ({ ...p, old_password: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" value={passwords.new_password}
                onChange={(e) => setPasswords((p) => ({ ...p, new_password: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input className="form-input" type="password" value={passwords.confirm}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={changingPw}>
              {changingPw ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}