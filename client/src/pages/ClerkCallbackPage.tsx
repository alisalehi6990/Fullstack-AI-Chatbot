import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useUserStore } from "../store/userStore";
import { clerkSignIn } from "../services/api";

const ClerkCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn, signOut, isLoaded } = useAuth();
  const { user } = useUser();
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  useEffect(() => {
    const syncWithBackend = async () => {
      if (!isSignedIn || !user || !user.primaryEmailAddress || !isLoaded)
        return;

      try {
        const response = await clerkSignIn({
          clerkId: user.id,
          email: user.primaryEmailAddress.emailAddress,
          displayName: user.fullName,
        });

        const { token } = response;

        localStorage.setItem("token", token);

        setUser(
          {
            id: user.id,
            email: user.primaryEmailAddress.emailAddress,
            displayName: user.fullName || undefined,
            role: "USER",
            isActive: true,
          },
          token
        );

        navigate("/");
      } catch (error: any) {
        await signOut({ redirectUrl: "/signin" });
        clearUser();
        navigate("/signin", { state: { errorMessage: error.message } });
      }
    };

    syncWithBackend();
  }, [isSignedIn, user, navigate, setUser, clearUser, signOut, isLoaded]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p>Signing in with Clerk...</p>
    </div>
  );
};

export default ClerkCallbackPage;
