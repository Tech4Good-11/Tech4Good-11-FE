import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "./authContext";
import { authApi } from "../apis";
import type { LoginRequest, SignupRequest, UserResponse } from "../types/api";

/** 세션 인증 상태 관리. 앱 시작 시 GET /auth/me 로 로그인 여부 확인. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    authApi
      .me()
      .then((u) => alive && setUser(u))
      .catch(() => alive && setUser(null))
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async (body: LoginRequest) => {
    setUser(await authApi.login(body));
  }, []);

  const signup = useCallback(async (body: SignupRequest) => {
    // 회원가입 후 세션 발급을 위해 곧바로 로그인
    await authApi.signup(body);
    setUser(await authApi.login({ email: body.email, password: body.password }));
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
