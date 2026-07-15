import axios, { AxiosError } from "axios";
import type { ApiResponse } from "../types/api";

/**
 * 온기 API 클라이언트.
 * - baseURL: {VITE_API_BASE_URL}/api  (기본 http://localhost:8080/api)
 * - 세션 쿠키 인증(withCredentials)
 * - 응답 인터셉터: success===false 또는 네트워크 오류를 Error(message) 로 표준화
 */
export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

/** 서버가 표준화한 401(인증 필요) 여부 판별용 */
export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

apiClient.interceptors.response.use(
  (res) => {
    const body = res.data as ApiResponse<unknown> | undefined;
    if (body && body.success === false) {
      return Promise.reject(new ApiError(body.message || "요청에 실패했습니다.", res.status));
    }
    return res;
  },
  (err: AxiosError<ApiResponse<unknown>>) => {
    const status = err.response?.status;
    const message =
      err.response?.data?.message ??
      (status === 401 ? "인증이 필요합니다." : "네트워크 오류가 발생했습니다.");
    return Promise.reject(new ApiError(message, status));
  },
);

/** ApiResponse<T> 언랩 헬퍼 — data 를 꺼내 반환 */
export function unwrap<T>(body: ApiResponse<T>): T {
  return body.data as T;
}
