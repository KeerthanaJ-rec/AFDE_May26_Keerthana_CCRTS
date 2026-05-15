import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { StatusBadge, PriorityBadge } from "../components/StatusBadge";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { ArrowLeft, User, Calendar, Tag, Clock, MessageSquare, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";

const STATUSES = ["Open", "Assigned", "In Progress", "Pending Customer Response", "Escalated", "Resolved", "Closed"];

function FeedbackForm({ complaintId, onDone }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!rating) { toast.error("Please select a rating"); return; }
    setLoading(true);
    try {
      await api.post("/api/feedback/", { complaint_id: complaintId, rating, comments });
      toast.success("Feedback submitted!");
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "linear-gradient(135deg, #F8F7FF, #FFF0F3)", borderRadius: 12, padding: 20 }}>
      <h4 style={{ fontWeight: 700, marginBottom: 12 }}>Rate Your Experience</h4>
      <div className="stars" style={{ marginBottom: 14 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <span key={n} className={`star ${n <= (hovered || rating) ? "filled" : "empty"}`}
            onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(n)}>★</span>
        ))}
        {rating > 0 && <span className="text-sm text-muted" style={{ marginLeft: 8 }}>{["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}</span>}
      </div>
      <textarea className="form-textarea" placeholder="Share your experience..." value={comments}
        onChange={e => setComments(e.target.value)} style={{ minHeight: 80 }} />
      <button className="btn btn-primary btn-sm mt-8" onClick={submit} disabled={loading}>
        {loading ? "Submitting..." : "Submit Feedback"}
      </button>
    </div>
  );
}

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateForm, setUpdateForm] = useState({ status: "", agent_id: "", notes: "", resolution_notes: "" });
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/complaints/${id}`);
      setComplaint(res.data);
      setUpdateForm({ status: res.data.status, agent_id: res.data.agent?.id || "", notes: "", resolution_notes: res.data.resolution_notes || "" });
    } catch {
      toast.error("Complaint not found");
      navigate("/complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (["Admin", "Supervisor"].includes(user?.role?.name)) {
      api.get("/api/users/agents").then(r => setAgents(r.data));
    }
  }, [id]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const payload = {};
      if (updateForm.status !== complaint.status) payload.status = updateForm.status;
      if (updateForm.agent_id && Number(updateForm.agent_id) !== complaint.agent?.id) payload.agent_id = Number(updateForm.agent_id);
      if (updateForm.notes) payload.notes = updateForm.notes;
      if (updateForm.resolution_notes !== complaint.resolution_notes) payload.resolution_notes = updateForm.resolution_notes;
      await api.patch(`/api/complaints/${id}`, payload);
      toast.success("Complaint updated!");
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Layout title="Complaint Detail"><div className="loading"><div className="spinner" /> Loading...</div></Layout>;
  if (!complaint) return null;

  const isAdmin = ["Admin", "Supervisor"].includes(user?.role?.name);
  const isAgent = user?.role?.name === "Support Agent";
  const isCustomer = user?.role?.name === "Customer";
  const canUpdate = isAdmin || isAgent;
  const canRate = isCustomer && ["Resolved", "Closed"].includes(complaint.status) && !complaint.feedback;

  const slaLeft = complaint.sla_deadline ? Math.floor((new Date(complaint.sla_deadline) - new Date()) / 36e5) : null;

  return (
    <Layout
      title="Complaint Detail"
      actions={<button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</button>}
    >
      <div className="detail-header">
        <div className="detail-id">{complaint.complaint_number}</div>
        <div className="detail-title">{complaint.title}</div>
        <div className="detail-meta">
          <span><User size={13} style={{ display: "inline", marginRight: 4 }} />{complaint.customer.name}</span>
          <span><Calendar size={13} style={{ display: "inline", marginRight: 4 }} />{new Date(complaint.created_at).toLocaleString()}</span>
          <span><Tag size={13} style={{ display: "inline", marginRight: 4 }} />{complaint.category.name}</span>
          {slaLeft !== null && (
            <span><Clock size={13} style={{ display: "inline", marginRight: 4 }} />
              {slaLeft < 0 ? "SLA Breached" : `${slaLeft}h SLA remaining`}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
          {complaint.is_escalated && <span className="badge escalated-badge">🔥 Escalated</span>}
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 16 }}>Description</div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "#374151" }}>{complaint.description}</p>
          </div>

          {complaint.resolution_notes && (
            <div className="card" style={{ marginBottom: 20, background: "linear-gradient(135deg, #F0FDF4, #ECFDF5)" }}>
              <div className="flex-center gap-8 mb-8">
                <CheckCircle size={16} color="#15803D" />
                <span className="card-title" style={{ color: "#15803D" }}>Resolution Notes</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7 }}>{complaint.resolution_notes}</p>
            </div>
          )}

          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 16 }}>Complaint History</div>
            {complaint.history.length === 0 ? (
              <p className="text-sm text-muted">No history yet</p>
            ) : (
              <div className="timeline">
                {[...complaint.history].reverse().map(h => (
                  <div key={h.id} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-time">{new Date(h.updated_at).toLocaleString()} · {h.updated_by_user.name}</div>
                    <div className="timeline-text">
                      {h.old_status ? `${h.old_status} → ${h.new_status}` : `Status set to ${h.new_status}`}
                      {h.notes && <div style={{ marginTop: 4, color: "#6B7280", fontSize: 12 }}>{h.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {canRate && <FeedbackForm complaintId={complaint.id} onDone={load} />}

          {complaint.feedback && (
            <div className="card" style={{ background: "linear-gradient(135deg, #FFFBEB, #FFF7ED)" }}>
              <div className="card-title" style={{ marginBottom: 12 }}>Customer Feedback</div>
              <div className="stars">
                {[1, 2, 3, 4, 5].map(n => (
                  <span key={n} className={`star ${n <= complaint.feedback.rating ? "filled" : "empty"}`} style={{ cursor: "default" }}>★</span>
                ))}
                <span className="text-sm text-muted" style={{ marginLeft: 8 }}>({complaint.feedback.rating}/5)</span>
              </div>
              {complaint.feedback.comments && <p className="text-sm mt-8">{complaint.feedback.comments}</p>}
            </div>
          )}
        </div>

        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 16 }}>Complaint Info</div>
            {[
              { label: "Customer", value: complaint.customer.name },
              { label: "Assigned Agent", value: complaint.agent?.name || "Unassigned" },
              { label: "Category", value: complaint.category.name },
              { label: "Priority", value: complaint.priority },
              { label: "Status", value: complaint.status },
              { label: "Created", value: new Date(complaint.created_at).toLocaleString() },
              { label: "Last Updated", value: new Date(complaint.updated_at).toLocaleString() },
              ...(complaint.resolved_at ? [{ label: "Resolved At", value: new Date(complaint.resolved_at).toLocaleString() }] : []),
              { label: "SLA Deadline", value: complaint.sla_deadline ? new Date(complaint.sla_deadline).toLocaleString() : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="info-row">
                <span className="info-label">{label}</span>
                <span className="text-sm">{value}</span>
              </div>
            ))}
          </div>

          {canUpdate && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Update Complaint</div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={updateForm.status} onChange={e => setUpdateForm(f => ({ ...f, status: e.target.value }))}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              {isAdmin && agents.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Assign Agent</label>
                  <select className="form-select" value={updateForm.agent_id} onChange={e => setUpdateForm(f => ({ ...f, agent_id: e.target.value }))}>
                    <option value="">Unassigned</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              )}

              {["Resolved", "Closed"].includes(updateForm.status) && (
                <div className="form-group">
                  <label className="form-label">Resolution Notes</label>
                  <textarea className="form-textarea" value={updateForm.resolution_notes}
                    onChange={e => setUpdateForm(f => ({ ...f, resolution_notes: e.target.value }))}
                    placeholder="Describe how the issue was resolved..." style={{ minHeight: 80 }} />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Update Notes</label>
                <input className="form-input" value={updateForm.notes}
                  onChange={e => setUpdateForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Add a note about this update..." />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-primary" onClick={handleUpdate} disabled={updating}>
                  <RefreshCw size={15} /> {updating ? "Updating..." : "Update"}
                </button>
                {isAdmin && !complaint.is_escalated && (
                  <button className="btn btn-warning btn-sm" onClick={() => {
                    setUpdateForm(f => ({ ...f, status: "Escalated" }));
                    toast("Status set to Escalated. Click Update to save.", { icon: "⚠️" });
                  }}>
                    <AlertTriangle size={14} /> Escalate
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
