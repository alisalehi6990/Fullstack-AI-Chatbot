import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useUserStore } from "../store/userStore"; // TODO: Delete
import { verifyToken } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { AuthModal } from "./layout/AuthModal";
import { useToast } from "../hooks/use-toast";
import { useChatStore } from "../store/chatStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user, login, logout } = useAuthStore();
  const { setChatHistory } = useChatStore();
  const { toast } = useToast();
  const { setUser, clearUser } = useUserStore(); // TODO: Delete

  useEffect(() => {
    const checkAuth = async () => {
      const localToken = localStorage.getItem("token");
      if (!isAuthenticated && localToken) {
        try {
          const response = await verifyToken();
          login({ ...response.user }, localToken);
          if (response.user.chatHistories) {
            setChatHistory(response.user.chatHistories);
          }
          setUser(response.user, localStorage.getItem("token")); // TODO: DELETE
        } catch (error) {
          clearUser(); // TODO: DELETE
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [
    isAuthenticated,
    user,
    logout,
    login,
    clearUser,
    setUser,
    setChatHistory,
  ]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  if (requiredRole && user!.role !== requiredRole) {
    toast({
      title: "Nope",
      description: "You are now allowed to see this page",
    });
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
