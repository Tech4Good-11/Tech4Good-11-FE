import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ReactNode } from "react";
import { AsyncBoundary, Header, Screen } from "../../components/common";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { dashboardApi } from "../../apis";
import type { DashboardResponse } from "../../types/api";
import { ageFromBirth, GENDER_LABEL } from "../../utils/apiLabels";
import type { HealthStatus } from "../../types";
import { cn } from "../../utils/cn";

// ── 건강 상태 3단계 ────────────────────────────────
const STATUS_UI: Record<
  HealthStatus,
  { emoji: string; label: string; message: string; text: string; dot: string }
> = {
  normal: {
    emoji: "🟢",
    label: "좋음",
    message: "오늘도 건강 상태가 안정적입니다.",
    text: "text-success-dark",
    dot: "bg-success",
  },
  caution: {
    emoji: "🟠",
    label: "주의",
    message: "살펴봐야 할 부분이 있어요.",
    text: "text-warning-dark",
    dot: "bg-warning",
  },
  danger: {
    emoji: "🔴",
    label: "경고",
    message: "지금 바로 확인이 필요해요.",
    text: "text-danger-dark",
    dot: "bg-danger",
  },
};

/** 질병 상태로 종합 건강 상태 산출 (진행 중 질환이 있으면 주의). */
function overallStatus(d: DashboardResponse): HealthStatus {
  return d.diseases.some((dis) => dis.status === "active") ? "caution" : "normal";
}

/** 실제 데이터 기반 AI 건강 점수(0~100). */
function aiScore(d: DashboardResponse): number {
  let s = 100;
  s -= d.diseases.filter((x) => x.status === "active").length * 8;
  s -= d.diseases.filter((x) => x.status === "managed").length * 2;
  s -= d.medications.filter((m) => m.status === "stopped").length * 3;
  return Math.max(60, Math.min(100, s));
}

/** 오늘 건강 요약 지표 (질병·복약은 실데이터, 운동·수면은 AI 대화 수집 전이라 미기록). */
function summaryMetrics(d: DashboardResponse) {
  const activeMeds = d.medications.filter((m) => m.status === "active").length;
  const activeDiseases = d.diseases.filter((x) => x.status === "active").length;

  const disease: { value: string; status?: HealthStatus } =
    d.diseases.length === 0
      ? { value: "질환 없음", status: "normal" }
      : activeDiseases > 0
        ? { value: "주의 필요", status: "caution" }
        : { value: "안정적", status: "normal" };

  const medication: { value: string; status?: HealthStatus } =
    d.medications.length === 0
      ? { value: "복용 약 없음" }
      : { value: `${activeMeds}종 복용 중`, status: "normal" };

  return [
    { label: "주요 질병 상태", ...disease },
    { label: "오늘 복약", ...medication },
    { label: "오늘 운동", value: "기록 없음" as const },
    { label: "어젯밤 수면", value: "기록 없음" as const },
  ];
}

// ── 요약 지표 (박스 없이 타이포·여백만으로 구분) ────
function Metric({
  label,
  value,
  status,
}: {
  label: string;
  value: ReactNode;
  status?: HealthStatus;
}) {
  const muted = !status && (value === "기록 없음" || value === "복용 약 없음");
  return (
    <div>
      <p className="text-caption font-semibold text-gray-400">{label}</p>
      <div className="mt-1.5 flex items-center gap-1.5">
        {status && <span className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_UI[status].dot)} />}
        <p className={cn("text-body-lg font-bold leading-tight", muted ? "text-gray-300" : "text-gray-900")}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ── Hero 카드: 프로필 + 상태 + 요약을 하나로 통합 ───
