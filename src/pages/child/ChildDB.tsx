import { useNavigate } from "react-router-dom";
import { Card, Header, Screen } from "../../components/common";
import { DonutChart, StatusCard, type DonutSegment } from "../../components/child";
import { useApp } from "../../hooks/useApp";
import { METRIC_KEYS, STATUS_LABEL } from "../../utils/healthRules";
import type { HealthStatus } from "../../types";

const STATUS_COLOR: Record<HealthStatus, string> = {
  normal: "#15B76E",
  caution: "#FF8A00",
  danger: "#F04452",
};

export default function ChildDB() {
  const { state } = useApp();
  const navigate = useNavigate();
  const { metrics } = state.parentHealthData;

  // 상태 분포 집계
  const counts: Record<HealthStatus, number> = { normal: 0, caution: 0, danger: 0 };
  METRIC_KEYS.forEach((k) => {
    counts[metrics[k].status] += 1;
  });
  const segments: DonutSegment[] = (["normal", "caution", "danger"] as HealthStatus[])
    .filter((s) => counts[s] > 0)
    .map((s) => ({ label: STATUS_LABEL[s], value: counts[s], color: STATUS_COLOR[s] }));

  return (
    <>
      <Header title="부모 건강 DB" subtitle="전체 지표 한눈에" onBack={() => navigate("/child")} />
      <Screen withNav={false} className="space-y-4">
        {/* 상태 분포 도넛 */}
        <Card padding="lg">
          <h2 className="mb-2 text-card-title font-bold text-gray-900">지표 상태 분포</h2>
          <div className="flex items-center gap-6">
            <DonutChart
              segments={segments}
              centerValue={`${counts.normal}`}
              centerLabel={`/ ${METRIC_KEYS.length} 정상`}
            />
            <ul className="flex-1 space-y-2">
              {(["normal", "caution", "danger"] as HealthStatus[]).map((s) => (
                <li key={s} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-body text-gray-600">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: STATUS_COLOR[s] }}
                    />
                    {STATUS_LABEL[s]}
                  </span>
                  <span className="text-body font-bold tabular-nums text-gray-900">
                    {counts[s]}개
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* 전체 지표 */}
        <div>
          <h2 className="mb-2 px-1 text-body-lg font-bold text-gray-900">전체 지표</h2>
          <div className="grid grid-cols-2 gap-2">
            {METRIC_KEYS.map((k) => (
              <StatusCard key={k} metric={metrics[k]} />
            ))}
          </div>
        </div>
      </Screen>
    </>
  );
}
