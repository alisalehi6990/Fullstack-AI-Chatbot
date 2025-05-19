import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useUserStore } from "../store/userStore";
import { verifyToken } from "../services/api";

interface AuthRedirectProps {
  children: React.ReactNode;
}

const AuthRedirect: React.FC<AuthRedirectProps> = ({ children }) => {
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

  if (user) {
    return <Navigate to="/chat" replace />;
  }

  return <>{children}</>;
};

export default AuthRedirect; 