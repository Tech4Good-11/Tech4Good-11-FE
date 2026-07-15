import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { STATUS_LABEL } from "../../utils/healthRules";
import type { HealthStatus } from "../../types";

// ── 상태 배지 (정상/주의/위험) ───────────────────
const statusClass: Record<HealthStatus, string> = {
  normal: "bg-success-light text-success-dark",
  caution: "bg-warning-light text-warning-dark",
  danger: "bg-danger-light text-danger-dark",
};
const dotClass: Record<HealthStatus, string> = {
  normal: "bg-success",
  caution: "bg-warning",
  danger: "bg-danger",
};

export function StatusBadge({
  status,
  showDot = true,
  className,
}: {
  status: HealthStatus;
  showDot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-caption font-semibold",
        statusClass[status],
        className,
      )}
    >
      {showDot && <span className={cn("h-1.5 w-1.5 rounded-full", dotClass[status])} />}
      {STATUS_LABEL[status]}
    </span>
  );
}

// ── 범용 배지 ────────────────────────────────────
type BadgeTone = "primary" | "gray";
const toneClass: Record<BadgeTone, string> = {
  primary: "bg-primary-50 text-primary-700",
  gray: "bg-gray-100 text-gray-600",
};

export function Badge({
  children,
  tone = "gray",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-semibold",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
