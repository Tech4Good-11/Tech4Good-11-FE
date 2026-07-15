/**
 * 부모(시니어)↔자녀(보호자) 로컬 브릿지.
 *
 * 부모 앱에는 백엔드 로그인이 없으므로(어르신은 서버 계정 없음), 부모가 오늘 체크한
 * 현황을 localStorage 에 저장하고 자녀 대시보드가 이를 읽어 "부모님 오늘 체크 현황"을 보여준다.
 *
 * ⚠️ localStorage 는 **같은 브라우저·같은 기기**에서만 공유된다(데모용). 부모폰/자녀폰처럼
 *    기기가 다르면 동기화되지 않는다 — 실제 크로스 기기 동기화는 백엔드가 필요하다.
 */
import type { ChecklistItem } from "../types";

export const PARENT_CHECK_KEY = "ongi_parent_check_v1";

export interface ParentCheckItem {
  id: string;
  title: string;
  icon: string;
  completed: boolean;
  completedAt: string | null;
}
export interface ParentCheckSnapshot {
  date: string; // YYYY-MM-DD
  items: ParentCheckItem[];
  updatedAt: string; // ISO
}

const todayStr = () => new Date().toISOString().slice(0, 10);

/** 부모 체크리스트를 오늘 날짜 스냅샷으로 저장(미러링). */
export function saveParentChecklist(items: ChecklistItem[]): void {
  try {
    const snapshot: ParentCheckSnapshot = {
      date: todayStr(),
      items: items.map((it) => ({
        id: it.id,
        title: it.title,
        icon: it.icon,
        completed: it.completed,
        completedAt: it.completedAt ?? null,
      })),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(PARENT_CHECK_KEY, JSON.stringify(snapshot));
  } catch {
    // 저장 실패(프라이빗 모드·용량초과 등)는 조용히 무시 — UI 흐름을 막지 않는다.
  }
}

/** 자녀 화면에서 부모 오늘 체크 현황 읽기. 오늘 데이터가 아니면(어제 기록 등) null. */
export function readParentCheckSnapshot(): ParentCheckSnapshot | null {
  try {
    const raw = localStorage.getItem(PARENT_CHECK_KEY);
    if (!raw) return null;
    const snapshot = JSON.parse(raw) as ParentCheckSnapshot;
    if (!snapshot || snapshot.date !== todayStr()) return null;
    return snapshot;
  } catch {
    return null;
  }
}
