import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role_id: 4 });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/roles/").then(r => setRoles(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/auth/register", { ...form, role_id: Number(form.role_id) });
      toast.success("Account created! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <h1>Join CCRTS<br /><span className="gradient-text">Platform</span></h1>
        <p>Create your account to start managing and tracking customer complaints effectively.</p>
        <div className="auth-features">
          {["Register and log complaints instantly", "Track resolution progress in real-time", "Rate your support experience", "Get notified on every update"].map(t => (
            <div className="auth-feature" key={t}>
              <div className="auth-feature-icon" style={{ fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>✦</div>
              {t}
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <h2>Create Account</h2>
        <p className="auth-desc">Fill in the details to get started</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="John Doe" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="john@example.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Min. 6 characters" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
          </div>
          <div className="form-group">
            <label className="form-label">Register As</label>
            <select className="form-select" value={form.role_id} onChange={e => setForm(f => ({ ...f, role_id: e.target.value }))}>
              {roles.filter(r => r.name !== "Admin").map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-muted mt-20">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
