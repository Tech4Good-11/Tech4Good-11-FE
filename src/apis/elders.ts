import { apiClient, unwrap } from "./client";
import type {
  ApiResponse,
  ElderCreateRequest,
  ElderResponse,
  ElderSummaryResponse,
  ElderUpdateRequest,
} from "../types/api";

export async function listElders(): Promise<ElderSummaryResponse[]> {
  const res = await apiClient.get<ApiResponse<ElderSummaryResponse[]>>("/elders");
  return unwrap(res.data) ?? [];
}

export async function createElder(body: ElderCreateRequest): Promise<ElderResponse> {
  const res = await apiClient.post<ApiResponse<ElderResponse>>("/elders", body);
  return unwrap(res.data);
}

export async function getElder(elderId: number): Promise<ElderResponse> {
  const res = await apiClient.get<ApiResponse<ElderResponse>>(`/elders/${elderId}`);
  return unwrap(res.data);
}

export async function updateElder(
  elderId: number,
  body: ElderUpdateRequest,
): Promise<ElderResponse> {
  const res = await apiClient.put<ApiResponse<ElderResponse>>(`/elders/${elderId}`, body);
  return unwrap(res.data);
}

export async function deleteElder(elderId: number): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(`/elders/${elderId}`);
}
