import { createContext, type Dispatch } from "react";
import type { AppAction, AppState } from "../types";

export interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

export const AppContext = createContext<AppContextValue | undefined>(undefined);
