import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface HeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  onBack?: () => void;
  right?: ReactNode;
  /** 시니어(부모) 화면용 큰 타이틀 */
  senior?: boolean;
}

/** 화면 상단 헤더. 뒤로가기 · 타이틀 · 우측 액션. */
export function Header({ title, subtitle, onBack, right, senior }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-canvas/85 px-[--app-gutter] pb-3 pt-safe backdrop-blur-md">
      <div className="flex items-center gap-2 pt-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="뒤로"
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-200"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <div className="min-w-0 flex-1">
          {subtitle && (
            <p className="truncate text-caption font-medium text-gray-500">{subtitle}</p>
          )}
          <h1
            className={cn(
              "truncate font-bold text-gray-900",
              senior ? "text-senior-title" : "text-page-title",
            )}
          >
            {title}
          </h1>
        </div>
        {right && <div className="flex shrink-0 items-center">{right}</div>}
      </div>
    </header>
  );
}
