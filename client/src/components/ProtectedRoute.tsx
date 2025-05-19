import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useUserStore } from "../store/userStore";
import { verifyToken } from "../services/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, setUser, clearUser } = useUserStore();

  useEffect(() => {
    const checkAuth = async () => {
      if (!user && localStorage.getItem("token")) {
        try {
          const response = await verifyToken();
          setUser(response.user, localStorage.getItem("token"));
        } catch (error) {
          clearUser();
        }
      }
    };

    checkAuth();
  }, [user, setUser, clearUser]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/chat" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;