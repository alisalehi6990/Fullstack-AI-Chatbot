import axios, { AxiosResponse } from "axios";
import { AuthFormData } from "@/types/auth";
import { Message } from "@/types/chat";

export const apiService = axios.create({
  baseURL: "http://localhost:4000",
  // baseURL: "http://192.168.1.4:4000",
});

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  role: string;
  isActive: boolean;
  chatHistories?: {
    id: string;
    messages: Message[];
    createdAt: string;
  }[];
}

export interface VerifyResponse {
  user: User;
}

export async function loginUser(userData: AuthFormData): Promise<AuthResponse> {
  try {
    const response: AxiosResponse<AuthResponse> = await apiService.post(
      "/auth/login",
      userData
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Login failed");
  }
}

export async function registerUser(
  userData: AuthFormData
): Promise<AuthResponse> {
  try {
    const response: AxiosResponse<AuthResponse> = await apiService.post(
      "/auth/register",
      userData
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Registration failed");
  }
}

export async function verifyToken(): Promise<VerifyResponse> {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    const response: AxiosResponse<VerifyResponse> = await apiService.get(
      "/auth/verify",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Token verification failed");
  }
}

export async function clerkSignIn(userData: {
  clerkId: string;
  email: string;
  displayName: string | null;
}): Promise<AuthResponse> {
  try {
    const response: AxiosResponse<AuthResponse> = await apiService.post(
      "/auth/clerk",
      userData
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Login failed");
  }
}

export async function uploadDocument({
  file,
  sessionId,
  fileInfo,
}: {
  file: File;
  sessionId?: string;
  fileInfo: {
    name: string;
    type: string;
    sizeText: string;
  };
}): Promise<{ documentId: string }> {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileInfo", JSON.stringify(fileInfo));
    if (sessionId) {
      formData.append("sessionId", sessionId);
    }

    const response: AxiosResponse<{ documentId: string }> =
      await apiService.post("/chat/documents", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Upload failed");
  }
}

export async function removeDocument(documentId: string) {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    const response = await apiService.delete("/chat/documents/" + documentId, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Document removal failed"
    );
  }
}
