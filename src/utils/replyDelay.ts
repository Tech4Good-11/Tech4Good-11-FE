/**
 * 채팅 답변 노출을 최소 이 시간만큼 늦춘다.
 * 응답이 즉시 도착해도 타이핑 인디케이터가 자연스럽게 보이도록 의도적으로 지연한다.
 * (실제 API 가 이미 오래 걸렸으면 추가 대기는 없다 — "최소" 지연)
 */
export const REPLY_MIN_MS = 1500;

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** `started`(Date.now()) 이후 최소 REPLY_MIN_MS 가 지나도록 남은 시간만큼 대기. */
export async function ensureReplyDelay(started: number): Promise<void> {
  const remaining = REPLY_MIN_MS - (Date.now() - started);
  if (remaining > 0) await sleep(remaining);
}
