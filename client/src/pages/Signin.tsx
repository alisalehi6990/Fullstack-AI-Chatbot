import { Navigate, useLocation } from "react-router-dom";
import { useUserStore } from "../store/userStore";
import { loginUser, registerUser } from "../services/api";
import AuthForm from "../components/AuthForm";
import { AuthFormData } from "../types/auth";

const SigninPage: React.FC = () => {
  const { user, setUser } = useUserStore();
  if (user) {
    return <Navigate to="/chat" replace />;
  }
  const handleLogin = async (data: { email: string; password: string }) => {
    const response = await loginUser(data);
    localStorage.setItem("token", response.token);
    setUser(response.user, response.token);
  };

  const handleRegister = async (data: AuthFormData) => {
    await registerUser(data);
  };
  return (
    <AuthForm
      title="Login"
      onLogin={handleLogin}
      onRegister={handleRegister}
    />
  );
};

export default SigninPage;
