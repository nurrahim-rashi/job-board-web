const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const tokenKey = "accessToken";
const userKey = "authUser";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: "JOB_SEEKER" | "COMPANY_ADMIN" | "DEVELOPER";
  avatar: string | null;
  emailVerifiedAt: string | null;
  birthDate: string | null;
  gender: "MALE" | "FEMALE" | null;
  lastEducation: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  authProvider: "EMAIL" | "GOOGLE";
  company: { id: number; companyName: string; phone: string; profileContent: string; logo: string | null; city: string } | null;
};

type Session = { token: string; user: AuthUser };
type ApiResponse<T> = { message?: string; data?: T };

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${apiUrl}/auth${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}), ...options.headers },
  });
  const payload = (await response.json().catch(() => ({}))) as ApiResponse<T>;
  if (!response.ok) throw new Error(payload.message ?? "Something went wrong. Please try again.");
  return payload;
}

function publicPost<T>(path: string, body: Record<string, unknown>) {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export async function login(email: string, password: string) {
  const response = await publicPost<Session>("/login", { email, password });
  if (!response.data) throw new Error("Invalid login response");
  return response.data;
}

export async function register(input: { name: string; email: string; password: string; role: "JOB_SEEKER" | "COMPANY_ADMIN"; companyName?: string; phone?: string; city?: string }) {
  const response = await publicPost<Session>("/register", input);
  if (!response.data) throw new Error("Invalid registration response");
  return response.data;
}

export async function getProfile() {
  const response = await request<AuthUser>("/me");
  if (!response.data) throw new Error("Unable to load profile");
  saveUser(response.data);
  return response.data;
}

export async function updateProfile(input: Partial<AuthUser> & { companyName?: string; phone?: string; companyCity?: string; profileContent?: string }) {
  const response = await request<AuthUser>("/profile", { method: "PATCH", body: JSON.stringify(input) });
  if (!response.data) throw new Error("Unable to update profile");
  saveUser(response.data);
  return response.data;
}

export function resendVerification(email: string) { return publicPost<void>("/resend-verification", { email }); }
export function forgotPassword(email: string) { return publicPost<void>("/forgot-password", { email }); }
export function resetPassword(token: string, password: string) { return publicPost<void>("/reset-password", { token, password }); }
export function verifyEmail(token: string) { return publicPost<void>("/verify-email", { token }); }
export function changePassword(currentPassword: string, newPassword: string) { return request<void>("/change-password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) }); }
export async function uploadAvatar(file: File) {
  if (!file.type.match(/^image\/(jpeg|png)$/)) throw new Error("Avatar must be a JPG, JPEG, or PNG file.");
  if (file.size > 1024 * 1024) throw new Error("Avatar must be 1MB or smaller.");
  const response = await fetch(`${apiUrl}/auth/avatar`, { method: "PUT", headers: { Authorization: `Bearer ${getToken()}` , "Content-Type": file.type }, body: file });
  const payload = (await response.json().catch(() => ({}))) as ApiResponse<AuthUser>;
  if (!response.ok || !payload.data) throw new Error(payload.message ?? "Unable to upload avatar.");
  saveUser(payload.data);
  return payload.data;
}

export function getToken() { return localStorage.getItem(tokenKey); }
export function getStoredUser(): AuthUser | null {
  const stored = localStorage.getItem(userKey);
  if (!stored) return null;
  try { return JSON.parse(stored) as AuthUser; } catch { return null; }
}
export function saveUser(user: AuthUser) {
  localStorage.setItem(userKey, JSON.stringify(user));
  window.dispatchEvent(new Event("authchange"));
}
export function saveSession(session: Session) {
  localStorage.setItem(tokenKey, session.token);
  saveUser(session.user);
}
export async function logout() {
  try { if (getToken()) await request<void>("/logout", { method: "POST" }); }
  finally {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    window.dispatchEvent(new Event("authchange"));
  }
}
