import { USE_MOCK } from "./config";

import * as realAuth from "./auth";
import * as realElders from "./elders";
import * as realDashboard from "./dashboard";
import * as realDiseases from "./diseases";
import * as realMedications from "./medications";
import * as realHealthNote from "./healthNote";
import * as realCheckin from "./checkin";
import * as realGuardians from "./guardians";
import * as realConversations from "./conversations";
import * as realReminders from "./reminders";
import * as realDocuments from "./documents";
import * as realChat from "./chat";
import * as realDailyLog from "./dailyLog";

import * as mock from "./mock";

export { apiClient, ApiError, unwrap } from "./client";
export { USE_MOCK } from "./config";

// USE_MOCK=true 이면 인메모리 목 구현으로 대체 (UI 코드는 변경 없음)
export const authApi = USE_MOCK ? mock.authApi : realAuth;
export const eldersApi = USE_MOCK ? mock.eldersApi : realElders;
export const dashboardApi = USE_MOCK ? mock.dashboardApi : realDashboard;
export const diseasesApi = USE_MOCK ? mock.diseasesApi : realDiseases;
export const medicationsApi = USE_MOCK ? mock.medicationsApi : realMedications;
export const healthNoteApi = USE_MOCK ? mock.healthNoteApi : realHealthNote;
export const checkinApi = USE_MOCK ? mock.checkinApi : realCheckin;
export const guardiansApi = USE_MOCK ? mock.guardiansApi : realGuardians;
export const conversationsApi = USE_MOCK ? mock.conversationsApi : realConversations;
export const remindersApi = USE_MOCK ? mock.remindersApi : realReminders;
export const documentsApi = USE_MOCK ? mock.documentsApi : realDocuments;
export const chatApi = USE_MOCK ? mock.chatApi : realChat;
export const dailyLogApi = USE_MOCK ? mock.dailyLogApi : realDailyLog;
