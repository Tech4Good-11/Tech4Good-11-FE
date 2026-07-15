import { apiClient, unwrap } from "./client";
import type {
  ApiResponse,
  CheckinSubmitRequest,
  CheckinSubmitResponse,
  CheckinTodayResponse,
} from "../types/api";

export async function getTodayCheckin(elderId: number): Promise<CheckinTodayResponse[]> {
  const res = await apiClient.get<ApiResponse<CheckinTodayResponse[]>>(
    `/elders/${elderId}/checkin/today`,
  );
  return unwrap(res.data) ?? [];
}

export async function submitCheckin(
  elderId: number,
  body: CheckinSubmitRequest,
): Promise<CheckinSubmitResponse> {
  const res = await apiClient.post<ApiResponse<CheckinSubmitResponse>>(
    `/elders/${elderId}/checkin`,
    body,
  );
  return unwrap(res.data);
}
