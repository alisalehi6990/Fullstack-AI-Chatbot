import axios, { AxiosResponse } from "axios";
import { AuthFormData } from "../types/auth";

const api = axios.create({
  baseURL: "http://localhost:4000",
});

export interface AuthResponse {
  token: string;
  message: string;
}

export async function loginUser(userData: AuthFormData): Promise<AuthResponse> {
  try {
    const response: AxiosResponse<AuthResponse> = await api.post("/login", userData);
    return response.data;
  } catch (error) {
    throw new Error("Login failed");
  }
}

export async function registerUser(userData: AuthFormData): Promise<AuthResponse> {
  try {
    const response: AxiosResponse<AuthResponse> = await api.post("/register", userData);
    return response.data;
  } catch (error) {
    throw new Error("Registration failed");
  }
}