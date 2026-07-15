import { apiClient, unwrap } from "./client";
import type {
  ApiResponse,
  ConversationCreateRequest,
  ConversationDetailResponse,
  ConversationPurpose,
  ConversationSummaryResponse,
} from "../types/api";

export async function listConversations(
  elderId: number,
  params?: { purpose?: ConversationPurpose; page?: number; size?: number },
): Promise<ConversationSummaryResponse[]> {
  const res = await apiClient.get<ApiResponse<ConversationSummaryResponse[]>>(
    `/elders/${elderId}/conversations`,
    { params },
  );
  return unwrap(res.data) ?? [];
}

export async function getConversation(
  conversationId: number,
): Promise<ConversationDetailResponse> {
  const res = await apiClient.get<ApiResponse<ConversationDetailResponse>>(
    `/conversations/${conversationId}`,
  );
  return unwrap(res.data);
}

export async function createConversation(
  elderId: number,
  body: ConversationCreateRequest,
): Promise<ConversationSummaryResponse> {
  const res = await apiClient.post<ApiResponse<ConversationSummaryResponse>>(
    `/elders/${elderId}/conversations`,
    body,
  );
  return unwrap(res.data);
}
