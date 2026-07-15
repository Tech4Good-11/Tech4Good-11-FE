/**
 * 전역 상태 데이터 계약 (Single Source of Truth)
 * 부모/자녀가 동일한 상태를 구독한다.
 */

// ── 공통 ─────────────────────────────────────────
export type UserRole = "parent" | "child";

/** 건강 상태: 정상 / 주의 / 위험 */
export type HealthStatus = "normal" | "caution" | "danger";

/** 추적하는 건강 지표 키 */
export type MetricKey =
  | "bloodPressure" // 혈압
  | "bloodSugar" // 혈당
  | "heartRate" // 심박수
  | "sleep" // 수면
  | "weight" // 체중
  | "mood" // 기분
  | "steps" // 걸음수
  | "medication"; // 복약

// ── 건강 지표 ────────────────────────────────────
export interface HealthMetric {
  key: MetricKey;
  label: string; // "혈압"
  value: number; // 대표 수치 (차트용, 혈압이면 수축기)
  secondaryValue?: number; // 보조 수치 (혈압 이완기 등)
  unit: string; // "mmHg"
  displayValue: string; // "128/82"
  status: HealthStatus;
  updatedAt: string; // ISO
}

/** 부모의 현재 건강 데이터 — 부모 입력의 결과, 자녀 대시보드의 소스 */
export interface ParentHealthData {
  metrics: Record<MetricKey, HealthMetric>;
  overallStatus: HealthStatus;
  updatedAt: string;
}

/** 누적 건강 기록 (부모 건강 DB / 추이 차트 소스) */
export interface HealthRecord {
  id: string;
  date: string; // YYYY-MM-DD
  metricKey: MetricKey;
  label: string;
  value: number;
  unit: string;
  status: HealthStatus;
}

// ── 체크리스트 ───────────────────────────────────
/** AI 대화 기반으로 생성되는 건강 체크리스트 항목 */
export interface ChecklistItem {
  id: string;
  title: string; // "혈압 측정하기"
  description?: string;
  icon: string; // 이모지 or 아이콘 키
  completed: boolean;
  completedAt?: string;
  /** 완료 시 갱신할 건강 지표 (없으면 단순 확인 항목) */
  targetMetric?: MetricKey;
  /** 시뮬레이션용 측정값 (완료 시 지표에 반영) */
  simulatedValue?: number;
  simulatedSecondary?: number;
}

// ── AI 대화 ──────────────────────────────────────
export type ChatSender = "ai" | "user";

export interface ChatMessage {
  id: string;
  sender: ChatSender;
  text: string;
  timestamp: string;
  /** AI 메시지가 제시하는 빠른 답변 버튼 */
  quickReplies?: string[];
}

// ── 병원 기록 ────────────────────────────────────
export interface MedicalRecord {
  id: string;
  date: string; // YYYY-MM-DD
  hospital: string; // "서울내과의원"
  department: string; // "내과"
  diagnosis: string; // "고혈압 정기검진"
  doctor?: string;
  prescriptions?: string[];
  memo?: string;
  nextVisit?: string; // YYYY-MM-DD
}

// ── AI 추천 케어팁 ───────────────────────────────
export type CareTipCategory =
  | "diet"
  | "exercise"
  | "medication"
  | "lifestyle"
  | "checkup";

export interface AIRecommendation {
  id: string;
  title: string;
  body: string;
  category: CareTipCategory;
  priority: HealthStatus; // 우선도(normal<caution<danger)
  relatedMetric?: MetricKey;
  createdAt: string;
}

// ── 주간 건강 요약 ───────────────────────────────
export interface MetricTrend {
  metricKey: MetricKey;
  label: string;
  trend: "up" | "down" | "stable";
  changeText: string; // "지난주보다 안정적"
}

export interface WeeklySummary {
  weekLabel: string; // "7월 2주차"
  startDate: string;
  endDate: string;
  overallStatus: HealthStatus;
  completionRate: number; // 체크리스트 완료율 0~100
  highlights: string[];
  metricTrends: MetricTrend[];
}

// ── 알림 ─────────────────────────────────────────
export type NotificationType =
  | "health_update"
  | "checklist_done"
  | "ai_tip"
  | "alert";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  status?: HealthStatus;
  read: boolean;
  createdAt: string;
}

// ── 프로필 / 온보딩 ──────────────────────────────
export interface ChronicDisease {
  id: string;
  name: string; // "고혈압"
  icon: string;
  relatedMetrics: MetricKey[];
}

export interface ParentProfile {
  id: string;
  name: string; // "김순자"
  age: number;
  gender: "남" | "여";
  relation: string; // "어머니"
  chronicDiseaseIds: string[];
  avatarColor: string; // tailwind 색상값
}

// ── 전역 상태 ────────────────────────────────────
export interface AppState {
  currentRole: UserRole | null;
  onboardingComplete: boolean;
  parentProfile: ParentProfile;
  parentHealthData: ParentHealthData;
  checklist: ChecklistItem[];
  chatHistory: ChatMessage[];
  parentHealthDB: HealthRecord[];
  medicalRecords: MedicalRecord[];
  aiRecommendations: AIRecommendation[];
  weeklyReport: WeeklySummary;
  notifications: Notification[];
}

// ── 액션 ─────────────────────────────────────────
export type AppAction =
  | { type: "SET_ROLE"; role: UserRole }
  | { type: "RESET_ROLE" }
  | { type: "SET_CHRONIC_DISEASES"; diseaseIds: string[] }
  | { type: "COMPLETE_ONBOARDING" }
  | { type: "ADD_CHAT_MESSAGE"; message: ChatMessage }
  | { type: "GENERATE_CHECKLIST"; items: ChecklistItem[] }
  | { type: "COMPLETE_CHECKLIST_ITEM"; id: string }
  | { type: "RESET_CHECKLIST" }
  | { type: "ADD_NOTIFICATION"; notification: Notification }
  | { type: "MARK_NOTIFICATION_READ"; id: string }
  | { type: "MARK_ALL_NOTIFICATIONS_READ" };
