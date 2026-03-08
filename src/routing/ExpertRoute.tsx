import { Navigate, Outlet, useLocation } from "react-router-dom";
import { hasValidAccessToken, ROLE_EXPERT, useAuth } from "../auth/useAuth";

export default function ExpertRoute() {
  const { user, tokens } = useAuth();
  const location = useLocation();

  if (!user || !hasValidAccessToken(tokens)) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user.role.id !== ROLE_EXPERT.id) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
