import { axiosInstance } from "../lib/axios";
import { useAuth } from "../stores/useAuth";
import type {
  AuthSession,
  AuthUser,
  DashboardOverview,
  HomepageData,
  RegisterInput,
  UpdateProfileInput,
} from "../types/auth";
import type { ApiResponse } from "../types/api";

function getData<T>(response: { data: ApiResponse<T> }, fallback: string) {
  if (!response.data.data) throw new Error(fallback);
  return response.data.data;
}

export async function login(email: string, password: string) {
  const response = await axiosInstance.post<ApiResponse<AuthSession>>("/auth/login", { email, password });
  return getData(response, "Invalid login response");
}

export async function loginWithGoogle(credential: string) {
  const response = await axiosInstance.post<ApiResponse<AuthSession>>(
    "/auth/google",
    { credential },
  );
  return getData(response, "Invalid Google login response");
}

export async function register(input: RegisterInput) {
  const response = await axiosInstance.post<ApiResponse<AuthSession>>("/auth/register", input);
  return getData(response, "Invalid registration response");
}

export async function getProfile() {
  const response = await axiosInstance.get<ApiResponse<AuthUser>>("/auth/me");
  const user = getData(response, "Unable to load profile");
  useAuth.getState().setUser(user);
  return user;
}

export async function getDashboardOverview() {
  const response = await axiosInstance.get<ApiResponse<DashboardOverview>>("/auth/dashboard-overview");
  return getData(response, "Unable to load dashboard overview");
}

export async function getHomepageData() {
  const response = await axiosInstance.get<ApiResponse<HomepageData>>(
    "/auth/homepage",
  );
  return getData(response, "Unable to load homepage");
}

export async function getSubscriptionStatus() {
  const response = await axiosInstance.get<
    ApiResponse<{
      active: boolean;
      plan: "STANDARD" | "PROFESSIONAL" | null;
    }>
  >("/auth/subscription-status");
  return getData(response, "Unable to check subscription status");
}

export async function updateProfile(input: UpdateProfileInput) {
  const response = await axiosInstance.patch<ApiResponse<AuthUser>>("/auth/profile", input);
  const user = getData(response, "Unable to update profile");
  useAuth.getState().setUser(user);
  return user;
}

export async function resendVerification(email: string) {
  await axiosInstance.post("/auth/resend-verification", { email });
}

export async function forgotPassword(email: string) {
  await axiosInstance.post("/auth/forgot-password", { email });
}

export async function resetPassword(token: string, password: string) {
  await axiosInstance.post("/auth/reset-password", { token, password });
}

export async function verifyEmail(token: string) {
  await axiosInstance.post("/auth/verify-email", { token });
}

export async function changePassword(currentPassword: string, newPassword: string) {
  await axiosInstance.post("/auth/change-password", { currentPassword, newPassword });
}

export async function uploadAvatar(file: File) {
  if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
    throw new Error("Avatar must be a JPG, PNG, or WEBP file.");
  }
  if (file.size > 1024 * 1024) throw new Error("Avatar must be 1MB or smaller.");

  const body = new FormData();
  body.append("avatar", file);
  const response = await axiosInstance.put<ApiResponse<AuthUser>>("/auth/avatar", body);
  const user = getData(response, "Unable to upload avatar.");
  useAuth.getState().setUser(user);
  return user;
}

export async function removeAvatar() {
  const response = await axiosInstance.delete<ApiResponse<AuthUser>>("/auth/avatar");
  const user = getData(response, "Unable to remove profile photo.");
  useAuth.getState().setUser(user);
  return user;
}

export async function logout() {
  try {
    if (useAuth.getState().token) await axiosInstance.post("/auth/logout");
  } catch {
    // Logging out locally must still work when the API is unavailable.
  } finally {
    useAuth.getState().logout();
  }
}
