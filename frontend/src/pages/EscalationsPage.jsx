import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { StatusBadge, PriorityBadge } from "../components/StatusBadge";
import api from "../api/axios";
import { AlertTriangle, Eye } from "lucide-react";

export default function EscalationsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/complaints/", { params: { is_escalated: true } })
      .then(r => setComplaints(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="Escalations" subtitle={`${complaints.length} escalated complaint${complaints.length !== 1 ? "s" : ""}`}>
      {loading ? (
        <div className="loading"><div className="spinner" /> Loading...</div>
      ) : (
        <div className="card">
          {complaints.length === 0 ? (
            <div className="empty-state">
              <AlertTriangle />
              <h3>No escalations</h3>
              <p>Great! No complaints are currently escalated.</p>
            </div>
          ) : (
            <>
              <div style={{ background: "linear-gradient(135deg, #FFF1F2, #FFF7ED)", borderRadius: 12, padding: 16, marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                <AlertTriangle size={20} color="#BE123C" />
                <div>
                  <div style={{ fontWeight: 700, color: "#BE123C", fontSize: 14 }}>Escalated Complaints Require Immediate Attention</div>
                  <div style={{ fontSize: 12, color: "#9F1239", marginTop: 2 }}>These complaints have been escalated and need supervisor review.</div>
                </div>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Complaint ID</th>
                      <th>Title</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Customer</th>
                      <th>Agent</th>
                      <th>Escalated Since</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map(c => (
                      <tr key={c.id}>
                        <td><span className="complaint-number">{c.complaint_number}</span></td>
                        <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</td>
                        <td><PriorityBadge priority={c.priority} /></td>
                        <td><StatusBadge status={c.status} /></td>
                        <td className="text-sm">{c.customer.name}</td>
                        <td className="text-sm text-muted">{c.agent?.name || "—"}</td>
                        <td className="text-sm text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                        <td>
                          <button className="btn btn-secondary btn-sm btn-icon" onClick={() => navigate(`/complaints/${c.id}`)}>
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </Layout>
  );
}
