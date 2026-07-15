import { apiClient, unwrap } from "./client";
import type {
  ApiResponse,
  MedicationRequest,
  MedicationResponse,
  MedicationStatus,
} from "../types/api";

export async function listMedications(
  elderId: number,
  status?: MedicationStatus,
): Promise<MedicationResponse[]> {
  const res = await apiClient.get<ApiResponse<MedicationResponse[]>>(
    `/elders/${elderId}/medications`,
    { params: status ? { status } : undefined },
  );
  return unwrap(res.data) ?? [];
}

export async function createMedication(
  elderId: number,
  body: MedicationRequest,
): Promise<MedicationResponse> {
  const res = await apiClient.post<ApiResponse<MedicationResponse>>(
    `/elders/${elderId}/medications`,
    body,
  );
  return unwrap(res.data);
}

export async function updateMedication(
  elderId: number,
  medicationId: number,
  body: MedicationRequest,
): Promise<MedicationResponse> {
  const res = await apiClient.put<ApiResponse<MedicationResponse>>(
    `/elders/${elderId}/medications/${medicationId}`,
    body,
  );
  return unwrap(res.data);
}

export async function deleteMedication(
  elderId: number,
  medicationId: number,
): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(
    `/elders/${elderId}/medications/${medicationId}`,
  );
}
