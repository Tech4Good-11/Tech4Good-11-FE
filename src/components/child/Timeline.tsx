import { cn } from "../../utils/cn";
import { formatKoreanDate } from "../../utils/format";
import type { HealthStatus } from "../../types";

export interface TimelineItem {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  detail?: string;
  status?: HealthStatus;
}

const dotClass: Record<HealthStatus, string> = {
  normal: "bg-success",
  caution: "bg-warning",
  danger: "bg-danger",
};

/** 세로 타임라인 — 건강 기록 이력. */
export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative ml-2">
      {items.map((item, i) => (
        <li key={item.id} className="relative flex gap-4 pb-5 last:pb-0">
          {/* 세로선 */}
          {i < items.length - 1 && (
            <span className="absolute left-[5px] top-3 h-full w-px bg-gray-200" />
          )}
          {/* 점 */}
          <span
            className={cn(
              "relative z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full ring-4 ring-gray-100",
              item.status ? dotClass[item.status] : "bg-gray-300",
            )}
          />
          <div className="min-w-0 flex-1">
            <p className="text-caption text-gray-400">{formatKoreanDate(item.date)}</p>
            <p className="text-body-lg font-semibold text-gray-900">{item.title}</p>
            {item.detail && <p className="text-body text-gray-500">{item.detail}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
