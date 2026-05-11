import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../UserContext";

type Role = "customer" | "employee" | "admin";

interface Props {
  children: ReactNode;
  roles?: Role[];
}

function PrivateRoute({ children, roles }: Props) {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: 40, fontFamily: "Arial" }}>Cargando sesión...</div>;
  }

  if (!user) {
    return <Navigate to="/intranet/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default PrivateRoute;
