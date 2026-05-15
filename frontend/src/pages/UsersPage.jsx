import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import toast from "react-hot-toast";
import { UserPlus, Edit2, Trash2, Check, X } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role_id: 4 });

  const load = () => {
    Promise.all([api.get("/api/users/"), api.get("/api/roles/")])
      .then(([u, r]) => { setUsers(u.data); setRoles(r.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openEdit = (u) => { setEditUser(u); setForm({ name: u.name, email: u.email, role_id: u.role.id }); setShowModal(true); };
  const openNew = () => { setEditUser(null); setForm({ name: "", email: "", password: "", role_id: 4 }); setShowModal(true); };

  const handleSave = async () => {
    try {
      if (editUser) {
        await api.patch(`/api/users/${editUser.id}`, { name: form.name, email: form.email, role_id: Number(form.role_id) });
        toast.success("User updated");
      } else {
        await api.post("/api/auth/register", { ...form, role_id: Number(form.role_id) });
        toast.success("User created");
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error");
    }
  };

  const toggleActive = async (u) => {
    try {
      await api.patch(`/api/users/${u.id}`, { is_active: !u.is_active });
      toast.success(`User ${u.is_active ? "deactivated" : "activated"}`);
      load();
    } catch { toast.error("Error"); }
  };

  const deleteUser = async (u) => {
    if (!confirm(`Delete ${u.name}?`)) return;
    try {
      await api.delete(`/api/users/${u.id}`);
      toast.success("User deleted");
      load();
    } catch (err) { toast.error(err.response?.data?.detail || "Error"); }
  };

  const ROLE_COLORS = { Admin: "#6C63FF", Supervisor: "#F97316", "Support Agent": "#38BDF8", Customer: "#43E97B" };

  return (
    <Layout title="User Management" subtitle={`${users.length} total users`}
      actions={<button className="btn btn-primary" onClick={openNew}><UserPlus size={16} /> Add User</button>}>

      {loading ? <div className="loading"><div className="spinner" /></div> : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex-center gap-8">
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${ROLE_COLORS[u.role.name]}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: ROLE_COLORS[u.role.name] }}>
                          {u.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-sm">{u.name}</span>
                      </div>
                    </td>
                    <td className="text-sm text-muted">{u.email}</td>
                    <td>
                      <span className="badge" style={{ background: `${ROLE_COLORS[u.role.name]}18`, color: ROLE_COLORS[u.role.name] }}>{u.role.name}</span>
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? "badge-resolved" : "badge-closed"}`}>{u.is_active ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="text-sm text-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-8">
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(u)}><Edit2 size={13} /></button>
                        <button className="btn btn-sm btn-icon" style={{ background: u.is_active ? "#FFF1F2" : "#F0FDF4", color: u.is_active ? "#BE123C" : "#15803D" }} onClick={() => toggleActive(u)}>
                          {u.is_active ? <X size={13} /> : <Check size={13} />}
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => deleteUser(u)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editUser ? "Edit User" : "New User"}</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            {!editUser && (
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role_id} onChange={e => setForm(f => ({ ...f, role_id: e.target.value }))}>
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
