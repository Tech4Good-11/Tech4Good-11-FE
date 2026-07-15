import { useMemo, useState } from "react";
import { Card, Header, Screen, StatusBadge } from "../../components/common";
import { LineChart, Timeline, type TimelineItem } from "../../components/child";
import { useApp } from "../../hooks/useApp";
import { METRIC_CONFIG } from "../../utils/healthRules";
import { shortDate } from "../../utils/format";
import { cn } from "../../utils/cn";
import type { MetricKey } from "../../types";

export default function ChildRecords() {
  const { state } = useApp();
  const { parentHealthDB } = state;

  // DB에 기록이 있는 지표만 노출
  const availableKeys = useMemo(() => {
    const keys = new Set<MetricKey>();
    parentHealthDB.forEach((r) => keys.add(r.metricKey));
    return Array.from(keys);
  }, [parentHealthDB]);

  const [selected, setSelected] = useState<MetricKey>(availableKeys[0] ?? "bloodPressure");
  const config = METRIC_CONFIG[selected];

  const rows = useMemo(
    () =>
      parentHealthDB
        .filter((r) => r.metricKey === selected)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [parentHealthDB, selected],
  );

  const chartData = rows.map((r) => ({ label: shortDate(r.date), value: r.value }));
  const latest = rows[rows.length - 1];
  const timeline: TimelineItem[] = [...rows]
    .reverse()
    .map((r) => ({
      id: r.id,
      date: r.date,
      title: `${config.label} ${r.value}${r.unit ? " " + r.unit : ""}`,
      status: r.status,
    }));

  return (
    <>
      <Header title="건강 기록" subtitle="지표별 변화 추이" />
      <Screen className="space-y-4">
        {/* 지표 선택 */}
        <div className="no-scrollbar -mx-[--app-gutter] flex gap-2 overflow-x-auto px-[--app-gutter]">
          {availableKeys.map((key) => (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-body font-semibold transition-colors duration-fast",
                selected === key
                  ? "bg-primary-500 text-white"
                  : "bg-white text-gray-500 shadow-card",
              )}
            >
              {METRIC_CONFIG[key].icon} {METRIC_CONFIG[key].label}
            </button>
          ))}
        </div>

        {/* 추이 차트 */}
        <Card padding="lg">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-caption text-gray-400">최근 7일 · {config.label}</p>
              {latest && (
                <p className="text-data-lg font-bold tabular-nums text-gray-900">
                  {latest.value}
                  <span className="ml-1 text-body font-medium text-gray-400">{config.unit}</span>
                </p>
              )}
            </div>
            {latest && <StatusBadge status={latest.status} />}
          </div>
          <LineChart data={chartData} unit={config.unit} />
        </Card>

        {/* 기록 타임라인 */}
        <Card padding="lg">
          <h2 className="mb-4 text-card-title font-bold text-gray-900">기록 이력</h2>
          <Timeline items={timeline} />
        </Card>
      </Screen>
    </>
  );
}
