import { useNavigate } from "react-router-dom";
import { Button, Card, Header, Screen } from "../../components/common";
import { useApp } from "../../hooks/useApp";
import type { HealthStatus } from "../../types";

const statusMessage: Record<HealthStatus, { emoji: string; text: string; tone: string }> = {
  normal: { emoji: "😊", text: "오늘 컨디션이 좋으세요!", tone: "text-success-dark" },
  caution: { emoji: "🙂", text: "조금 신경 쓸 부분이 있어요", tone: "text-warning-dark" },
  danger: { emoji: "😟", text: "건강을 꼭 확인해 주세요", tone: "text-danger-dark" },
};

export default function ParentHome() {
  const { state } = useApp();
  const navigate = useNavigate();
  const { name } = state.parentProfile;

  const done = state.checklist.filter((c) => c.completed).length;
  const total = state.checklist.length;
  const allDone = done === total && total > 0;
  const status = statusMessage[state.parentHealthData.overallStatus];

  const today = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <>
      <Header senior subtitle={today} title={`${name}님, 안녕하세요`} />
      <Screen>
        {/* 오늘의 상태 */}
        <Card padding="lg" className="mb-4">
          <p className="text-body-lg text-gray-500">오늘의 건강</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-5xl">{status.emoji}</span>
            <p className={`text-senior-title font-bold ${status.tone}`}>{status.text}</p>
          </div>
        </Card>

        {/* 오늘 할 일 */}
        <Card
          padding="lg"
          className="mb-8"
          onClick={() => navigate("/parent/checklist")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-lg text-gray-500">오늘 할 일</p>
              <p className="mt-1 text-senior-title font-bold text-gray-900">
                {allDone ? "모두 마쳤어요 🎉" : `${total}개 중 ${done}개 완료`}
              </p>
            </div>
            <span className="text-3xl text-gray-300">›</span>
          </div>
          {/* 진행률 바 */}
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-slow ease-smooth"
              style={{ width: `${total ? (done / total) * 100 : 0}%` }}
            />
          </div>
        </Card>

        {/* 가장 중요한 행동 — 화면 하단에 크게 */}
        <div className="space-y-3">
          <Button
            size="senior"
            fullWidth
            leftIcon={<span className="text-2xl">💬</span>}
            onClick={() => navigate("/parent/chat")}
          >
            AI와 이야기하기
          </Button>
          <Button
            size="senior"
            variant="secondary"
            fullWidth
            leftIcon={<span className="text-2xl">✅</span>}
            onClick={() => navigate("/parent/checklist")}
          >
            건강 체크하기
          </Button>
        </div>
      </Screen>
    </>
  );
}
