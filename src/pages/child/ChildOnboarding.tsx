import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Header } from "../../components/common";
import { cn } from "../../utils/cn";
import { useApp } from "../../hooks/useApp";
import { CHRONIC_DISEASES } from "../../data/mockData";

/**
 * 자녀 온보딩 — ① 가족(부모) 선택 → ② 부모 기저질환 선택 → 가족 홈.
 * 선택한 기저질환은 전역 상태로 저장되어 AI 추천의 기본 데이터가 된다.
 */
export default function ChildOnboarding() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<string[]>(
    state.parentProfile.chronicDiseaseIds,
  );

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function finish() {
    dispatch({ type: "SET_CHRONIC_DISEASES", diseaseIds: selected });
    dispatch({ type: "COMPLETE_ONBOARDING" });
    navigate("/child");
  }

  const parent = state.parentProfile;

  return (
    <div className="app-shell min-h-dvh">
      <Header
        title={step === 1 ? "가족 선택" : "기저질환 선택"}
        subtitle={`${step} / 2`}
        onBack={step === 1 ? () => navigate("/") : () => setStep(1)}
      />

      {step === 1 ? (
        <main className="px-[--app-gutter] pb-10 pt-2">
          <h2 className="mb-1 text-page-title font-bold text-gray-900">
            누구의 건강을 관리하나요?
          </h2>
          <p className="mb-6 text-body-lg text-gray-500">관리할 가족을 선택해 주세요.</p>

          <Card onClick={() => setStep(2)}>
            <div className="flex items-center gap-4">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-sheet text-2xl text-white"
                style={{ backgroundColor: parent.avatarColor }}
              >
                {parent.name.slice(0, 1)}
              </span>
              <div className="flex-1">
                <p className="text-card-title font-bold text-gray-900">
                  {parent.name} · {parent.relation}
                </p>
                <p className="text-body text-gray-500">
                  {parent.age}세 · {parent.gender}
                </p>
              </div>
              <span className="text-gray-300">›</span>
            </div>
          </Card>
        </main>
      ) : (
        <main className="px-[--app-gutter] pb-32 pt-2">
          <h2 className="mb-1 text-page-title font-bold text-gray-900">
            {parent.name}님의 기저질환
          </h2>
          <p className="mb-6 text-body-lg text-gray-500">
            해당하는 질환을 모두 선택해 주세요.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {CHRONIC_DISEASES.map((d) => {
              const active = selected.includes(d.id);
              return (
                <button
                  key={d.id}
                  onClick={() => toggle(d.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-card border-2 p-4 text-left transition-all duration-fast ease-smooth active:scale-[0.98]",
                    active
                      ? "border-primary-500 bg-primary-50"
                      : "border-transparent bg-white shadow-card",
                  )}
                >
                  <span className="text-2xl">{d.icon}</span>
                  <span
                    className={cn(
                      "text-body-lg font-semibold",
                      active ? "text-primary-700" : "text-gray-800",
                    )}
                  >
                    {d.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-app bg-gradient-to-t from-gray-100 to-transparent px-[--app-gutter] pb-safe pt-4">
            <div className="pb-4">
              <Button fullWidth onClick={finish} disabled={selected.length === 0}>
                {selected.length > 0
                  ? `${selected.length}개 선택 · 시작하기`
                  : "질환을 선택해 주세요"}
              </Button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
