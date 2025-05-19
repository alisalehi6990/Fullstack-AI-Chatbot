import { useState } from "react";
import { AuthFormData } from "../types/auth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

interface AuthFormProps {
  title: string;
  onLogin: (data: AuthFormData) => Promise<void>;
  onRegister: (data: AuthFormData) => Promise<void>;
}

const AuthForm: React.FC<AuthFormProps> = ({ title, onLogin, onRegister }) => {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      if (isLogin) {
        await onLogin({ email, password });
        navigate("/chat");
      } else {
        await onRegister({ email, displayName, password, confirmPassword });
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded mb-3"
        />
        {!isLogin && (
          <input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full p-2 border rounded mb-3"
          />
        )}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border rounded mb-3"
        />
        {!isLogin && (
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-2 border rounded mb-3"
          />
        )}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          {title}
        </button>
      </form>
      <p className="mt-4 text-center">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <Link
          to={"#"}
          onClick={(e) => setIsLogin(!isLogin)}
          className="text-blue-500 hover:underline"
        >
          {isLogin ? "Register" : "Login"}
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;
