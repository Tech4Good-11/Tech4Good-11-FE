import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AccentCard, AsyncBoundary, Button, EmptyState, Header, Screen } from "../../components/common";
import { useApi } from "../../hooks/useApi";
import { checkinApi } from "../../apis";
import { cn } from "../../utils/cn";
import { ACCENT } from "../../utils/accents";

export default function ElderCheckin() {
  const navigate = useNavigate();
  const elderId = Number(useParams().elderId);
  const { data, loading, error, reload } = useApi(() => checkinApi.getTodayCheckin(elderId), [elderId]);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setAnswer = (ruleCode: string, answer: string) =>
    setAnswers((prev) => ({ ...prev, [ruleCode]: answer }));

  async function submit() {
    const payload = Object.entries(answers).map(([ruleCode, answer]) => ({ ruleCode, answer }));
    if (payload.length === 0) return;
    setBusy(true);
    setSubmitError(null);
    try {
      await checkinApi.submitCheckin(elderId, { answers: payload });
      setDone(true);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "제출에 실패했어요.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="app-shell min-h-dvh">
        <Header title="안부 확인" onBack={() => navigate(`/child/elders/${elderId}`)} />
        <Screen withNav={false}>
          <EmptyState
            icon="✅"
            title="안부 확인을 완료했어요"
            description="응답이 저장되었습니다."
            action={<Button size="md" onClick={() => navigate(`/child/elders/${elderId}`)}>대시보드로</Button>}
          />
        </Screen>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-dvh">
      <Header title="안부 확인" subtitle="오늘의 문진" onBack={() => navigate(`/child/elders/${elderId}`)} />
      <Screen withNav={false} className="space-y-4">
        <AsyncBoundary loading={loading} error={error} data={data} onRetry={reload} loadingLabel="문진 불러오는 중…">
          {(items) =>
            items.length === 0 ? (
              <EmptyState icon="🌤️" title="오늘 문진 항목이 없어요" description="등록된 리마인드가 없거나 오늘 일정이 없습니다." />
            ) : (
              <>
                {items.map((q, i) => (
                  <AccentCard key={q.ruleCode} accent="purple" emoji={["💬", "💧", "🍚", "🩺"][i % 4]} title={q.question} subtitle={q.scheduledTimes.join(", ") || undefined}>
                    {q.expectedResponse === "yes_no" ? (
                      <div className="flex gap-2.5">
                        {[
                          { v: "yes", label: "네 👍" },
                          { v: "no", label: "아니요" },
                        ].map((opt) => {
                          const active = answers[q.ruleCode] === opt.v;
                          return (
                            <button
                              key={opt.v}
                              onClick={() => setAnswer(q.ruleCode, opt.v)}
                              className={cn(
                                "flex-1 rounded-2xl py-4 text-body-lg font-bold transition-transform active:scale-[0.97]",
                                !active && "bg-canvas text-gray-500",
                              )}
                              style={active ? { backgroundColor: ACCENT.purple.soft, color: ACCENT.purple.deep } : undefined}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <input
                        value={answers[q.ruleCode] ?? ""}
                        onChange={(e) => setAnswer(q.ruleCode, e.target.value)}
                        placeholder="답변을 입력해 주세요"
                        className="w-full rounded-2xl bg-canvas px-4 py-3 text-body-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      />
                    )}
                  </AccentCard>
                ))}

                {submitError && (
                  <p className="rounded-input bg-danger-light px-4 py-3 text-body font-medium text-danger-dark">{submitError}</p>
                )}

                <Button fullWidth onClick={submit} disabled={busy || Object.keys(answers).length === 0}>
                  {busy ? "제출 중…" : "안부 응답 제출"}
                </Button>
              </>
            )
          }
        </AsyncBoundary>
      </Screen>
    </div>
  );
}
