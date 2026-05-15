import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid
} from "recharts";

const COLORS = ["#6C63FF", "#FF6584", "#43E97B", "#F9A825", "#38BDF8", "#14B8A6", "#F97316", "#7C3AED"];

export default function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [catData, setCatData] = useState([]);
  const [priData, setPriData] = useState([]);
  const [agentData, setAgentData] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/api/dashboard/stats"),
      api.get("/api/dashboard/category-breakdown"),
      api.get("/api/dashboard/priority-breakdown"),
      api.get("/api/dashboard/agent-performance"),
    ]).then(([s, c, p, a]) => {
      setStats(s.data);
      setCatData(c.data);
      setPriData(p.data);
      setAgentData(a.data);
    });
  }, []);

  const statusData = stats ? [
    { name: "Open", value: stats.open, color: "#4F46E5" },
    { name: "In Progress", value: stats.in_progress, color: "#F97316" },
    { name: "Resolved", value: stats.resolved, color: "#22C55E" },
    { name: "Escalated", value: stats.escalated, color: "#EF4444" },
    { name: "Closed", value: stats.closed, color: "#94A3B8" },
  ] : [];

  return (
    <Layout title="Reports & Analytics" subtitle="Complaint performance overview">
      {stats && (
        <>
          <div className="stats-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)", marginBottom: 28 }}>
            {[
              { label: "Total", value: stats.total, color: "purple" },
              { label: "Open", value: stats.open, color: "blue" },
              { label: "Resolved", value: stats.resolved, color: "green" },
              { label: "Escalated", value: stats.escalated, color: "red" },
              { label: "SLA Breached", value: stats.sla_breached, color: "orange" },
            ].map(s => (
              <div key={s.label} className={`stat-card ${s.color}`}>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid-2" style={{ marginBottom: 24 }}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Status Distribution</div>
              <div style={{ height: 240 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {statusData.map((s, i) => <Cell key={i} fill={s.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Priority Breakdown</div>
              <div style={{ height: 240 }}>
                <ResponsiveContainer>
                  <BarChart data={priData} margin={{ left: -20 }}>
                    <XAxis dataKey="priority" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {priData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-title" style={{ marginBottom: 16 }}>Complaints by Category</div>
            <div style={{ height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={catData} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F8" />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6C63FF" radius={[6, 6, 0, 0]} name="Complaints" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {agentData.length > 0 && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Agent Performance</div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Agent</th>
                      <th>Assigned</th>
                      <th>Resolved</th>
                      <th>Resolution Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentData.map(a => (
                      <tr key={a.agent}>
                        <td className="font-semibold text-sm">{a.agent}</td>
                        <td>{a.assigned}</td>
                        <td>{a.resolved}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ flex: 1, height: 8, background: "#EEF2FF", borderRadius: 4, overflow: "hidden" }}>
                              <div style={{ height: "100%", borderRadius: 4, background: "linear-gradient(90deg, #6C63FF, #43E97B)", width: `${a.assigned ? (a.resolved / a.assigned * 100).toFixed(0) : 0}%` }} />
                            </div>
                            <span className="text-sm font-semibold">{a.assigned ? (a.resolved / a.assigned * 100).toFixed(0) : 0}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {stats.avg_resolution_hours && (
                <div style={{ marginTop: 20, padding: "14px 18px", background: "linear-gradient(135deg, #EEF2FF, #F0FDF4)", borderRadius: 12 }}>
                  <span className="font-semibold text-sm">Average Resolution Time: </span>
                  <span className="gradient-text font-bold" style={{ fontSize: 16 }}>{stats.avg_resolution_hours} hours</span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
