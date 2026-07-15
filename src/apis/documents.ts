import { apiClient, unwrap } from "./client";
import type { ApiResponse, DocType, DocumentIntakeResponse } from "../types/api";

/**
 * 진단서/처방전 업로드 (multipart).
 * 서버가 OpenAI Vision 으로 이미지를 판독해 약품/질병을 추출·등록한다.
 * ⚠️ OPENAI_API_KEY 필요(미설정 시 500), 판독 실패 시 400.
 */
export async function uploadDocument(
  elderId: number,
  file: File,
  docType: DocType,
): Promise<DocumentIntakeResponse> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("docType", docType);
  const res = await apiClient.post<ApiResponse<DocumentIntakeResponse>>(
    `/elders/${elderId}/documents`,
    fd,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return unwrap(res.data);
}
