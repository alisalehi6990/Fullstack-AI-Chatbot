import React from "react";
import AuthForm from "../components/AuthForm";
import { loginUser } from "../services/api";
import { useUserStore } from "../store/userStore";
import { Navigate } from "react-router-dom";

const Login: React.FC = () => {
  const { user, setUser } = useUserStore();
  if (user) {
    return <Navigate to="/chat" replace />;
  }
  const handleLogin = async (data: { email: string; password: string }) => {
    const response = await loginUser(data);
    localStorage.setItem("token", response.token);
    setUser(response.user, response.token);
    console.log("Logging in with", data);
  };
  return <AuthForm title="Login" isLogin={true} onSubmit={handleLogin} />;
};

export default Login;
