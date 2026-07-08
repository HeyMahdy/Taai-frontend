import { apiClient } from "./client";
import { ENDPOINTS } from "./config";

// Types
export type UserProfile = {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
};

export type UpdateProfilePayload = {
  display_name?: string;
};

// API calls
export async function getProfile() {
  return apiClient<UserProfile>(ENDPOINTS.USER_ME);
}

export async function updateProfile(payload: UpdateProfilePayload) {
  return apiClient<UserProfile>(ENDPOINTS.USER_ME, {
    method: "PATCH",
    body: payload as unknown as Record<string, unknown>,
  });
}
