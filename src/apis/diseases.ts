import { apiClient, unwrap } from "./client";
import type {
  ApiResponse,
  DiseaseRequest,
  DiseaseResponse,
  DiseaseStatus,
} from "../types/api";

export async function listDiseases(
  elderId: number,
  status?: DiseaseStatus,
): Promise<DiseaseResponse[]> {
  const res = await apiClient.get<ApiResponse<DiseaseResponse[]>>(
    `/elders/${elderId}/diseases`,
    { params: status ? { status } : undefined },
  );
  return unwrap(res.data) ?? [];
}

export async function createDisease(
  elderId: number,
  body: DiseaseRequest,
): Promise<DiseaseResponse> {
  const res = await apiClient.post<ApiResponse<DiseaseResponse>>(
    `/elders/${elderId}/diseases`,
    body,
  );
  return unwrap(res.data);
}

export async function updateDisease(
  elderId: number,
  diseaseId: number,
  body: DiseaseRequest,
): Promise<DiseaseResponse> {
  const res = await apiClient.put<ApiResponse<DiseaseResponse>>(
    `/elders/${elderId}/diseases/${diseaseId}`,
    body,
  );
  return unwrap(res.data);
}

export async function deleteDisease(elderId: number, diseaseId: number): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(`/elders/${elderId}/diseases/${diseaseId}`);
}
