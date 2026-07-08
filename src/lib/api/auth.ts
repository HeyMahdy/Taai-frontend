import { apiClient } from "./client";
import { ENDPOINTS } from "./config";
import { setToken } from "../auth";

// Types
export type AuthUser = {
  id: string;
  email: string;
  display_name: string | null;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

export type SignupPayload = {
  email: string;
  password: string;
  display_name?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

// API calls
export async function signup(payload: SignupPayload) {
  const result = await apiClient<AuthResponse>(ENDPOINTS.AUTH_SIGNUP, {
    method: "POST",
    body: payload as unknown as Record<string, unknown>,
    public: true,
  });

  if (result.data?.access_token) {
    setToken(result.data.access_token);
  }

  return result;
}

export async function login(payload: LoginPayload) {
  const result = await apiClient<AuthResponse>(ENDPOINTS.AUTH_LOGIN, {
    method: "POST",
    body: payload as unknown as Record<string, unknown>,
    public: true,
  });

  if (result.data?.access_token) {
    setToken(result.data.access_token);
  }

  return result;
}
