import { apiClient, unwrap } from "./client";
import type {
  ApiResponse,
  DailyLogResponse,
  DailyLogUpdateRequest,
  MedicationIntakeRequest,
  MedicationIntakeResponse,
} from "../types/api";

/** 오늘(또는 date) 하루 지표 조회. 대시보드의 dailyLog 와 동일 구조. */
export async function getDailyLog(
  elderId: number,
  date?: string,
): Promise<DailyLogResponse> {
  const res = await apiClient.get<ApiResponse<DailyLogResponse>>(
    `/elders/${elderId}/daily-log`,
    { params: date ? { date } : undefined },
  );
  return unwrap(res.data);
}

/** 수동 저장/수정(부분 수정). null 필드는 변경 안 함. */
export async function putDailyLog(
  elderId: number,
  body: DailyLogUpdateRequest,
): Promise<DailyLogResponse> {
  const res = await apiClient.put<ApiResponse<DailyLogResponse>>(
    `/elders/${elderId}/daily-log`,
    body,
  );
  return unwrap(res.data);
}

/** 대화에서 지표 재추출(보정/재분석용). ⚠️ OPENAI_API_KEY 필요. */
export async function extractDailyLog(
  elderId: number,
  conversationId?: number,
): Promise<DailyLogResponse> {
  const res = await apiClient.post<ApiResponse<DailyLogResponse>>(
    `/elders/${elderId}/daily-log/extract`,
    null,
    { params: conversationId != null ? { conversationId } : undefined },
  );
  return unwrap(res.data);
}

/** 오늘(또는 date) 복용한 약 목록. 대시보드 todayMedications 와 동일. */
export async function getMedicationIntake(
  elderId: number,
  date?: string,
): Promise<MedicationIntakeResponse[]> {
  const res = await apiClient.get<ApiResponse<MedicationIntakeResponse[]>>(
    `/elders/${elderId}/medication-intake`,
    { params: date ? { date } : undefined },
  );
  return unwrap(res.data) ?? [];
}

/** 복약 체크(체크박스 연동). 같은 약/같은 날은 upsert. */
export async function submitMedicationIntake(
  elderId: number,
  body: MedicationIntakeRequest,
): Promise<MedicationIntakeResponse> {
  const res = await apiClient.post<ApiResponse<MedicationIntakeResponse>>(
    `/elders/${elderId}/medication-intake`,
    body,
  );
  return unwrap(res.data);
}
