import { Outlet } from "react-router-dom";
import { BottomNav, type NavItem } from "../../components/common";

const parentNav: NavItem[] = [
  { to: "/parent", label: "홈", icon: "🏠", end: true },
  { to: "/parent/chat", label: "대화", icon: "💬" },
  { to: "/parent/checklist", label: "건강체크", icon: "✅" },
];

/** 부모(시니어) 레이아웃 — 큰 하단 네비 3개. */
export default function ParentLayout() {
  return (
    <div className="app-shell relative min-h-dvh">
      <Outlet />
      <BottomNav items={parentNav} senior />
    </div>
  );
}
