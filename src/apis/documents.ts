import { apiClient, unwrap } from "./client";
import type { ApiResponse, DocType, DocumentIntakeResponse } from "../types/api";

/** 진단서/처방전 업로드 (multipart, 서버 MOCK 처리) */
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
