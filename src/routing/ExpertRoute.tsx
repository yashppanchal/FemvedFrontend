import { Navigate, Outlet } from "react-router-dom";
import { hasValidAccessToken, useAuth } from "../auth/useAuth";

export default function ExpertRoute() {
  // TEMP: auth guard disabled while designing expert dashboard UI.
  return <Outlet />;

  const { user, tokens } = useAuth();

  if (!user || !hasValidAccessToken(tokens)) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "expert") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
