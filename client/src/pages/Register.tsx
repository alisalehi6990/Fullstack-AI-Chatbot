import React from "react";
import AuthForm from "../components/AuthForm";
import { registerUser } from "../services/api";
import { AuthFormData } from "../types/auth";

const Register: React.FC = () => {
  const handleRegister = async (data: AuthFormData) => {
    const response = await registerUser(data);
    localStorage.setItem("token", response.token);
    console.log("Logging in with", data);
  };

  return <AuthForm title="Login" onSubmit={handleRegister} />;
};

export default Register;
