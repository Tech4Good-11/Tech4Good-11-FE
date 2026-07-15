import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import type { AccentKey } from "../../utils/accents";

/**
 * 원형 옅은-블루 배경 안에 배치된 아이콘(이모지).
 * 블루-모노 원칙상 카테고리와 무관하게 항상 동일한 Primary 톤을 쓴다.
 * (accent prop 은 하위호환용으로 받되 시각적으로 무시한다.)
 */
export function AccentIcon({
  emoji,
  size = "md",
}: {
  accent?: AccentKey;
  emoji: ReactNode;
  size?: "md" | "lg";
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary-50",
        size === "lg" ? "h-16 w-16 text-3xl" : "h-12 w-12 text-2xl",
      )}
    >
      {emoji}
    </span>
  );
}

/**
 * 프리미엄 헬스케어 카드.
 * 흰 배경 · 라운드 24 · 넉넉한 여백 · 매우 은은한 그림자 · 원형 블루 아이콘.
 */
export function AccentCard({
  accent,
  emoji,
  title,
  subtitle,
  right,
  onClick,
  className,
  children,
}: {
  accent?: AccentKey;
  emoji: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}) {
  const body = (
    <>
      <div className="flex items-center gap-4">
        <AccentIcon accent={accent} emoji={emoji} />
        <div className="min-w-0 flex-1">
          <p className="text-card-title font-bold leading-tight text-gray-900">{title}</p>
          {subtitle && <p className="mt-0.5 text-body text-gray-400">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children && <div className="mt-5">{children}</div>}
    </>
  );

  const classes = cn(
    "rounded-3xl bg-white p-6 shadow-soft",
    onClick &&
      "cursor-pointer transition-transform duration-fast ease-smooth active:scale-[0.99]",
    className,
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn("block w-full text-left", classes)}>
        {body}
      </button>
    );
  }
  return <div className={classes}>{body}</div>;
}

/**
 * 빠른 기능 타일(바로가기).
 * 카드 자체는 흰색 · 라운드 24 · 은은한 그림자, 아이콘만 옅은 블루 원형.
 */
export function CategoryTile({
  emoji,
  label,
  onClick,
}: {
  accent?: AccentKey;
  emoji: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-3 rounded-3xl bg-white p-4 shadow-soft transition-transform duration-fast ease-smooth active:scale-[0.96]"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-2xl">
        {emoji}
      </span>
      <span className="text-body font-bold text-gray-800">{label}</span>
    </button>
  );
}
