import { Navigate } from "react-router-dom";
import { useUser } from "./UserProvider";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useUser();

  // Om ingen är inloggad → skicka till login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
