import { useNavigate } from "react-router-dom";
import { Card, Header, Screen } from "../../components/common";
import {
  AIRecommendationCard,
  HealthSummaryCard,
  StatusCard,
  WeeklyReportCard,
} from "../../components/child";
import { useApp } from "../../hooks/useApp";
import type { MetricKey } from "../../types";

const KEY_METRICS: MetricKey[] = ["bloodPressure", "bloodSugar", "steps", "sleep"];

export default function ChildHome() {
  const { state } = useApp();
  const navigate = useNavigate();
  const { parentProfile: p, parentHealthData, checklist, weeklyReport } = state;
  const done = checklist.filter((c) => c.completed).length;
  const unread = state.notifications.filter((n) => !n.read).length;
  const topTip = state.aiRecommendations[0];

  const links = [
    { to: "/child/ask", icon: "❓", label: "AI 질문" },
    { to: "/child/medical", icon: "🏥", label: "병원 기록" },
    { to: "/child/db", icon: "🗂️", label: "건강 DB" },
  ];

  return (
    <>
      <Header
        subtitle={`${p.name} · ${p.relation}`}
        title="건강 대시보드"
        right={
          <button
            onClick={() => navigate("/child/settings")}
            className="relative text-2xl"
            aria-label="알림"
          >
            🔔
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
        }
      />
      <Screen className="space-y-4">
        <HealthSummaryCard
          status={parentHealthData.overallStatus}
          name={p.name}
          updatedAt={parentHealthData.updatedAt}
          done={done}
          total={checklist.length}
        />

        {/* 주요 지표 */}
        <div>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-body-lg font-bold text-gray-900">주요 지표</h2>
            <button
              onClick={() => navigate("/child/db")}
              className="text-caption font-semibold text-primary-500"
            >
              전체 보기 ›
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {KEY_METRICS.map((key) => (
              <StatusCard
                key={key}
                metric={parentHealthData.metrics[key]}
                onClick={() => navigate("/child/records")}
              />
            ))}
          </div>
        </div>

        <WeeklyReportCard report={weeklyReport} />

        {/* AI 케어팁 미리보기 */}
        {topTip && (
          <div>
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-body-lg font-bold text-gray-900">오늘의 AI 케어팁</h2>
              <button
                onClick={() => navigate("/child/tips")}
                className="text-caption font-semibold text-primary-500"
              >
                더 보기 ›
              </button>
            </div>
            <AIRecommendationCard rec={topTip} />
          </div>
        )}

        {/* 바로가기 */}
        <div className="grid grid-cols-3 gap-2">
          {links.map((l) => (
            <Card key={l.to} padding="sm" onClick={() => navigate(l.to)}>
              <p className="text-center text-2xl">{l.icon}</p>
              <p className="mt-1 text-center text-caption font-bold text-gray-700">{l.label}</p>
            </Card>
          ))}
        </div>
      </Screen>
    </>
  );
}