function HeroCard({ d, onOthers }: { d: DashboardResponse; onOthers: () => void }) {
  const age = ageFromBirth(d.elder.birthDate);
  const status = overallStatus(d);
  const ui = STATUS_UI[status];
  const score = aiScore(d);
  const metrics = summaryMetrics(d);

  return (
    <div className="rounded-3xl bg-white p-7 shadow-soft">
      {/* 프로필 */}
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-50 text-3xl">
          👵
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-card-title font-bold leading-tight text-gray-900">{d.elder.name}</p>
          <p className="mt-0.5 text-body text-gray-400">
            {age != null && `${age}세`}
            {d.elder.gender && ` · ${GENDER_LABEL[d.elder.gender]}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onOthers}
          className="shrink-0 text-caption font-semibold text-gray-400 transition-transform active:scale-[0.96]"
        >
          다른 가족 보기 ›
        </button>
      </div>

      {/* 상태 및 AI 건강 점수 게이지바 */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          {/* 상태 표시 */}
          <div className="flex items-center gap-1.5 text-body-lg font-bold">
            <span className="text-[18px] leading-none">{ui.emoji}</span>
            <span className={ui.text}>{ui.label}</span>
          </div>

          {/* AI 건강 점수 */}
          <div className="flex items-baseline gap-1">
            <span className="text-caption font-semibold text-gray-400">AI 건강 점수</span>
            <span className="text-body-lg font-extrabold text-primary-500">{score}</span>
            <span className="text-caption font-bold text-gray-400">점</span>
          </div>
        </div>

        {/* 게이지바 */}
        <div className="relative mt-5 mb-2">
          {/* 트랙 */}
          <div className="h-3 w-full rounded-full bg-gray-100 p-0.5 shadow-inner overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-1000 ease-out relative"
              style={{ width: `${score}%` }}
            />
          </div>

          {/* 점수 핀 표시 */}
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out -translate-x-1/2"
            style={{ left: `${score}%` }}
          >
            <div className="h-7 w-7 rounded-full bg-white flex items-center justify-center shadow-card border-2 border-primary transition-colors duration-1000">
              <span className="text-[11px] font-extrabold text-primary-500">{score}</span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-body leading-relaxed text-gray-500">{ui.message}</p>
      </div>

      {/* 오늘 건강 요약(3순위) — 2×2 */}
      <div className="mt-8">
        <p className="text-body font-bold text-gray-900">오늘 건강 요약</p>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6">
          {metrics.map((m) => (
            <Metric key={m.label} label={m.label} value={m.value} status={m.status} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── AI 상담 카드 (가로형) ───────────────────────────
function AiChatCard({ lastMessage, onStart }: { lastMessage: string | null; onStart: () => void }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl bg-white p-6 shadow-soft">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-50 text-2xl">
        🤖
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-card-title font-bold text-gray-900">AI 상담</p>
        <p className="mt-1 line-clamp-1 text-body text-gray-500">
          {lastMessage ?? "아직 나눈 대화가 없어요."}
        </p>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="shrink-0 whitespace-nowrap rounded-2xl bg-primary-500 px-5 py-3 text-body font-bold text-white transition-transform active:scale-[0.97]"
      >
        상담 시작하기
      </button>
    </div>
  );
}

// ── 건강 체크리스트 카드 ────────────────────────────
const DEFAULT_CHECKLIST = [
  { id: "med", label: "약 복용" },
  { id: "water", label: "물 충분히 마시기" },
  { id: "walk", label: "산책하기" },
  { id: "sleep", label: "일찍 잠자리에 들기" },
];

function ChecklistCard({ items, onOpen }: { items: { id: string; label: string }[]; onOpen: () => void }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const done = items.filter((it) => checked[it.id]).length;
  const percent = items.length ? Math.round((done / items.length) * 100) : 0;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-soft">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-card-title font-bold text-gray-900">체크리스트</p>
        <button type="button" onClick={onOpen} className="shrink-0 text-body font-semibold text-primary-500">
          전체 보기 ›
        </button>
      </div>

      <div className="mt-1 flex items-center gap-3">
        <span className="text-body font-bold tabular-nums text-primary-500">{percent}%</span>
        <span className="text-caption text-gray-400">
          {done}/{items.length} 완료
        </span>
      </div>

      {/* 세로 1열로 배치하여 텍스트가 훼손되지 않도록 함 */}
      <ul className="mt-4 flex flex-col gap-y-1">
        {items.map((it) => {
          const on = !!checked[it.id];
          return (
            <li key={it.id}>
              <button
                type="button"
                onClick={() => setChecked((p) => ({ ...p, [it.id]: !p[it.id] }))}
                className="flex w-full items-center gap-2.5 py-1.5 text-left transition-transform active:scale-[0.98]"
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-caption font-bold transition-colors",
                    on ? "bg-primary-500 text-white" : "bg-gray-100 text-transparent",
                  )}
                >
                  ✓
                </span>
                <span className={cn("text-body font-medium", on ? "text-gray-300 line-through" : "text-gray-800")}>
                  {it.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function ElderDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const elderId = Number(useParams().elderId);
  const { data, loading, error, reload } = useApi(
    () => dashboardApi.getDashboard(elderId),
    [elderId],
  );
  const base = `/child/elders/${elderId}`;

  return (
    <>
      <Header title="건강 대시보드" onBack={() => navigate("/child")} />
      <Screen withNav={false} className="space-y-5">
        <p className="px-1 pt-1 text-page-title font-bold text-gray-900">
          안녕하세요, {user?.name ?? "보호자"}님
        </p>

        <AsyncBoundary loading={loading} error={error} data={data} onRetry={reload} loadingLabel="대시보드 불러오는 중…">
          {(d) => {
            const checklist =
              d.todayReminders.length > 0
                ? d.todayReminders.slice(0, 5).map((r) => ({ id: r.ruleCode, label: r.message }))
                : DEFAULT_CHECKLIST;
            const lastMessage = d.recentCheckins[0]?.summary ?? null;

            return (
              <>
                <HeroCard d={d} onOthers={() => navigate("/child")} />

                <AiChatCard lastMessage={lastMessage} onStart={() => navigate(`${base}/checkin`)} />
                <ChecklistCard items={checklist} onOpen={() => navigate(`${base}/checkin`)} />
              </>
            );
          }}
        </AsyncBoundary>
      </Screen>
    </>
  );
}
