import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ComplaintsPage from "./pages/ComplaintsPage";
import NewComplaintPage from "./pages/NewComplaintPage";
import ComplaintDetailPage from "./pages/ComplaintDetailPage";
import EscalationsPage from "./pages/EscalationsPage";
import UsersPage from "./pages/UsersPage";
import ReportsPage from "./pages/ReportsPage";
import FeedbackPage from "./pages/FeedbackPage";

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role?.name)) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/complaints" element={<PrivateRoute><ComplaintsPage /></PrivateRoute>} />
      <Route path="/complaints/new" element={<PrivateRoute><NewComplaintPage /></PrivateRoute>} />
      <Route path="/complaints/:id" element={<PrivateRoute><ComplaintDetailPage /></PrivateRoute>} />
      <Route path="/escalations" element={<PrivateRoute roles={["Admin", "Supervisor"]}><EscalationsPage /></PrivateRoute>} />
      <Route path="/users" element={<PrivateRoute roles={["Admin"]}><UsersPage /></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute roles={["Admin", "Supervisor"]}><ReportsPage /></PrivateRoute>} />
      <Route path="/feedback" element={<PrivateRoute roles={["Admin", "Supervisor"]}><FeedbackPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ style: { borderRadius: 10, fontFamily: "Inter, sans-serif", fontSize: 14 } }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
