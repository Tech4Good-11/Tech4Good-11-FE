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
    summary: string;
  }[];
}

// ── Documents (MOCK) ─────────────────────────────
export interface DocumentIntakeResponse {
  conversationId: number;
  docType: DocType;
  extractedMedications: MedicationResponse[];
  extractedDiseases: DiseaseResponse[];
  healthNoteUpdated: boolean;
}
