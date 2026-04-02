import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { deleteUser, getAdminUsers, toggleUserActive } from "../../api";
import toast from "react-hot-toast";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getAdminUsers().then((res) => setUsers(res.data));
  }, []);

  async function handleToggle(id) {
    const res = await toggleUserActive(id);
    setUsers((current) => current.map((user) => (user.id === id ? { ...user, is_active: res.data.is_active } : user)));
    toast.success(res.data.message);
  }

  async function handleDelete(id) {
    await deleteUser(id);
    setUsers((current) => current.filter((user) => user.id !== id));
    toast.success("User deleted");
  }

  return (
    <DashboardLayout>
      <div className="page-content fade-in">
        <div className="page-header"><div><h1>Manage Users</h1><p>Activate, deactivate, or remove teacher and student accounts.</p></div></div>
        <div className="card">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {users.map((user) => (
              <div key={user.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{user.name}</div>
                  <div className="text-muted text-sm">{user.email}</div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                  <span className={`badge ${user.is_active ? "badge-success" : "badge-danger"}`}>{user.role}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleToggle(user.id)}>{user.is_active ? "Deactivate" : "Activate"}</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
