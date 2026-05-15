import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { ShieldCheck, Zap, BarChart2, Users } from "lucide-react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (email, password) => setForm({ email, password });

  return (
    <div className="auth-page">
      <div className="auth-left">
        <h1>Customer Complaint<br />&amp; Resolution<br /><span className="gradient-text">Tracking System</span></h1>
        <p>A unified platform to manage, track, and resolve customer complaints with efficiency and transparency.</p>

        <div className="auth-features">
          {[
            { icon: ShieldCheck, text: "Role-based secure access control" },
            { icon: Zap, text: "Real-time complaint tracking & SLA alerts" },
            { icon: BarChart2, text: "Analytics dashboard & performance reports" },
            { icon: Users, text: "Multi-team collaboration & escalation" },
          ].map(({ icon: Icon, text }) => (
            <div className="auth-feature" key={text}>
              <div className="auth-feature-icon"><Icon size={18} color="#6C63FF" /></div>
              {text}
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <h2>Welcome back</h2>
        <p className="auth-desc">Sign in to access your dashboard</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>

          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="divider" style={{ margin: "24px 0" }} />

        <p className="text-sm text-muted" style={{ marginBottom: 12 }}>
          Don't have an account? <Link to="/register" className="auth-link">Register here</Link>
        </p>

        <div style={{ background: "#F8F7FF", borderRadius: 12, padding: "14px 16px" }}>
          <p className="text-xs font-semibold" style={{ color: "#6C63FF", marginBottom: 8 }}>Quick Login (Demo)</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              { label: "Admin", email: "admin@ccrts.com", pass: "admin123" },
              { label: "Supervisor", email: "supervisor@ccrts.com", pass: "super123" },
              { label: "Support Agent", email: "alice@ccrts.com", pass: "agent123" },
              { label: "Customer", email: "customer@example.com", pass: "cust123" },
            ].map(({ label, email, pass }) => (
              <button key={label} className="btn btn-secondary btn-sm" onClick={() => quickFill(email, pass)}
                style={{ fontSize: 11, justifyContent: "center" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
