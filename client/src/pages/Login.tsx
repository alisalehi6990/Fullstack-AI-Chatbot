import React from "react";
import AuthForm from "../components/AuthForm";
import { loginUser } from "../services/api";

const Login: React.FC = () => {
  const handleLogin = async (data: { email: string; password: string }) => {
    const response = await loginUser(data);
    localStorage.setItem("token", response.token);
    console.log("Logging in with", data);
  };
  return <AuthForm title="Login" isLogin={true} onSubmit={handleLogin} />;
};

export default Login;
