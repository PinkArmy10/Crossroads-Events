import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminRoute({ children }) {
  const { user, profile, loading, isStaff } = useAuth();

  if (loading) {
    return <p className="announcement-feedback">Checking access...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile || !isStaff) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;