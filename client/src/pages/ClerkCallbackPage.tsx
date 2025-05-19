import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useUserStore } from "../store/userStore";
import { clerkSignIn } from "../services/api";

const ClerkCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    const syncWithBackend = async () => {
      if (!isSignedIn || !user || !user.primaryEmailAddress) return;

      try {
        const response = await clerkSignIn({
          clerkId: user.id,
          email: user.primaryEmailAddress.emailAddress,
          displayName: user.fullName,
        });

        const { token } = response;
        console.log(response);
        localStorage.setItem("token", token);

        // // Save user to Zustand store
        setUser(
          {
            id: user.id,
            email: user.primaryEmailAddress.emailAddress,
            displayName: user.fullName || undefined,
            role: "USER",
          },
          token
        );

        // // Redirect to chat
        navigate("/chat");
      } catch (error) {
        console.error("Failed to sync with backend:", error);
        alert("Login successful but failed to connect to your system.");
        navigate("/signin");
      }
    };

    syncWithBackend();
  }, [isSignedIn, user, navigate, setUser]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p>Signing in with Clerk...</p>
    </div>
  );
};

export default ClerkCallbackPage;
