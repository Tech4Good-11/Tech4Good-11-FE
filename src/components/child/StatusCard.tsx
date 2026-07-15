import { Card, StatusBadge } from "../common";
import { relativeTime } from "../../utils/format";
import type { HealthMetric } from "../../types";

/** 단일 건강 지표 카드 — 큰 숫자 데이터 중심. */
export function StatusCard({
  metric,
  onClick,
}: {
  metric: HealthMetric;
  onClick?: () => void;
}) {
  return (
    <Card padding="md" onClick={onClick}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-body font-medium text-gray-500">
          <span className="text-base">{metricIcon(metric.key)}</span>
          {metric.label}
        </span>
        <StatusBadge status={metric.status} showDot={false} />
      </div>
      <p className="mt-2 text-data-lg font-bold tabular-nums leading-none text-gray-900">
        {metric.displayValue}
        {metric.unit && (
          <span className="ml-1 text-body font-medium text-gray-400">{metric.unit}</span>
        )}
      </p>
      <p className="mt-1.5 text-caption text-gray-400">{relativeTime(metric.updatedAt)}</p>
    </Card>
  );
}

function metricIcon(key: HealthMetric["key"]): string {
  const map: Record<string, string> = {
    bloodPressure: "🩺",
    bloodSugar: "🩸",
    heartRate: "❤️",
    sleep: "😴",
    weight: "⚖️",
    mood: "🙂",
    steps: "🚶",
    medication: "💊",
  };
  return map[key] ?? "•";
}
