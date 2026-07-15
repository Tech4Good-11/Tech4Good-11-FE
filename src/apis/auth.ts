import { apiClient, unwrap } from "./client";
import type { ApiResponse, LoginRequest, SignupRequest, UserResponse } from "../types/api";

export async function signup(body: SignupRequest): Promise<UserResponse> {
  const res = await apiClient.post<ApiResponse<UserResponse>>("/auth/signup", body);
  return unwrap(res.data);
}

export async function login(body: LoginRequest): Promise<UserResponse> {
  const res = await apiClient.post<ApiResponse<UserResponse>>("/auth/login", body);
  return unwrap(res.data);
}

export async function logout(): Promise<void> {
  await apiClient.post<ApiResponse<null>>("/auth/logout");
}

export async function me(): Promise<UserResponse> {
  const res = await apiClient.get<ApiResponse<UserResponse>>("/auth/me");
  return unwrap(res.data);
}
