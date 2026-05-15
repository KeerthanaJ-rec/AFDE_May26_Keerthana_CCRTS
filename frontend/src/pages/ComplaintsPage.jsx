import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { StatusBadge, PriorityBadge } from "../components/StatusBadge";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Plus, Search, Filter, AlertTriangle, Eye } from "lucide-react";
import toast from "react-hot-toast";

const SLA_LABEL = (deadline) => {
  if (!deadline) return null;
  const diff = new Date(deadline) - new Date();
  const hrs = Math.floor(diff / 36e5);
  if (diff < 0) return <span className="sla-danger text-xs">SLA Breached</span>;
  if (hrs < 6) return <span className="sla-warning text-xs">{hrs}h left</span>;
  return <span className="sla-ok text-xs">{hrs}h left</span>;
};

export default function ComplaintsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", status: "", priority: "", category_id: "" });

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.category_id) params.category_id = filters.category_id;
      const res = await api.get("/api/complaints/", { params });
      setComplaints(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get("/api/categories/").then(r => setCategories(r.data));
  }, []);

  useEffect(() => { load(); }, [filters]);

  const title = user?.role?.name === "Support Agent" ? "My Work Queue" : user?.role?.name === "Customer" ? "My Complaints" : "All Complaints";

  return (
    <Layout
      title={title}
      subtitle={`${complaints.length} complaint${complaints.length !== 1 ? "s" : ""} found`}
      actions={user?.role?.name !== "Support Agent" && (
        <button className="btn btn-primary" onClick={() => navigate("/complaints/new")}>
          <Plus size={16} /> New Complaint
        </button>
      )}
    >
      <div className="card">
        <div className="filters-bar">
          <div className="search-wrap">
            <Search />
            <input className="form-input" placeholder="Search by ID, title, description..." value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
          </div>

          <select className="form-select" style={{ width: 160 }} value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">All Statuses</option>
            {["Open", "Assigned", "In Progress", "Pending Customer Response", "Escalated", "Resolved", "Closed"].map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <select className="form-select" style={{ width: 140 }} value={filters.priority}
            onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
            <option value="">All Priorities</option>
            {["Low", "Medium", "High", "Critical"].map(p => <option key={p}>{p}</option>)}
          </select>

          <select className="form-select" style={{ width: 180 }} value={filters.category_id}
            onChange={e => setFilters(f => ({ ...f, category_id: e.target.value }))}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /> Loading...</div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <AlertTriangle />
            <h3>No complaints found</h3>
            <p>Try adjusting your filters or create a new complaint</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Customer</th>
                  <th>Agent</th>
                  <th>SLA</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="flex-center gap-8">
                        <span className="complaint-number">{c.complaint_number}</span>
                        {c.is_escalated && <span className="badge escalated-badge" style={{ fontSize: 10, padding: "2px 6px" }}>🔥 Escalated</span>}
                      </div>
                    </td>
                    <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</td>
                    <td><span className="text-sm text-muted">{c.category.name}</span></td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td><span className="text-sm">{c.customer.name}</span></td>
                    <td><span className="text-sm text-muted">{c.agent?.name || "—"}</span></td>
                    <td>{SLA_LABEL(c.sla_deadline)}</td>
                    <td><span className="text-sm text-muted">{new Date(c.created_at).toLocaleDateString()}</span></td>
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
        )}
      </div>
    </Layout>
  );
}
