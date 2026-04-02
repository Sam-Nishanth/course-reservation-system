import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { changePassword, updateProfile } from "../../api";
import toast from "react-hot-toast";

export default function TeacherSettings() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    qualification: user?.qualification || "",
    expertise: user?.expertise || "",
    profile_photo: user?.profile_photo || "",
    notifications_enabled: user?.notifications_enabled ?? true,
  });
  const [passwords, setPasswords] = useState({ old_password: "", new_password: "", confirm: "" });

  async function saveProfile(e) {
    e.preventDefault();
    const res = await updateProfile(profile);
    setUser(res.data.user);
    toast.success("Profile updated");
  }

  async function savePassword(e) {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    await changePassword({ old_password: passwords.old_password, new_password: passwords.new_password });
    setPasswords({ old_password: "", new_password: "", confirm: "" });
    toast.success("Password changed");
  }

  return (
    <DashboardLayout>
      <div className="page-content fade-in" style={{ maxWidth: 780 }}>
        <div className="card" style={{ marginBottom: "1rem" }}>
          <h2>Teacher Profile</h2>
          <form onSubmit={saveProfile}>
            <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Bio</label><textarea className="form-textarea" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} /></div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Qualification</label><input className="form-input" value={profile.qualification} onChange={(e) => setProfile({ ...profile, qualification: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Expertise</label><input className="form-input" value={profile.expertise} onChange={(e) => setProfile({ ...profile, expertise: e.target.value })} /></div>
            </div>
            <div className="form-group"><label className="form-label">Profile Photo URL</label><input className="form-input" value={profile.profile_photo} onChange={(e) => setProfile({ ...profile, profile_photo: e.target.value })} /></div>
            <button className="btn btn-primary" type="submit">Save Profile</button>
          </form>
        </div>
        <div className="card">
          <h2>Change Password</h2>
          <form onSubmit={savePassword}>
            <div className="form-group"><label className="form-label">Current Password</label><input className="form-input" type="password" value={passwords.old_password} onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })} /></div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" value={passwords.new_password} onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Confirm Password</label><input className="form-input" type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} /></div>
            </div>
            <button className="btn btn-primary" type="submit">Change Password</button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
