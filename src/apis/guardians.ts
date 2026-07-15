import { apiClient, unwrap } from "./client";
import type { ApiResponse, GuardianAddRequest, GuardianResponse } from "../types/api";

export async function listGuardians(elderId: number): Promise<GuardianResponse[]> {
  const res = await apiClient.get<ApiResponse<GuardianResponse[]>>(
    `/elders/${elderId}/guardians`,
  );
  return unwrap(res.data) ?? [];
}

export async function addGuardian(
  elderId: number,
  body: GuardianAddRequest,
): Promise<GuardianResponse> {
  const res = await apiClient.post<ApiResponse<GuardianResponse>>(
    `/elders/${elderId}/guardians`,
    body,
  );
  return unwrap(res.data);
}

export async function removeGuardian(elderId: number, userId: number): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(`/elders/${elderId}/guardians/${userId}`);
}
