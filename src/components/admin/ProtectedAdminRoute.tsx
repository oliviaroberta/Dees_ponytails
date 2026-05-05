import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="font-body text-sm text-muted-foreground">Checking admin session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
