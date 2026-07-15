import { useContext } from "react";
import { AppContext } from "../store/context";

/** 전역 상태와 dispatch 에 접근하는 훅. Provider 밖에서 쓰면 에러. */
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within <AppProvider>");
  }
  return ctx;
}
