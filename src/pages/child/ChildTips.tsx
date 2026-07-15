import { Header, Screen } from "../../components/common";
import { AIRecommendationCard } from "../../components/child";
import { useApp } from "../../hooks/useApp";

export default function ChildTips() {
  const { state } = useApp();
  return (
    <>
      <Header title="AI 케어팁" subtitle={`${state.parentProfile.name}님 맞춤 추천`} />
      <Screen className="space-y-3">
        <p className="px-1 text-body text-gray-500">
          부모님의 건강 데이터를 분석해 맞춤 케어팁을 제공해요.
        </p>
        {state.aiRecommendations.map((rec) => (
          <AIRecommendationCard key={rec.id} rec={rec} />
        ))}
      </Screen>
    </>
  );
}
