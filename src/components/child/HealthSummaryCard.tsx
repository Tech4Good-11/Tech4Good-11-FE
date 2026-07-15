import { Card, ProgressBar, StatusBadge } from "../common";
import { relativeTime } from "../../utils/format";
import type { HealthStatus } from "../../types";

const summary: Record<HealthStatus, { emoji: string; headline: string; tone: string }> = {
  normal: { emoji: "😊", headline: "전반적으로 건강해요", tone: "bg-success-light" },
  caution: { emoji: "🙂", headline: "몇 가지 살펴볼 게 있어요", tone: "bg-warning-light" },
  danger: { emoji: "😟", headline: "확인이 필요한 상태예요", tone: "bg-danger-light" },
};

/** 자녀 홈 상단 — 부모의 종합 건강 상태 요약 히어로 카드. */
export function HealthSummaryCard({
  status,
  name,
  updatedAt,
  done,
  total,
}: {
  status: HealthStatus;
  name: string;
  updatedAt: string;
  done: number;
  total: number;
}) {
  const s = summary[status];
  return (
    <Card padding="lg" className={s.tone}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-body font-medium text-gray-500">
            {name} 어머니 · {relativeTime(updatedAt)} 업데이트
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-4xl">{s.emoji}</span>
            <p className="text-card-title font-bold text-gray-900">{s.headline}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-caption font-medium text-gray-500">오늘 건강 체크</span>
          <span className="text-caption font-bold text-gray-700">
            {done}/{total} 완료
          </span>
        </div>
        <ProgressBar value={total ? (done / total) * 100 : 0} height="sm" />
      </div>
    </Card>
  );
}
