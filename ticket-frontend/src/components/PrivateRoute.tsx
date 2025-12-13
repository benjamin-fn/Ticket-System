import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "./UserProvider";

export default function PrivateRoute() {
  const { user } = useUser();
  const loc = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  return <Outlet />;
}
