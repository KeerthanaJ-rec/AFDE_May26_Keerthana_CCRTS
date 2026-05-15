import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Send, ArrowLeft } from "lucide-react";

const PRIORITY_COLORS = { Low: "#15803D", Medium: "#92400E", High: "#C2410C", Critical: "#BE123C" };
const SLA = { Low: "72 hours", Medium: "48 hours", High: "24 hours", Critical: "4 hours" };

export default function NewComplaintPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category_id: "", priority: "Medium" });

  useEffect(() => {
    api.get("/api/categories/").then(r => { setCategories(r.data); if (r.data.length) setForm(f => ({ ...f, category_id: r.data[0].id })); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/complaints/", { ...form, category_id: Number(form.category_id) });
      toast.success(`Complaint ${res.data.complaint_number} registered!`);
      navigate(`/complaints/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      title="Register New Complaint"
      subtitle="Fill in the details to submit your complaint"
      actions={<button className="btn btn-ghost" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Back</button>}
    >
      <div style={{ maxWidth: 700 }}>
        <div className="card">
          <div style={{ background: "linear-gradient(135deg, #6C63FF, #FF6584)", borderRadius: 12, padding: "20px 24px", marginBottom: 28, color: "#fff" }}>
            <h3 style={{ fontWeight: 700, marginBottom: 4 }}>New Complaint Registration</h3>
            <p style={{ fontSize: 13, opacity: 0.85 }}>Your complaint will be assigned a unique ID and SLA deadline based on priority.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Complaint Title *</label>
              <input className="form-input" placeholder="Brief summary of the issue" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required maxLength={200} />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} required>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority *</label>
                <select className="form-select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                  {["Low", "Medium", "High", "Critical"].map(p => <option key={p}>{p}</option>)}
                </select>
                {form.priority && (
                  <div className="text-xs mt-4" style={{ color: PRIORITY_COLORS[form.priority] }}>
                    SLA: {SLA[form.priority]} resolution time
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Description *</label>
              <textarea className="form-textarea" placeholder="Describe your issue in detail — include relevant dates, order numbers, or account information..." value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required style={{ minHeight: 140 }} />
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Send size={16} /> {loading ? "Submitting..." : "Submit Complaint"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
            </div>
          </form>
        </div>

        <div className="card mt-20" style={{ background: "linear-gradient(135deg, #F8F7FF, #FFF0F3)" }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>SLA Response Times</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {Object.entries(SLA).map(([priority, time]) => (
              <div key={priority} style={{ textAlign: "center", padding: "10px 8px", background: "#fff", borderRadius: 10, border: `2px solid ${PRIORITY_COLORS[priority]}22` }}>
                <div style={{ fontWeight: 700, color: PRIORITY_COLORS[priority], fontSize: 13 }}>{priority}</div>
                <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>{time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
