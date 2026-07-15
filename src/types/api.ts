/**
 * 온기(ongi) 백엔드 API 데이터 계약.
 * 출처: frontend-api-guide.md (Spring Boot DTO 기준, camelCase).
 * 부모(로컬 mock) 상태와 분리된 실제 서버 모델.
 */

// ── 공통 ─────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

// ── Enum ─────────────────────────────────────────
export type Gender = "M" | "F" | "other";
export type Relationship =
  | "son"
  | "daughter"
  | "spouse"
  | "sibling"
  | "relative"
  | "caregiver"
  | "other";
export type ConversationPurpose = "daily_checkin" | "document_intake" | "free";
export type DiseaseStatus = "active" | "managed" | "resolved";
export type MedicationStatus = "active" | "stopped" | "completed";
export type ReminderRuleType =
  | "medication"
  | "hydration"
  | "meal"
  | "vital_check"
  | "custom";
export type ReminderMatchTarget = "disease" | "medication" | "all";
export type ReminderFrequencyType = "interval_hours" | "daily" | "weekly";
export type ExpectedResponse = "yes_no" | "none";
export type DocType = "diagnosis" | "prescription";

// ── Auth ─────────────────────────────────────────
export interface UserResponse {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  createdAt: string;
}
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phone?: string | null;
}
export interface LoginRequest {
  email: string;
  password: string;
}

// ── Elders ───────────────────────────────────────
export interface ElderResponse {
  id: number;
  name: string;
  birthDate: string | null;
  gender: Gender | null;
  phone: string | null;
  relationship: Relationship;
  createdAt: string;
}
export interface ElderSummaryResponse {
  id: number;
  name: string;
  birthDate: string | null;
  gender: Gender | null;
  relationship: Relationship;
  activeMedicationCount: number;
  activeDiseaseCount: number;
  lastCheckinAt: string | null;
}
export interface ElderCreateRequest {
  name: string;
  birthDate?: string | null;
  gender?: Gender | null;
  phone?: string | null;
  relationship: Relationship;
}
export interface ElderUpdateRequest {
  name: string;
  birthDate?: string | null;
  gender?: Gender | null;
  phone?: string | null;
}

// ── Guardians ────────────────────────────────────
export interface GuardianResponse {
  userId: number;
  email: string;
  name: string;
  phone: string | null;
  relationship: Relationship;
}
export interface GuardianAddRequest {
  email: string;
  relationship: Relationship;
}

// ── Diseases ─────────────────────────────────────
export interface DiseaseResponse {
  id: number;
  diseaseName: string;
  icdCode: string | null;
  diagnosedAt: string | null;
  status: DiseaseStatus;
  notes: string | null;
}
export interface DiseaseRequest {
  diseaseName: string;
  icdCode?: string | null;
  diagnosedAt?: string | null;
  status?: DiseaseStatus;
  notes?: string | null;
}

// ── Medications ──────────────────────────────────
export interface MedicationResponse {
  id: number;
  medicationName: string;
  atcCode: string | null;
  dosage: string | null;
  intervalHours: number | null;
  startDate: string | null;
  endDate: string | null;
  status: MedicationStatus;
}
export interface MedicationRequest {
  medicationName: string;
  atcCode?: string | null;
  dosage?: string | null;
  intervalHours?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: MedicationStatus;
}

// ── HealthNote ───────────────────────────────────
export interface HealthNoteResponse {
  elderId: number;
  contentMd: string;
  createdAt: string;
  updatedAt: string;
}

// ── Reminders ────────────────────────────────────
export interface ReminderRuleResponse {
  id: number;
  ruleCode: string;
  ruleType: ReminderRuleType;
  matchTarget: ReminderMatchTarget;
  matchCode: string | null;
  frequencyType: ReminderFrequencyType;
  frequencyValue: string;
  messageTemplate: string;
  expectedResponse: ExpectedResponse;
  isActive: boolean;
}
export interface ElderReminderResponse {
  ruleCode: string;
  ruleType: ReminderRuleType;
  message: string;
  frequencyType: ReminderFrequencyType;
  times: string[];
  expectedResponse: ExpectedResponse;
  matchedBy: {
    target: ReminderMatchTarget;
    code: string | null;
    medicationName: string | null;
    diseaseName: string | null;
  };
}

