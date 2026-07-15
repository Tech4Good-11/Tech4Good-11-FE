/**
 * 전역 상태 Reducer.
 * 핵심: COMPLETE_CHECKLIST_ITEM 이 건강데이터 → 누적DB → 주간요약 → 알림으로
 * 파생 갱신되며, 이 결과를 자녀 화면이 실시간 구독한다.
 */
import type { AppAction, AppState, HealthRecord, Notification } from "../types";
import { nextId } from "../data/mockData";
import {
  STATUS_LABEL,
  buildMetric,
  computeOverallStatus,
} from "../utils/healthRules";

function completionRate(checklist: AppState["checklist"]): number {
  if (checklist.length === 0) return 0;
  const done = checklist.filter((c) => c.completed).length;
  return Math.round((done / checklist.length) * 100);
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_ROLE":
      return { ...state, currentRole: action.role };

    case "RESET_ROLE":
      return { ...state, currentRole: null };

    case "SET_CHRONIC_DISEASES":
      return {
        ...state,
        parentProfile: {
          ...state.parentProfile,
          chronicDiseaseIds: action.diseaseIds,
        },
      };

    case "COMPLETE_ONBOARDING":
      return { ...state, onboardingComplete: true };

    case "ADD_CHAT_MESSAGE":
      return { ...state, chatHistory: [...state.chatHistory, action.message] };

    case "GENERATE_CHECKLIST": {
      const checklist = action.items;
      return {
        ...state,
        checklist,
        weeklyReport: {
          ...state.weeklyReport,
          completionRate: completionRate(checklist),
        },
      };
    }

    case "RESET_CHECKLIST": {
      const checklist = state.checklist.map((c) => ({
        ...c,
        completed: false,
        completedAt: undefined,
      }));
      return {
        ...state,
        checklist,
        weeklyReport: {
          ...state.weeklyReport,
          completionRate: completionRate(checklist),
        },
      };
    }

    case "COMPLETE_CHECKLIST_ITEM": {
      const item = state.checklist.find((c) => c.id === action.id);
      if (!item || item.completed) return state;

      const now = new Date().toISOString();
      const today = now.slice(0, 10);

      // 1) 체크리스트 항목 완료 처리
      const checklist = state.checklist.map((c) =>
        c.id === action.id ? { ...c, completed: true, completedAt: now } : c,
      );

      let parentHealthData = state.parentHealthData;
      let parentHealthDB = state.parentHealthDB;
      const newNotifications: Notification[] = [];

      // 2) 측정형 항목이면 건강 데이터 파생 갱신
      if (item.targetMetric && item.simulatedValue != null) {
        const key = item.targetMetric;
        const metric = buildMetric(
          key,
          item.simulatedValue,
          item.simulatedSecondary,
          now,
        );
        const metrics = { ...state.parentHealthData.metrics, [key]: metric };
        parentHealthData = {
          metrics,
          overallStatus: computeOverallStatus(metrics),
          updatedAt: now,
        };

        // 누적 DB: 같은 날짜·지표 기록은 최신값으로 교체
        const record: HealthRecord = {
          id: nextId("rec"),
          date: today,
          metricKey: key,
          label: metric.label,
          value: metric.value,
          unit: metric.unit,
          status: metric.status,
        };
        parentHealthDB = [
          ...state.parentHealthDB.filter(
            (r) => !(r.date === today && r.metricKey === key),
          ),
          record,
        ];

        // 자녀에게 실시간 알림
        newNotifications.push({
          id: nextId("noti"),
          type: "health_update",
          title: `${state.parentProfile.relation}가 ${metric.label}을(를) 기록했어요`,
          message: `${metric.displayValue}${metric.unit ? " " + metric.unit : ""} · ${STATUS_LABEL[metric.status]}`,
          status: metric.status,
          read: false,
          createdAt: now,
        });
      }

      // 3) 전체 완료 시 축하 알림 (피드 최상단에 오도록 앞에 추가)
      const allDone = checklist.every((c) => c.completed);
      if (allDone) {
        newNotifications.unshift({
          id: nextId("noti"),
          type: "checklist_done",
          title: "오늘의 건강 체크를 모두 마쳤어요 🎉",
          message: `${state.parentProfile.relation}가 오늘 건강 기록을 완료했습니다.`,
          read: false,
          createdAt: now,
        });
      }

      return {
        ...state,
        checklist,
        parentHealthData,
        parentHealthDB,
        notifications: [...newNotifications, ...state.notifications],
        weeklyReport: {
          ...state.weeklyReport,
          completionRate: completionRate(checklist),
          overallStatus: parentHealthData.overallStatus,
        },
      };
    }

    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.notification, ...state.notifications],
      };

    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, read: true } : n,
        ),
      };

    case "MARK_ALL_NOTIFICATIONS_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };

    default:
      return state;
  }
}
