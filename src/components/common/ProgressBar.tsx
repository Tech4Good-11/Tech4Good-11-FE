import { cn } from "../../utils/cn";
import type { HealthStatus } from "../../types";

const fillClass: Record<HealthStatus | "primary", string> = {
  primary: "bg-primary-500",
  normal: "bg-success",
  caution: "bg-warning",
  danger: "bg-danger",
};

/** 진행률 바. 축/눈금 없는 심플 게이지. */
export function ProgressBar({
  value,
  tone = "primary",
  className,
  height = "md",
}: {
  value: number; // 0~100
  tone?: HealthStatus | "primary";
  className?: string;
  height?: "sm" | "md";
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full bg-gray-100",
        height === "sm" ? "h-2" : "h-3",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-slow ease-smooth",
          fillClass[tone],
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
