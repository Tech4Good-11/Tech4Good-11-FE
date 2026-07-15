/**
 * Mock Data — 모든 화면이 사용하는 초기 전역 상태.
 * 실제 서비스처럼 자연스러운 시나리오(고혈압·당뇨 어머니)를 담는다.
 */
import type {
  AIRecommendation,
  AppState,
  ChatMessage,
  ChecklistItem,
  ChronicDisease,
  HealthRecord,
  MedicalRecord,
  Notification,
  MetricKey,
  ParentHealthData,
  ParentProfile,
  WeeklySummary,
} from "../types";
import { buildMetric, computeOverallStatus } from "../utils/healthRules";

// ── 날짜 헬퍼 (기준일 2026-07-15) ────────────────
const BASE_DATE = new Date("2026-07-15T09:00:00+09:00");

function daysAgoISO(n: number): string {
  const d = new Date(BASE_DATE);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function daysAgo(n: number): string {
  return daysAgoISO(n).slice(0, 10); // YYYY-MM-DD
}

let idSeq = 0;
export function nextId(prefix = "id"): string {
  idSeq += 1;
  return `${prefix}_${idSeq}`;
}

// ── 기저질환 카탈로그 (자녀 온보딩 선택) ─────────
export const CHRONIC_DISEASES: ChronicDisease[] = [
  { id: "htn", name: "고혈압", icon: "🩺", relatedMetrics: ["bloodPressure", "heartRate"] },
  { id: "dm", name: "당뇨", icon: "🩸", relatedMetrics: ["bloodSugar", "weight"] },
  { id: "lipid", name: "고지혈증", icon: "🧈", relatedMetrics: ["weight", "steps"] },
  { id: "arthritis", name: "관절염", icon: "🦴", relatedMetrics: ["steps"] },
  { id: "heart", name: "심장질환", icon: "❤️", relatedMetrics: ["heartRate", "bloodPressure"] },
  { id: "osteo", name: "골다공증", icon: "🦴", relatedMetrics: ["steps", "weight"] },
  { id: "stroke", name: "뇌졸중", icon: "🧠", relatedMetrics: ["bloodPressure", "heartRate"] },
  { id: "dementia", name: "치매", icon: "🧩", relatedMetrics: ["mood", "sleep"] },
];

// ── 부모 프로필 ──────────────────────────────────
const parentProfile: ParentProfile = {
  id: "parent_1",
  name: "김순자",
  age: 68,
  gender: "여",
  relation: "어머니",
  chronicDiseaseIds: ["htn", "dm"],
  avatarColor: "#3182F6",
};

// ── 현재 건강 데이터 ─────────────────────────────
function buildParentHealthData(): ParentHealthData {
  const t = daysAgoISO(0);
  const metrics = {
    bloodPressure: buildMetric("bloodPressure", 135, 88, t),
    bloodSugar: buildMetric("bloodSugar", 118, undefined, t),
    heartRate: buildMetric("heartRate", 72, undefined, t),
    sleep: buildMetric("sleep", 6.5, undefined, t),
    weight: buildMetric("weight", 58, undefined, t),
    mood: buildMetric("mood", 4, undefined, t),
    steps: buildMetric("steps", 3200, undefined, t),
    medication: buildMetric("medication", 1, undefined, t),
  };
  return {
    metrics,
    overallStatus: computeOverallStatus(metrics),
    updatedAt: t,
  };
}

// ── 누적 건강 DB (추이 차트용, 최근 7일) ─────────
function buildHealthDB(): HealthRecord[] {
  const series: Partial<Record<MetricKey, number[]>> = {
    // index 0 = 6일 전 … index 6 = 오늘
    bloodPressure: [142, 138, 140, 136, 137, 134, 135],
    bloodSugar: [125, 120, 122, 116, 119, 115, 118],
    sleep: [5.5, 6, 6.2, 6.8, 6.5, 7, 6.5],
    steps: [2400, 3000, 2800, 3500, 3100, 4000, 3200],
  };
  const records: HealthRecord[] = [];
  (Object.keys(series) as MetricKey[]).forEach((key) => {
    series[key]!.forEach((value, i) => {
      const metric = buildMetric(key, value, undefined, "");
      records.push({
        id: nextId("rec"),
        date: daysAgo(6 - i),
        metricKey: key,
        label: metric.label,
        value,
        unit: metric.unit,
        status: metric.status,
      });
    });
  });
  return records;
}

// ── 병원 기록 ────────────────────────────────────
const medicalRecords: MedicalRecord[] = [
  {
    id: nextId("med"),
    date: daysAgo(5),
    hospital: "서울내과의원",
    department: "내과",
    diagnosis: "고혈압·당뇨 정기검진",
    doctor: "박정현",
    prescriptions: ["암로디핀 5mg", "메트포르민 500mg"],
    memo: "혈압 관리 양호. 저염식 유지 권고.",
    nextVisit: daysAgo(-9),
  },
  {
    id: nextId("med"),
    date: daysAgo(24),
    hospital: "밝은눈안과",
    department: "안과",
    diagnosis: "당뇨망막병증 경과관찰",
    doctor: "이수민",
    prescriptions: ["인공눈물"],
    memo: "6개월 후 재검진.",
  },
  {
    id: nextId("med"),
    date: daysAgo(52),
    hospital: "튼튼정형외과",
    department: "정형외과",
    diagnosis: "무릎 관절염",
    doctor: "김도윤",
    prescriptions: ["소염진통제"],
    memo: "무리한 계단 이용 자제.",
  },
];

// ── AI 추천 케어팁 ───────────────────────────────
const aiRecommendations: AIRecommendation[] = [
  {
    id: nextId("tip"),
    title: "저염식으로 혈압을 낮춰요",
    body: "최근 혈압이 주의 범위예요. 국·찌개 국물을 절반만 드시고, 김치는 물에 한 번 헹궈 드시면 나트륨을 줄일 수 있어요.",
    category: "diet",
    priority: "caution",
    relatedMetric: "bloodPressure",
    createdAt: daysAgoISO(0),
  },
  {
    id: nextId("tip"),
    title: "식후 15분 가벼운 산책",
    body: "혈당이 높은 편이에요. 식사 후 15분만 걸어도 혈당이 안정돼요. 오늘 걸음 수가 아직 적으니 저녁 식사 후 산책을 추천드려요.",
    category: "exercise",
    priority: "caution",
    relatedMetric: "bloodSugar",
    createdAt: daysAgoISO(0),
  },
  {
    id: nextId("tip"),
    title: "약은 매일 같은 시간에",
    body: "혈압약과 당뇨약은 일정한 시간에 드시는 것이 중요해요. 아침 식사 직후로 알림을 맞춰두면 잊지 않으실 수 있어요.",
    category: "medication",
    priority: "normal",
    relatedMetric: "medication",
    createdAt: daysAgoISO(1),
  },
  {
    id: nextId("tip"),
    title: "규칙적인 수면 습관",
    body: "수면 시간이 조금 부족해요. 매일 같은 시간에 잠자리에 드시면 혈압과 혈당 관리에도 도움이 됩니다.",
    category: "lifestyle",
    priority: "normal",
    relatedMetric: "sleep",
    createdAt: daysAgoISO(2),
  },
];

// ── 주간 요약 ────────────────────────────────────
const weeklyReport: WeeklySummary = {
  weekLabel: "7월 2주차",
  startDate: daysAgo(6),
  endDate: daysAgo(0),
  overallStatus: "caution",
  completionRate: 0,
  highlights: [
    "혈압이 지난주보다 안정적이에요 (142→135)",
    "걸음 수가 목표에 조금 못 미쳐요",
    "약은 6일 연속 잘 챙겨 드셨어요",
  ],
  metricTrends: [
    { metricKey: "bloodPressure", label: "혈압", trend: "down", changeText: "지난주보다 안정적" },
    { metricKey: "bloodSugar", label: "혈당", trend: "down", changeText: "조금 낮아짐" },
    { metricKey: "steps", label: "걸음수", trend: "up", changeText: "활동량 증가" },
    { metricKey: "sleep", label: "수면", trend: "stable", changeText: "비슷하게 유지" },
  ],
};

// ── 초기 알림 ────────────────────────────────────
const notifications: Notification[] = [
  {
    id: nextId("noti"),
    type: "ai_tip",
    title: "새로운 케어팁이 도착했어요",
    message: "저염식으로 혈압을 낮추는 방법을 확인해 보세요.",
    status: "caution",
    read: false,
    createdAt: daysAgoISO(0),
  },
  {
    id: nextId("noti"),
    type: "health_update",
    title: "어머니가 혈압을 기록했어요",
    message: "오늘 아침 혈압 135/88 mmHg",
    status: "caution",
    read: true,
    createdAt: daysAgoISO(0),
  },
];

// ── AI 대화 초기 인사 ────────────────────────────
const chatHistory: ChatMessage[] = [
  {
    id: nextId("msg"),
    sender: "ai",
    text: "순자 어르신, 안녕하세요! 오늘 건강은 어떠세요? 함께 확인해 볼까요?",
    timestamp: daysAgoISO(0),
    quickReplies: ["좋아요", "그냥 그래요", "안 좋아요"],
  },
];

// ── 오늘의 체크리스트 (초기 미완료) ──────────────
export function createTodayChecklist(): ChecklistItem[] {
  return [
    {
      id: nextId("chk"),
      title: "혈압 측정하기",
      description: "아침 식전에 편하게 앉아서 측정해요",
      icon: "🩺",
      completed: false,
      targetMetric: "bloodPressure",
      simulatedValue: 128,
      simulatedSecondary: 82,
    },
    {
      id: nextId("chk"),
      title: "혈당 측정하기",
      description: "공복 혈당을 재보세요",
      icon: "🩸",
      completed: false,
      targetMetric: "bloodSugar",
      simulatedValue: 105,
    },
    {
      id: nextId("chk"),
      title: "아침 약 챙겨 드시기",
      description: "혈압약·당뇨약을 물과 함께",
      icon: "💊",
      completed: false,
      targetMetric: "medication",
      simulatedValue: 1,
    },
    {
      id: nextId("chk"),
      title: "30분 산책하기",
      description: "가볍게 동네 한 바퀴 걸어요",
      icon: "🚶",
      completed: false,
      targetMetric: "steps",
      simulatedValue: 5200,
    },
  ];
}

// ── 초기 전역 상태 ───────────────────────────────
export function createInitialState(): AppState {
  return {
    currentRole: null,
    onboardingComplete: false,
    parentProfile,
    parentHealthData: buildParentHealthData(),
    checklist: createTodayChecklist(),
    chatHistory,
    parentHealthDB: buildHealthDB(),
    medicalRecords,
    aiRecommendations,
    weeklyReport,
    notifications,
  };
}
