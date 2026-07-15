import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  /** 내부 여백 크기 */
  padding?: "sm" | "md" | "lg";
}

const paddingClass = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
} as const;

/** 모든 정보의 기본 그릇. 라운드 20 · 은은한 shadow · 넉넉한 여백. */
export function Card({ children, className, onClick, padding = "md" }: CardProps) {
  const interactive = Boolean(onClick);
  const classes = cn(
    "rounded-card bg-white shadow-card",
    paddingClass[padding],
    interactive &&
      "cursor-pointer transition-all duration-fast ease-smooth hover:shadow-card-hover active:scale-[0.99]",
    className,
  );

  if (interactive) {
    return (
      <button type="button" onClick={onClick} className={cn("block w-full text-left", classes)}>
        {children}
      </button>
    );
  }
  return <div className={classes}>{children}</div>;
}
