import { Navigate, useLocation } from "react-router-dom";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const location = useLocation();
  
  // Check for admin session
  const adminToken = localStorage.getItem("admin_token");
  const adminLoggedIn = localStorage.getItem("admin_logged_in");
  const adminId = localStorage.getItem("admin_id");
  
  // If no valid admin session, redirect to login
  if (!adminToken || !adminLoggedIn || !adminId) {
    // Save the location they were trying to go to
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

export default AdminProtectedRoute;
