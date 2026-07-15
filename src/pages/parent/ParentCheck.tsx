import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Header } from "../../components/common";
import { ChatPanel } from "../../components/parent/ChatPanel";
import { useApp } from "../../hooks/useApp";
import { cn } from "../../utils/cn";

type Tab = "survey" | "chat";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "survey", label: "건강 체크", icon: "✅" },
  { key: "chat", label: "AI 대화", icon: "💬" },
];

/**
 * 부모(시니어) 통합 화면.
 * 상단 전환탭으로 [건강 체크 설문 | AI 대화]를 오간다.
 * - 건강 체크: 큰 카드를 한 장씩 넘기며 예/아니요로 답하는 설문(SurveyPanel).
 * - AI 대화: 기존 채팅(ChatPanel).
 */
export default function ParentCheck() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>(params.get("tab") === "chat" ? "chat" : "survey");

  function switchTab(next: Tab) {
    setTab(next);
    setParams({ tab: next }, { replace: true });
  }

  return (
    <div className="mx-auto flex h-dvh max-w-app flex-col bg-canvas">
      <Header senior title="오늘 건강 체크" onBack={() => navigate("/")} />

      {/* 상단 전환탭 (segmented control) */}
      <div className="px-[--app-gutter] pb-3">
        <div className="flex gap-1 rounded-full bg-gray-100 p-1.5">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => switchTab(t.key)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-full py-3 text-body-lg font-bold transition-colors duration-fast",
                  active ? "bg-white text-primary-600 shadow-card" : "text-gray-400",
                )}
              >
                <span className="text-xl">{t.icon}</span>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 패널 */}
      {tab === "survey" ? (
        <SurveyPanel onGoChat={() => switchTab("chat")} />
      ) : (
        <ChatPanel onGoChecklist={() => switchTab("survey")} />
      )}
    </div>
  );
}

/**
 * 카드형 건강 체크 설문.
 * 큰 질문 카드를 한 번에 하나씩 보여주고, 답하면 다음 카드로 넘어간다.
 * "네"로 답하면 해당 체크리스트 항목이 완료 처리되어 건강 데이터에 반영된다.
 */
function SurveyPanel({ onGoChat }: { onGoChat: () => void }) {
  const { state, dispatch } = useApp();
  const items = state.checklist;
  const total = items.length;

  // 처음 미완료 항목부터 시작(전부 완료면 완료 화면).
  const [index, setIndex] = useState(() => {
    const firstIncomplete = items.findIndex((i) => !i.completed);
    return firstIncomplete === -1 ? total : firstIncomplete;
  });

  function answer(yes: boolean) {
    const item = items[index];
    if (item && yes) dispatch({ type: "COMPLETE_CHECKLIST_ITEM", id: item.id });
    setIndex((i) => i + 1);
  }

  // ── 완료 화면 ──────────────────────────────────
  if (index >= total) {
    const done = items.filter((c) => c.completed).length;
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-[--app-gutter] pb-8">
        <div className="animate-scale-in flex flex-1 flex-col items-center justify-center text-center">
          <span className="text-7xl">🎉</span>
          <p className="mt-6 text-senior-title font-bold text-gray-900">
            오늘 건강 체크를 마쳤어요
          </p>
          <p className="mt-3 text-senior-body text-gray-500">
            {total}개 중 <span className="font-bold text-primary-600">{done}개</span>를 챙기셨어요
          </p>

          <div className="mt-8 flex w-full items-center justify-center gap-2 rounded-3xl bg-primary-50 px-5 py-4">
            <span className="text-2xl">📤</span>
            <p className="text-body-lg font-semibold text-primary-700">
              기록이 자녀에게 전달되었어요
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Button
            size="senior"
            fullWidth
            leftIcon={<span className="text-2xl">💬</span>}
            onClick={onGoChat}
          >
            AI와 이야기하기
          </Button>
          <Button size="senior" variant="secondary" fullWidth onClick={() => setIndex(0)}>
            다시 확인하기
          </Button>
        </div>
      </div>
    );
  }

  // ── 질문 카드 (한 장씩) ────────────────────────
  const item = items[index];
  const step = index + 1;

  return (
    <div className="flex min-h-0 flex-1 flex-col px-[--app-gutter] pb-8">
      {/* 진행 상황 */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-body font-semibold text-gray-500">
          <span>
            {step} <span className="text-gray-300">/ {total}</span>
          </span>
          <span className="text-primary-500">{Math.round((index / total) * 100)}%</span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-primary-500 transition-all duration-slow ease-smooth"
            style={{ width: `${(index / total) * 100}%` }}
          />
        </div>
      </div>

      {/* 큰 질문 카드 — key로 카드 전환 애니메이션 재생 */}
      <div key={item.id} className="flex flex-1 flex-col items-center justify-center">
        <div className="animate-scale-in w-full rounded-3xl bg-white p-8 text-center shadow-soft">
          <span className="text-7xl">{item.icon}</span>
          <p className="mt-6 text-senior-title font-bold leading-snug text-gray-900">
            {item.question ?? item.title}
          </p>
          {item.description && (
            <p className="mt-3 text-senior-body leading-relaxed text-gray-500">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* 예 / 아니요 */}
      <div className="mt-6 space-y-3">
        <Button
          size="senior"
          fullWidth
          leftIcon={<span className="text-2xl">👍</span>}
          onClick={() => answer(true)}
        >
          네, 했어요
        </Button>
        <Button size="senior" variant="secondary" fullWidth onClick={() => answer(false)}>
          아직 안 했어요
        </Button>
      </div>
    </div>
  );
}
