import { apiClient, unwrap } from "./client";
import type { ApiResponse, ChatRequest, ChatResponse } from "../types/api";

/**
 * 에이전트 챗봇 — 어르신의 질병·복약·건강노트를 컨텍스트로 '온기' 에이전트가 답변.
 * body.save=true 면 대화 저장 + 수면·운동·복약·질병 지표 자동 추출.
 * ⚠️ 서버에 OPENAI_API_KEY 필요(미설정 시 500).
 */
export async function sendChat(
  elderId: number,
  body: ChatRequest,
): Promise<ChatResponse> {
  const res = await apiClient.post<ApiResponse<ChatResponse>>(
    `/elders/${elderId}/chat`,
    body,
  );
  return unwrap(res.data);
}
