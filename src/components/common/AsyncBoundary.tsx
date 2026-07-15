import type { ReactNode } from "react";
import { Button } from "./Button";

/** 로딩 스피너 */
export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
      <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-primary-500" />
      {label && <p className="text-body">{label}</p>}
    </div>
  );
}

/** 에러 상태 + 재시도 */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="text-4xl">⚠️</span>
      <p className="text-body-lg font-semibold text-gray-700">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="md" onClick={onRetry}>
          다시 시도
        </Button>
      )}
    </div>
  );
}

/** 빈 상태 */
export function EmptyState({
  icon = "📭",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="text-body-lg font-semibold text-gray-700">{title}</p>
      {description && <p className="text-body text-gray-400">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/**
 * 로딩/에러/데이터 상태를 일관되게 렌더.
 * data 가 준비되면 children(data) 렌더.
 */
export function AsyncBoundary<T>({
  loading,
  error,
  data,
  onRetry,
  loadingLabel,
  children,
}: {
  loading: boolean;
  error: string | null;
  data: T | null;
  onRetry?: () => void;
  loadingLabel?: string;
  children: (data: T) => ReactNode;
}) {
  if (loading && data == null) return <Spinner label={loadingLabel} />;
  if (error && data == null) return <ErrorState message={error} onRetry={onRetry} />;
  if (data == null) return null;
  return <>{children(data)}</>;
}
