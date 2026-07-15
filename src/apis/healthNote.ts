import { apiClient, unwrap } from "./client";
import type { ApiResponse, HealthNoteResponse } from "../types/api";

/** 건강노트 조회 — 없으면 null */
export async function getHealthNote(elderId: number): Promise<HealthNoteResponse | null> {
  const res = await apiClient.get<ApiResponse<HealthNoteResponse | null>>(
    `/elders/${elderId}/health-note`,
  );
  return unwrap(res.data);
}

/** 건강노트 갱신(upsert) */
export async function putHealthNote(
  elderId: number,
  contentMd: string,
): Promise<HealthNoteResponse> {
  const res = await apiClient.put<ApiResponse<HealthNoteResponse>>(
    `/elders/${elderId}/health-note`,
    { contentMd },
  );
  return unwrap(res.data);
}
