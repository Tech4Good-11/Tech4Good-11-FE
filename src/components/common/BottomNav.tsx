import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  /** 정확히 이 경로일 때만 활성 (index 경로용) */
  end?: boolean;
}

/** 하단 고정 네비게이션. app-shell 폭(max 480)에 맞춰 중앙 고정. */
export function BottomNav({
  items,
  senior,
}: {
  items: NavItem[];
  senior?: boolean;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-app border-t border-gray-200 bg-white/95 pb-safe backdrop-blur">
      <ul className="flex">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 transition-colors duration-fast",
                  senior ? "py-3" : "py-2.5",
                  isActive ? "text-primary-500" : "text-gray-400",
                )
              }
            >
              <span className={senior ? "text-2xl" : "text-xl"}>{item.icon}</span>
              <span
                className={cn(
                  "font-semibold",
                  senior ? "text-body" : "text-caption",
                )}
              >
                {item.label}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
