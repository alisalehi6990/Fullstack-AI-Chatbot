import React from "react";
import AuthForm from "../components/AuthForm";
import { registerUser } from "../services/api";
import { AuthFormData } from "../types/auth";
import { useUserStore } from "../store/userStore";
import { Navigate } from "react-router-dom";

const Register: React.FC = () => {
  const { user } = useUserStore();
  if (user) {
    return <Navigate to="/chat" replace />;
  }
  const handleRegister = async (data: AuthFormData) => {
    await registerUser(data);
  };

  return (
    <AuthForm title="Register" isLogin={false} onSubmit={handleRegister} />
  );
};

export default Register;
