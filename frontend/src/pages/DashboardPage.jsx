import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import {
  ClipboardList, CheckCircle, AlertTriangle, Clock, XCircle, TrendingUp, Flame, Activity
} from "lucide-react";

const COLORS = ["#6C63FF", "#FF6584", "#43E97B", "#F9A825", "#38BDF8", "#14B8A6", "#F97316", "#7C3AED"];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [catData, setCatData] = useState([]);
  const [priData, setPriData] = useState([]);
  const [agentData, setAgentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/api/dashboard/stats"),
      api.get("/api/dashboard/category-breakdown"),
      api.get("/api/dashboard/priority-breakdown"),
      ...(["Admin", "Supervisor"].includes(user?.role?.name) ? [api.get("/api/dashboard/agent-performance")] : [])
    ]).then(([s, c, p, a]) => {
      setStats(s.data);
      setCatData(c.data);
      setPriData(p.data);
      if (a) setAgentData(a.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Dashboard"><div className="loading"><div className="spinner" /> Loading...</div></Layout>;

  const statCards = [
    { label: "Total Complaints", value: stats?.total, color: "purple", icon: ClipboardList },
    { label: "Open", value: stats?.open, color: "blue", icon: Activity },
    { label: "In Progress", value: stats?.in_progress, color: "orange", icon: TrendingUp },
    { label: "Resolved", value: stats?.resolved, color: "green", icon: CheckCircle },
    { label: "Escalated", value: stats?.escalated, color: "pink", icon: AlertTriangle },
    { label: "Closed", value: stats?.closed, color: "teal", icon: XCircle },
    { label: "SLA Breached", value: stats?.sla_breached, color: "red", icon: Flame },
    { label: "Avg. Resolution (hrs)", value: stats?.avg_resolution_hours ?? "—", color: "indigo", icon: Clock },
  ];

  return (
    <Layout title="Dashboard" subtitle={`Welcome back, ${user?.name} · ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`}>
      <div className="stats-grid">
        {statCards.map(({ label, value, color, icon: Icon }) => (
          <div key={label} className={`stat-card ${color}`}>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            <Icon className="stat-icon" />
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Complaints by Category</span></div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catData} margin={{ left: -20 }}>
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Priority Distribution</span></div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={priData} dataKey="count" nameKey="priority" cx="50%" cy="50%" outerRadius={80} label={({ priority, percent }) => `${priority} ${(percent * 100).toFixed(0)}%`}>
                  {priData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {agentData.length > 0 && (
        <div className="card">
          <div className="card-header"><span className="card-title">Agent Performance</span></div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentData} margin={{ left: -20 }}>
                <XAxis dataKey="agent" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="assigned" fill="#6C63FF" radius={[4, 4, 0, 0]} name="Assigned" />
                <Bar dataKey="resolved" fill="#43E97B" radius={[4, 4, 0, 0]} name="Resolved" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Layout>
  );
}
