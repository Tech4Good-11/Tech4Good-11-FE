import { apiClient, unwrap } from "./client";
import type { ApiResponse, DashboardResponse } from "../types/api";

export async function getDashboard(elderId: number): Promise<DashboardResponse> {
  const res = await apiClient.get<ApiResponse<DashboardResponse>>(
    `/elders/${elderId}/dashboard`,
  );
  return unwrap(res.data);
}
