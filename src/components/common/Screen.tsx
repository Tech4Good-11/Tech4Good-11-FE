import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

/**
 * 스크롤되는 화면 콘텐츠 영역.
 * 하단 네비게이션이 있을 때(withNav) 콘텐츠가 가려지지 않도록 여백을 준다.
 */
export function Screen({
  children,
  className,
  withNav = true,
}: {
  children: ReactNode;
  className?: string;
  withNav?: boolean;
}) {
  return (
    <main
      className={cn(
        "px-[--app-gutter] pt-2",
        withNav ? "pb-28" : "pb-10",
        className,
      )}
    >
      {children}
    </main>
  );
}
