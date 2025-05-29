import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { verifyToken } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { AuthModal } from "@/components/layout/AuthModal";
import { useToast } from "@/hooks/use-toast";
import { useChatStore } from "@/store/chatStore";

interface ProtectedRouteProps {
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user, login, logout } = useAuthStore();
  const { setChatHistory } = useChatStore();
  const { toast } = useToast();

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
        } catch (error) {
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

  return <Outlet />;
};

export default ProtectedRoute;
