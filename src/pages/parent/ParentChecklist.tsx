import { Card, Header, Screen } from "../../components/common";
import { ChecklistCard } from "../../components/parent/ChecklistCard";
import { useApp } from "../../hooks/useApp";

export default function ParentChecklist() {
  const { state, dispatch } = useApp();
  const { checklist, parentHealthData } = state;
  const done = checklist.filter((c) => c.completed).length;
  const total = checklist.length;
  const allDone = done === total && total > 0;

  function recordedText(targetMetric?: string) {
    if (!targetMetric) return undefined;
    const m = parentHealthData.metrics[targetMetric as keyof typeof parentHealthData.metrics];
    if (!m) return undefined;
    return `${m.displayValue}${m.unit ? " " + m.unit : ""}`;
  }

  return (
    <>
      <Header senior title="건강 체크" subtitle={`${done} / ${total} 완료`} />
      <Screen>
        {/* 진행 상황 */}
        <Card padding="lg" className="mb-5">
          <div className="flex items-center justify-between">
            <p className="text-senior-body font-bold text-gray-900">
              {allDone ? "오늘 체크 완료 🎉" : "하나씩 기록해 볼까요?"}
            </p>
            <span className="text-body-lg font-bold text-primary-500">
              {total ? Math.round((done / total) * 100) : 0}%
            </span>
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-slow ease-smooth"
              style={{ width: `${total ? (done / total) * 100 : 0}%` }}
            />
          </div>
        </Card>

        {/* 체크리스트 */}
        <div className="space-y-3">
          {checklist.map((item) => (
            <ChecklistCard
              key={item.id}
              item={item}
              recordedText={recordedText(item.targetMetric)}
              onComplete={() =>
                dispatch({ type: "COMPLETE_CHECKLIST_ITEM", id: item.id })
              }
            />
          ))}
        </div>

        {/* 자녀 전달 안내 */}
        <div className="mt-6 flex items-center justify-center gap-2 rounded-card bg-primary-50 px-4 py-3">
          <span className="text-xl">📤</span>
          <p className="text-body font-medium text-primary-700">
            {allDone
              ? "오늘 기록이 자녀에게 전달되었어요"
              : "기록하면 자녀에게 바로 전달돼요"}
          </p>
        </div>
      </Screen>
    </>
  );
}
