import { createContext } from "react";
import type { LoginRequest, SignupRequest, UserResponse } from "../types/api";

export interface AuthContextValue {
  user: UserResponse | null;
  /** 초기 세션 확인(me) 완료 여부 */
  ready: boolean;
  login: (body: LoginRequest) => Promise<void>;
  signup: (body: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
