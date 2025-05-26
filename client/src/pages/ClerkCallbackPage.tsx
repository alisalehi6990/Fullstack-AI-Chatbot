import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { clerkSignIn } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { useToast } from "../hooks/use-toast";
import { useChatStore } from "../store/chatStore";

const ClerkCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn, signOut, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const { logout, login, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const { setChatHistory } = useChatStore();

  useEffect(() => {
    const syncWithBackend = async () => {
      if (
        !isSignedIn ||
        !clerkUser ||
        !clerkUser.primaryEmailAddress ||
        !isLoaded
      )
        return;

      try {
        const { token, user } = await clerkSignIn({
          clerkId: clerkUser.id,
          email: clerkUser.primaryEmailAddress.emailAddress,
          displayName: clerkUser.fullName,
        });

        localStorage.setItem("token", token);
        login(user, token);
        if (user.chatHistories) {
          setChatHistory(user.chatHistories);
        }
        navigate("/");
      } catch (error: any) {
        await signOut();
        logout();
        toast({
          title: "Something went wrong",
          description: error.message,
        });
        navigate("/");
      }
    };

    syncWithBackend();
  }, [
    setChatHistory,
    isSignedIn,
    clerkUser,
    navigate,
    signOut,
    isLoaded,
    login,
    logout,
    toast,
  ]);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <p>Signing in with Clerk...</p>
    </div>
  );
};

export default ClerkCallbackPage;
