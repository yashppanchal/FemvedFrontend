import { Navigate, Outlet } from "react-router-dom";
import { hasValidAccessToken, ROLE_ADMIN, useAuth } from "../auth/useAuth";

export default function AdminRoute() {
  const { user, tokens } = useAuth();

  if (!user || !hasValidAccessToken(tokens)) {
    return <Navigate to="/login" replace />;
  }

  if (user.role.id !== ROLE_ADMIN.id) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
