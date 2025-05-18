import React from "react";
import AuthForm from "../components/AuthForm";
import { registerUser } from "../services/api";
import { AuthFormData } from "../types/auth";

const Register: React.FC = () => {
  const handleRegister = async (data: AuthFormData) => {
    await registerUser(data);
  };

  return (
    <AuthForm title="Register" isLogin={false} onSubmit={handleRegister} />
  );
};

export default Register;
