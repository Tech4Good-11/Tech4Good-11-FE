import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import type { UserRole } from "./types";
import { useApp } from "./hooks/useApp";

import RoleSelect from "./pages/RoleSelect";
import ParentLayout from "./pages/parent/ParentLayout";
import ParentHome from "./pages/parent/ParentHome";
import ParentChat from "./pages/parent/ParentChat";
import ParentChecklist from "./pages/parent/ParentChecklist";
import ChildLayout from "./pages/child/ChildLayout";
import ChildOnboarding from "./pages/child/ChildOnboarding";
import ChildHome from "./pages/child/ChildHome";
import ChildTips from "./pages/child/ChildTips";
import ChildAsk from "./pages/child/ChildAsk";
import ChildRecords from "./pages/child/ChildRecords";
import ChildMedical from "./pages/child/ChildMedical";
import ChildDB from "./pages/child/ChildDB";
import ChildSettings from "./pages/child/ChildSettings";

/** 역할이 맞을 때만 하위 화면 렌더, 아니면 역할 선택으로. */
function RequireRole({ role }: { role: UserRole }) {
  const { state } = useApp();
  if (state.currentRole !== role) return <Navigate to="/" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelect />} />

        {/* 부모 */}
        <Route path="/parent" element={<RequireRole role="parent" />}>
          {/* 대화는 풀스크린 (하단 네비 없음) */}
          <Route path="chat" element={<ParentChat />} />
          <Route element={<ParentLayout />}>
            <Route index element={<ParentHome />} />
            <Route path="checklist" element={<ParentChecklist />} />
          </Route>
        </Route>

        {/* 자녀 */}
        <Route path="/child" element={<RequireRole role="child" />}>
          {/* 풀스크린 (하단 네비 없음) */}
          <Route path="onboarding" element={<ChildOnboarding />} />
          <Route path="ask" element={<ChildAsk />} />
          <Route path="medical" element={<ChildMedical />} />
          <Route path="db" element={<ChildDB />} />
          {/* 대시보드 (하단 네비 있음) */}
          <Route element={<ChildLayout />}>
            <Route index element={<ChildHome />} />
            <Route path="tips" element={<ChildTips />} />
            <Route path="records" element={<ChildRecords />} />
            <Route path="settings" element={<ChildSettings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
