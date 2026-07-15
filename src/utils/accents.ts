/**
 * Accent 팔레트 — 블루-모노로 통일.
 * 프리미엄 헬스케어 원칙: 카드는 흰색, 색은 강조·아이콘 배경에만 제한적으로.
 * soft = 옅은 블루 배경(아이콘 원/포인트 pill), deep = Primary 블루(아이콘/텍스트 포인트).
 * 카테고리별로 색을 나누지 않는다 — 모든 키가 동일한 블루로 수렴한다.
 * 상태(정상/주의/위험)는 별도 status 컬러(success/warning/danger)만 사용.
 */
export type AccentKey =
  | "pink"
  | "purple"
  | "sky"
  | "mint"
  | "yellow"
  | "blue"
  | "rose"
  | "peach";

const BLUE = { soft: "#EBF3FE", deep: "#3182F6" }; // primary-50 / primary-500

export const ACCENT: Record<AccentKey, { soft: string; deep: string }> = {
  pink: BLUE,
  purple: BLUE,
  sky: BLUE,
  mint: BLUE,
  yellow: BLUE,
  blue: BLUE,
  rose: BLUE,
  peach: BLUE,
};
