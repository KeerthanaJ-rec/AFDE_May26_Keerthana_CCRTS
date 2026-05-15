import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children, title, subtitle, actions }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <div className="topbar-title">{title}</div>
            {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
          </div>
          {actions && <div className="flex gap-8">{actions}</div>}
        </div>
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}
