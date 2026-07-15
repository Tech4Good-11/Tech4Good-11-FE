/** 온기 API enum → 한국어 라벨, 파생 값 헬퍼 */
import type {
  DiseaseStatus,
  Gender,
  MedicationStatus,
  Relationship,
} from "../types/api";

export const GENDER_LABEL: Record<Gender, string> = {
  M: "남",
  F: "여",
  other: "기타",
};

export const RELATIONSHIP_LABEL: Record<Relationship, string> = {
  son: "아들",
  daughter: "딸",
  spouse: "배우자",
  sibling: "형제자매",
  relative: "친척",
  caregiver: "돌봄제공자",
  other: "기타",
};

export const DISEASE_STATUS_LABEL: Record<DiseaseStatus, string> = {
  active: "진행 중",
  managed: "관리 중",
  resolved: "완치",
};

export const MEDICATION_STATUS_LABEL: Record<MedicationStatus, string> = {
  active: "복용 중",
  stopped: "중단",
  completed: "완료",
};

/** 질병/복약 상태 → 건강 상태 톤(정상/주의) 매핑 */
export function diseaseTone(status: DiseaseStatus): "normal" | "caution" | "danger" {
  if (status === "active") return "caution";
  if (status === "managed") return "normal";
  return "normal";
}

/** birthDate("YYYY-MM-DD") → 만 나이 */
export function ageFromBirth(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const b = new Date(birthDate + "T00:00:00");
  if (Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age -= 1;
  return age;
}
