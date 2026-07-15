import { Outlet } from "react-router-dom";
import { BottomNav, type NavItem } from "../../components/common";

const childNav: NavItem[] = [
  { to: "/child", label: "홈", icon: "🏠", end: true },
  { to: "/child/tips", label: "케어팁", icon: "💡" },
  { to: "/child/records", label: "건강기록", icon: "📈" },
  { to: "/child/settings", label: "설정", icon: "⚙️" },
];

/** 자녀 대시보드 레이아웃 — 하단 네비 4개. */
export default function ChildLayout() {
  return (
    <div className="app-shell relative min-h-dvh">
      <Outlet />
      <BottomNav items={childNav} />
    </div>
  );
}
