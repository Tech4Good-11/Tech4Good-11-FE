import { useReducer, type ReactNode } from "react";
import { AppContext } from "./context";
import { appReducer } from "./reducer";
import { createInitialState } from "../data/mockData";

/** 단일 Global State Provider — 앱 최상단에서 부모/자녀 화면을 감싼다. */
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    appReducer,
    undefined,
    createInitialState,
  );

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
