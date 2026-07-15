import { useNavigate } from "react-router-dom";
import { useApp } from "../hooks/useApp";

/** 앱 진입 — "누가 사용하시나요?" 부모/자녀 역할 분기. */
export default function RoleSelect() {
  const { dispatch } = useApp();
  const navigate = useNavigate();

  function chooseParent() {
    dispatch({ type: "SET_ROLE", role: "parent" });
    navigate("/parent"); // 온보딩 없이 즉시 홈
  }

  function chooseChild() {
    // 보호자 화면은 온기 API + 세션 인증 (RequireAuth 가 로그인 여부 처리)
    navigate("/child");
  }

  return (
    <div className="app-shell flex min-h-dvh flex-col px-[--app-gutter] pb-10 pt-safe">
      <div className="pt-16">
        <p className="text-body-lg font-semibold text-primary-500">마음이음</p>
        <h1 className="mt-2 text-display font-bold leading-tight text-gray-900">
          누가
          <br />
          사용하시나요?
        </h1>
        <p className="mt-3 text-body-lg text-gray-500">
          역할에 맞는 화면으로 안내해 드릴게요.
        </p>
      </div>

      <div className="mt-12 space-y-4">
        <button
          onClick={chooseParent}
          className="w-full rounded-card bg-white p-6 text-left shadow-card transition-all duration-fast ease-smooth hover:shadow-card-hover active:scale-[0.99]"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-sheet bg-primary-50 text-4xl">
              👵
            </span>
            <div>
              <p className="text-senior-title font-bold text-gray-900">부모님</p>
              <p className="mt-0.5 text-body-lg text-gray-500">건강 기록하기</p>
            </div>
          </div>
        </button>

        <button
          onClick={chooseChild}
          className="w-full rounded-card bg-white p-6 text-left shadow-card transition-all duration-fast ease-smooth hover:shadow-card-hover active:scale-[0.99]"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-sheet bg-primary-50 text-4xl">
              🧑
            </span>
            <div>
              <p className="text-card-title font-bold text-gray-900">자녀</p>
              <p className="mt-0.5 text-body text-gray-500">부모님 건강 관리하기</p>
            </div>
          </div>
        </button>
      </div>

      <p className="mt-auto pt-8 text-center text-caption text-gray-400">
        가족이 하나의 건강 데이터를 함께 봅니다
      </p>
    </div>
  );
}
