/**
 * API 모드 플래그.
 * VITE_USE_MOCK=true 이면 실서버 대신 인메모리 목(mock) 구현을 사용한다.
 * (백엔드 없이 UI 개발/디자인용. .env.local 에서 로컬로만 켜는 것을 권장)
 */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
