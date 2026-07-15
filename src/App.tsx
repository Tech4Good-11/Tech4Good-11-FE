import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useApp } from "./hooks/useApp";
import { useAuth } from "./hooks/useAuth";
import { Spinner } from "./components/common";

import RoleSelect from "./pages/RoleSelect";

// 부모 (로컬 mock)
import ParentLayout from "./pages/parent/ParentLayout";
import ParentHome from "./pages/parent/ParentHome";
import ParentChat from "./pages/parent/ParentChat";
import ParentChecklist from "./pages/parent/ParentChecklist";

// 인증
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// 자녀 (보호자) — 온기 API
import ElderList from "./pages/child/ElderList";
import ElderAdd from "./pages/child/ElderAdd";
import ElderDashboard from "./pages/child/ElderDashboard";
import ElderHealthInfo from "./pages/child/ElderHealthInfo";
import ElderCheckin from "./pages/child/ElderCheckin";
import ElderGuardians from "./pages/child/ElderGuardians";

/** 부모(로컬 역할) 가드 */
function RequireParent() {
  const { state } = useApp();
  if (state.currentRole !== "parent") return <Navigate to="/" replace />;
  return <Outlet />;
}

/** 보호자(세션 인증) 가드 */
function RequireAuth() {
  const { user, ready } = useAuth();
  if (!ready) {
    return (
      <div className="app-shell min-h-dvh">
        <Spinner label="불러오는 중…" />
      </div>
    );
  }
  if (!user) return <Navigate to="/child/login" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelect />} />

        {/* 부모 (로컬 mock, 변경 없음) */}
        <Route path="/parent" element={<RequireParent />}>
          <Route path="chat" element={<ParentChat />} />
          <Route element={<ParentLayout />}>
            <Route index element={<ParentHome />} />
            <Route path="checklist" element={<ParentChecklist />} />
          </Route>
        </Route>

        {/* 자녀(보호자) 인증 */}
        <Route path="/child/login" element={<Login />} />
        <Route path="/child/signup" element={<Signup />} />

        {/* 자녀(보호자) — 온기 API */}
        <Route path="/child" element={<RequireAuth />}>
          <Route index element={<ElderList />} />
          <Route path="add" element={<ElderAdd />} />
          <Route path="elders/:elderId" element={<ElderDashboard />} />
          <Route path="elders/:elderId/health" element={<ElderHealthInfo />} />
          <Route path="elders/:elderId/checkin" element={<ElderCheckin />} />
          <Route path="elders/:elderId/guardians" element={<ElderGuardians />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
