import { apiRequest } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { LoginCredentials, AuthSession } from "../types";

interface BackendLoginResponse {
  token: string;
  username: string;
  role: string;
}

interface BackendRegisterResponse {
  token: string;
  username: string;
  role: string;
}

function mapRole(role: string): "admin" | "teacher" {
  switch (role.toUpperCase()) {
    case "ADMIN":
      return "admin";

    case "TEACHER":
      return "teacher";

    default:
      throw new Error(`Role không được hỗ trợ: ${role}`);
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    if (!credentials.password) {
      throw new Error("Password không được để trống.");
    }

    const response = await apiRequest<BackendLoginResponse>(
      API_ENDPOINTS.auth.login,
      {
        method: "POST",
        body: {
          username: credentials.username,
          password: credentials.password,
        },
      },
    );

    const role = mapRole(response.role);

    return {
      token: response.token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      user: {
        id: response.username,
        name: response.username,
        email: response.username,
        role,
        title: role === "admin" ? "Quản trị viên" : "Giáo viên",
      },
    };
  },

  async register(credentials: {
    username: string;
    email: string;
    password: string;
  }): Promise<AuthSession> {
    const response = await apiRequest<BackendRegisterResponse>(
      API_ENDPOINTS.auth.register,
      {
        method: "POST",
        body: {
          username: credentials.username,
          email: credentials.email,
          password: credentials.password,
        },
      },
    );

    const role = mapRole(response.role);

    return {
      token: response.token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      user: {
        id: response.username,
        name: response.username,
        email: response.username,
        role,
        title: role === "admin" ? "Quản trị viên" : "Giáo viên",
      },
    };
  },

  async logout(): Promise<void> {
    // JWT hiện tại là stateless.
    // FE chỉ cần xóa token/session.
  },
};
