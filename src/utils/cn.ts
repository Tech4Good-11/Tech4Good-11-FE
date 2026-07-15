/** 조건부 className 병합 유틸 (clsx 경량 대체) */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
