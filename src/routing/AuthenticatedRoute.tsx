import { Navigate, Outlet, useLocation } from "react-router-dom";
import { hasValidAccessToken, useAuth } from "../auth/useAuth";

export default function AuthenticatedRoute() {
  const { user, tokens } = useAuth();
  const location = useLocation();

  if (!user || !hasValidAccessToken(tokens)) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
