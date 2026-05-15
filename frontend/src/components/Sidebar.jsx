import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, FileText, PlusCircle, Users, BarChart2,
  MessageSquare, Settings, LogOut, AlertTriangle, ClipboardList
} from "lucide-react";

const navConfig = {
  Admin: [
    { label: "Main", items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
      { icon: ClipboardList, label: "All Complaints", path: "/complaints" },
      { icon: AlertTriangle, label: "Escalations", path: "/escalations" },
    ]},
    { label: "Management", items: [
      { icon: Users, label: "Users", path: "/users" },
      { icon: BarChart2, label: "Reports", path: "/reports" },
      { icon: MessageSquare, label: "Feedback", path: "/feedback" },
    ]},
  ],
  Supervisor: [
    { label: "Main", items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
      { icon: ClipboardList, label: "All Complaints", path: "/complaints" },
      { icon: AlertTriangle, label: "Escalations", path: "/escalations" },
    ]},
    { label: "Reports", items: [
      { icon: BarChart2, label: "Reports", path: "/reports" },
      { icon: MessageSquare, label: "Feedback", path: "/feedback" },
    ]},
  ],
  "Support Agent": [
    { label: "Main", items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
      { icon: ClipboardList, label: "My Queue", path: "/complaints" },
    ]},
  ],
  Customer: [
    { label: "Main", items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
      { icon: PlusCircle, label: "New Complaint", path: "/complaints/new" },
      { icon: FileText, label: "My Complaints", path: "/complaints" },
    ]},
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const sections = navConfig[user?.role?.name] || navConfig.Customer;
  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>CCRTS</h1>
        <span>Complaint & Resolution</span>
        <div className="sidebar-badge">Tracking System</div>
      </div>

      <nav className="sidebar-nav">
        {sections.map((section) => (
          <div key={section.label}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map((item) => (
              <button
                key={item.path}
                className={`nav-item ${location.pathname === item.path || location.pathname.startsWith(item.path + "/") ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <item.icon />
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role?.name}</div>
          </div>
          <button className="btn btn-icon btn-ghost" onClick={logout} title="Logout">
            <LogOut style={{ width: 16, height: 16, color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>
      </div>
    </aside>
  );
}