// ── Check-in ─────────────────────────────────────
export interface CheckinTodayResponse {
  ruleCode: string;
  question: string;
  expectedResponse: ExpectedResponse;
  scheduledTimes: string[];
}
export interface CheckinAnswer {
  ruleCode: string;
  answer: string; // "yes" | "no" | 자유값
}
export interface CheckinSubmitRequest {
  answers: CheckinAnswer[];
}
export interface CheckinSubmitResponse {
  conversationId: number;
  savedAt: string | null;
}

// ── Conversations ────────────────────────────────
export interface ConversationCreateRequest {
  purpose: ConversationPurpose;
  transcript: unknown; // 자유 JSON
}
export interface ConversationSummaryResponse {
  id: number;
  elderId: number;
  purpose: ConversationPurpose;
  createdAt: string;
  summary?: string; // dashboard recentCheckins 에서 제공
}
export interface ConversationDetailResponse {
  id: number;
  elderId: number;
  purpose: ConversationPurpose;
  transcript: unknown;
  createdAt: string;
}

// ── DailyLog / 복약 체크 / 건강점수 ───────────────
export interface DailyLogChecklistItem {
  ruleCode: string;
  answer: "yes" | "no";
}
export interface DailyLogResponse {
  elderId: number;
  logDate: string;
  sleepHours: number | null; // 수면(시간). null = 기록 없음
  exerciseMinutes: number | null; // 운동(분). ⚠️ 걸음수 아님. null = 기록 없음
  conditionSummary: string | null; // AI 상담 요약(하루 단위) — recentCheckins.summary 대신 이 값 사용
  checklist: DailyLogChecklistItem[];
  sourceConversationId: number | null;
  updatedAt: string | null;
}
/** PUT /daily-log — null 필드는 변경 안 함. logDate 생략 시 오늘. */
export interface DailyLogUpdateRequest {
  logDate?: string | null;
  sleepHours?: number | null;
  exerciseMinutes?: number | null;
  conditionSummary?: string | null;
}
export interface MedicationIntakeResponse {
  medicationId: number;
  medicationName: string;
  dosage: string | null;
  taken: boolean | null; // null = 아직 미확인 (0/false 와 구분)
  intakeDate: string;
}
/** POST /medication-intake — 같은 약/같은 날은 upsert. intakeDate 생략 시 오늘. */
export interface MedicationIntakeRequest {
  medicationId: number;
  taken: boolean;
  intakeDate?: string | null;
}
/** 서버 계산 파생값(게이지바용). 근거 없으면 score=null → '기록 없음' */
export interface HealthScore {
  score: number | null;
  medicationScore: number | null;
  sleepScore: number | null;
  exerciseScore: number | null;
  comment: string;
}

// ── Dashboard ────────────────────────────────────
export interface DashboardResponse {
  elder: {
    id: number;
    name: string;
    birthDate: string | null;
    gender: Gender | null;
  };
  healthNote: { contentMd: string; updatedAt: string } | null;
  diseases: DiseaseResponse[];
  medications: MedicationResponse[];
  todayReminders: ElderReminderResponse[];
  recentCheckins: {
    conversationId: number;
    purpose: ConversationPurpose;
    createdAt: string;
    summary: string | null; // ⚠️ 대부분 null. AI 요약은 dailyLog.conditionSummary 사용
  }[];
  dailyLog: DailyLogResponse | null; // 대화에서 추출된 오늘 지표
  todayMedications: MedicationIntakeResponse[]; // 활성 약 전체 + 복용여부
  healthScore: HealthScore | null; // 서버 계산 건강점수
}

// ── Documents (OpenAI Vision 실구현) ─────────────
export interface DocumentIntakeResponse {
  conversationId: number;
  docType: DocType;
  extractedMedications: MedicationResponse[];
  extractedDiseases: DiseaseResponse[];
  healthNoteUpdated: boolean;
}

// ── Chat (에이전트 챗봇, OpenAI) ──────────────────
export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}
export interface ChatRequest {
  message: string;
  history?: ChatHistoryMessage[];
  purpose?: ConversationPurpose; // 기본 free
  save?: boolean; // true면 대화 저장 + 지표 자동 추출
}
export interface ChatResponse {
  reply: string;
  conversationId: number | null; // save=false면 null
}
