import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useUserStore } from "../store/userStore";
import { verifyToken } from "../services/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, setUser, clearUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(false);
    };

    checkAuth();
  }, [user, setUser, clearUser]);

  if (isLoading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;