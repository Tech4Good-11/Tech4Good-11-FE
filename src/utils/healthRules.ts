/**
 * 건강 지표 규칙 — 임계값 기반 상태 평가 / 표시 포맷 / 종합 상태 계산.
 * 상태 판정 로직은 전부 여기에 집중시켜 재사용한다.
 */
import type { HealthMetric, HealthStatus, MetricKey } from "../types";

export const STATUS_ORDER: Record<HealthStatus, number> = {
  normal: 0,
  caution: 1,
  danger: 2,
};

export const STATUS_LABEL: Record<HealthStatus, string> = {
  normal: "정상",
  caution: "주의",
  danger: "위험",
};

const MOOD_LABEL: Record<number, string> = {
  1: "많이 우울",
  2: "우울",
  3: "보통",
  4: "좋음",
  5: "아주 좋음",
};

export interface MetricConfig {
  key: MetricKey;
  label: string;
  unit: string;
  icon: string;
  /** 값 → 상태 판정 */
  evaluate: (value: number, secondary?: number) => HealthStatus;
  /** 값 → 표시 문자열 */
  format: (value: number, secondary?: number) => string;
}

export const METRIC_KEYS: MetricKey[] = [
  "bloodPressure",
  "bloodSugar",
  "heartRate",
  "sleep",
  "weight",
  "mood",
  "steps",
  "medication",
];

export const METRIC_CONFIG: Record<MetricKey, MetricConfig> = {
  bloodPressure: {
    key: "bloodPressure",
    label: "혈압",
    unit: "mmHg",
    icon: "🩺",
    evaluate: (sys, dia = 0) => {
      if (sys >= 140 || dia >= 90) return "danger";
      if (sys >= 130 || dia >= 85) return "caution";
      return "normal";
    },
    format: (sys, dia) => (dia != null ? `${sys}/${dia}` : `${sys}`),
  },
  bloodSugar: {
    key: "bloodSugar",
    label: "혈당",
    unit: "mg/dL",
    icon: "🩸",
    evaluate: (v) => {
      if (v >= 126) return "danger";
      if (v >= 100) return "caution";
      return "normal";
    },
    format: (v) => `${v}`,
  },
  heartRate: {
    key: "heartRate",
    label: "심박수",
    unit: "bpm",
    icon: "❤️",
    evaluate: (v) => {
      if (v < 50 || v > 110) return "danger";
      if (v < 60 || v > 100) return "caution";
      return "normal";
    },
    format: (v) => `${v}`,
  },
  sleep: {
    key: "sleep",
    label: "수면",
    unit: "시간",
    icon: "😴",
    evaluate: (v) => {
      if (v < 5) return "danger";
      if (v < 7) return "caution";
      return "normal";
    },
    format: (v) => `${v}`,
  },
  weight: {
    key: "weight",
    label: "체중",
    unit: "kg",
    icon: "⚖️",
    evaluate: () => "normal", // 체중은 추이만 추적
    format: (v) => `${v}`,
  },
  mood: {
    key: "mood",
    label: "기분",
    unit: "",
    icon: "🙂",
    evaluate: (v) => {
      if (v <= 2) return "danger";
      if (v === 3) return "caution";
      return "normal";
    },
    format: (v) => MOOD_LABEL[v] ?? "보통",
  },
  steps: {
    key: "steps",
    label: "걸음수",
    unit: "걸음",
    icon: "🚶",
    evaluate: (v) => {
      if (v < 2000) return "danger";
      if (v < 5000) return "caution";
      return "normal";
    },
    format: (v) => v.toLocaleString("ko-KR"),
  },
  medication: {
    key: "medication",
    label: "복약",
    unit: "",
    icon: "💊",
    evaluate: (v) => (v >= 1 ? "normal" : "caution"),
    format: (v) => (v >= 1 ? "복용 완료" : "미복용"),
  },
};

/** 값으로부터 완성된 HealthMetric 을 생성 */
export function buildMetric(
  key: MetricKey,
  value: number,
  secondary: number | undefined,
  updatedAt: string,
): HealthMetric {
  const config = METRIC_CONFIG[key];
  return {
    key,
    label: config.label,
    value,
    secondaryValue: secondary,
    unit: config.unit,
    displayValue: config.format(value, secondary),
    status: config.evaluate(value, secondary),
    updatedAt,
  };
}

/** 여러 지표 중 가장 위험한 상태를 종합 상태로 반환 */
export function computeOverallStatus(
  metrics: Record<MetricKey, HealthMetric>,
): HealthStatus {
  let worst: HealthStatus = "normal";
  for (const key of METRIC_KEYS) {
    const status = metrics[key].status;
    if (STATUS_ORDER[status] > STATUS_ORDER[worst]) worst = status;
  }
  return worst;
}
