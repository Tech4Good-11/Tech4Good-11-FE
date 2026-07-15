import { useEffect, useState } from "react";
import {
  PARENT_CHECK_KEY,
  readParentCheckSnapshot,
  type ParentCheckSnapshot,
} from "../utils/parentBridge";

/**
 * 부모 오늘 체크 현황을 읽어 오는 훅.
 * - 마운트 시 현재 값을 읽는다(같은 탭에서 부모→자녀로 이동 시 최신값 반영).
 * - 다른 탭/창에서의 변경은 `storage` 이벤트로 실시간 반영한다.
 */
export function useParentCheck(): ParentCheckSnapshot | null {
  const [snapshot, setSnapshot] = useState<ParentCheckSnapshot | null>(() =>
    readParentCheckSnapshot(),
  );

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === PARENT_CHECK_KEY || e.key === null) {
        setSnapshot(readParentCheckSnapshot());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return snapshot;
}
