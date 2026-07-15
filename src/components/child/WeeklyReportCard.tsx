import { Card, ProgressBar } from "../common";
import type { WeeklySummary } from "../../types";

const trendIcon: Record<WeeklySummary["metricTrends"][number]["trend"], string> = {
  up: "▲",
  down: "▼",
  stable: "▬",
};

/** 주간 건강 리포트 카드 — 완료율 + 하이라이트 + 지표 변화. */
export function WeeklyReportCard({ report }: { report: WeeklySummary }) {
  return (
    <Card padding="lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-caption font-medium text-gray-400">주간 리포트</p>
          <p className="text-card-title font-bold text-gray-900">{report.weekLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-data-lg font-bold tabular-nums leading-none text-primary-500">
            {report.completionRate}
            <span className="text-body font-semibold">%</span>
          </p>
          <p className="text-caption text-gray-400">체크 완료율</p>
        </div>
      </div>

      <ProgressBar value={report.completionRate} className="mt-3" height="sm" />

      {/* 하이라이트 */}
      <ul className="mt-4 space-y-2">
        {report.highlights.map((h) => (
          <li key={h} className="flex gap-2 text-body text-gray-700">
            <span className="text-primary-400">•</span>
            <span>{h}</span>
          </li>
        ))}
      </ul>

      {/* 지표 변화 칩 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {report.metricTrends.map((t) => (
          <span
            key={t.metricKey}
            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-caption font-medium text-gray-600"
          >
            <span className="text-[10px] text-primary-500">{trendIcon[t.trend]}</span>
            {t.label} · {t.changeText}
          </span>
        ))}
      </div>
    </Card>
  );
}
