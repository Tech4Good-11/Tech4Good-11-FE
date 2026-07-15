import { apiClient, unwrap } from "./client";
import type { ApiResponse, ConsultRequest, ConsultResponse } from "../types/api";

/**
 * 자녀(보호자)가 부모님 상태를 AI와 상담.
 * 어르신이 남긴 기록(최근 대화·건강노트·질병·복약·수면/운동 추이)을 근거로 3인칭 답변.
 * ⚠️ /chat 과 절대 혼용 금지 — /chat 은 발화자를 어르신으로 간주해 데이터가 오염된다.
 * ⚠️ 저장하지 않으므로 맥락 유지는 프론트가 history 로 넘겨야 한다. OPENAI_API_KEY 필요.
 */
export async function sendConsult(
  elderId: number,
  body: ConsultRequest,
): Promise<ConsultResponse> {
  const res = await apiClient.post<ApiResponse<ConsultResponse>>(
    `/elders/${elderId}/consult`,
    body,
  );
  return unwrap(res.data);
}
