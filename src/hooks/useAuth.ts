import { useContext } from "react";
import { AuthContext } from "../store/authContext";

/** 세션 인증 상태/액션 훅. AuthProvider 밖에서 쓰면 에러. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
