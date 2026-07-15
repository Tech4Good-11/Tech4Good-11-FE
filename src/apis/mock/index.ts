/**
 * 인메모리 목(mock) API 구현.
 * 실서버 서비스 모듈과 동일한 함수 시그니처를 제공한다.
 * (VITE_USE_MOCK=true 일 때 apis/index.ts 배럴이 실서버 대신 이걸 export)
 *
 * - 세션 내 mutation(추가/삭제/수정)이 store 에 반영되어 UI가 실제처럼 동작.
 * - 로그인 상태는 sessionStorage 에 저장되어 새로고침해도 유지.
 */
import { ApiError } from "../client";
import type {
  ChatRequest,
  ChatResponse,
  CheckinSubmitRequest,
  CheckinSubmitResponse,
  CheckinTodayResponse,
  ConversationCreateRequest,
  ConversationDetailResponse,
  ConversationSummaryResponse,
  DailyLogResponse,
  DailyLogUpdateRequest,
  DashboardResponse,
  DiseaseRequest,
  DiseaseResponse,
  DiseaseStatus,
  DocType,
  DocumentIntakeResponse,
  ElderCreateRequest,
  ElderReminderResponse,
  ElderResponse,
  ElderSummaryResponse,
  ElderUpdateRequest,
  GuardianAddRequest,
  GuardianResponse,
  HealthNoteResponse,
  HealthScore,
  LoginRequest,
  MedicationIntakeRequest,
  MedicationIntakeResponse,
  MedicationRequest,
  MedicationResponse,
  MedicationStatus,
  ReminderRuleResponse,
  SignupRequest,
  UserResponse,
} from "../../types/api";

// ── 유틸 ─────────────────────────────────────────
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
let seq = 100;
const nextId = () => ++seq;
const nowIso = () => new Date().toISOString();
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

// ── 인메모리 스토어 ──────────────────────────────
interface Store {
  elders: ElderResponse[];
  diseases: Record<number, DiseaseResponse[]>;
  medications: Record<number, MedicationResponse[]>;
  notes: Record<number, HealthNoteResponse | null>;
  guardians: Record<number, GuardianResponse[]>;
  checkins: Record<
    number,
    { conversationId: number; purpose: "daily_checkin"; createdAt: string; summary: string }[]
  >;
  lastCheckin: Record<number, string | null>;
  dailyLogs: Record<number, DailyLogResponse | null>;
  intakes: Record<number, Record<number, boolean>>; // elderId → { medicationId: taken }
}

function seed(): Store {
  const e1: ElderResponse = {
    id: 1,
    name: "홍길동",
    birthDate: "1945-03-11",
    gender: "M",
    phone: "010-5555-6666",
    relationship: "son",
    createdAt: "2026-07-01T10:00:00",
  };
  const e2: ElderResponse = {
    id: 2,
    name: "김순자",
    birthDate: "1950-08-20",
    gender: "F",
    phone: null,
    relationship: "daughter",
    createdAt: "2026-07-05T10:00:00",
  };
  return {
    elders: [e1, e2],
    diseases: {
      1: [
        { id: 11, diseaseName: "본태성 고혈압", icdCode: "I10", diagnosedAt: "2023-05-10", status: "managed", notes: "아침 혈압 다소 높음" },
        { id: 12, diseaseName: "제2형 당뇨병", icdCode: "E11", diagnosedAt: "2022-11-02", status: "active", notes: null },
      ],
      2: [
        { id: 13, diseaseName: "고지혈증", icdCode: "E78", diagnosedAt: "2024-01-15", status: "managed", notes: null },
      ],
    },
    medications: {
      1: [
        { id: 21, medicationName: "암로디핀", atcCode: "C08CA01", dosage: "5mg 1정", intervalHours: 24, startDate: "2023-05-10", endDate: null, status: "active" },
        { id: 22, medicationName: "메트포르민", atcCode: "A10BA02", dosage: "500mg 1정", intervalHours: 12, startDate: "2022-11-02", endDate: null, status: "active" },
      ],
      2: [
        { id: 23, medicationName: "로수바스타틴", atcCode: "C10AA07", dosage: "10mg 1정", intervalHours: 24, startDate: "2024-01-15", endDate: null, status: "active" },
      ],
    },
    notes: {
      1: { elderId: 1, contentMd: "## 최근 상태\n- 혈압 안정적\n- 식사 잘 하심\n- 저염식 유지 중", createdAt: "2026-07-14T08:00:00", updatedAt: "2026-07-15T08:00:00" },
      2: null,
    },
    guardians: {
      1: [{ userId: 1, email: "me@example.com", name: "나", phone: null, relationship: "son" }],
      2: [{ userId: 1, email: "me@example.com", name: "나", phone: null, relationship: "daughter" }],
    },
    checkins: {
      1: [{ conversationId: 91, purpose: "daily_checkin", createdAt: "2026-07-15T09:00:00", summary: "혈압약 복용 확인" }],
      2: [],
    },
    lastCheckin: { 1: "2026-07-15T09:00:00", 2: null },
    dailyLogs: {
      1: {
        elderId: 1,
        logDate: new Date().toISOString().slice(0, 10),
        sleepHours: 6.5,
        exerciseMinutes: 30,
        conditionSummary: "산책 30분, 혈압약 복용 완료. 컨디션 양호.",
        checklist: [{ ruleCode: "MED_21", answer: "yes" }],
        sourceConversationId: 91,
        updatedAt: "2026-07-15T09:10:00",
      },
      2: null, // 신규/대화 없는 어르신 — 기록 없음
    },
    intakes: {
      1: { 21: true }, // 암로디핀 복용 완료
      2: {},
    },
  };
}

const store: Store = seed();

function findElder(elderId: number): ElderResponse {
  const e = store.elders.find((x) => x.id === elderId);
  if (!e) throw new ApiError("리소스를 찾을 수 없습니다.", 404);
  return e;
}

/** 활성 복약 기반 리마인드 파생 */
function deriveReminders(elderId: number): ElderReminderResponse[] {
  const e = findElder(elderId);
  const meds = (store.medications[elderId] ?? []).filter((m) => m.status === "active");
  const list: ElderReminderResponse[] = meds.map((m) => ({
    ruleCode: `MED_${m.id}`,
    ruleType: "medication",
    message: `${e.name}님, ${m.medicationName} 드셨어요?`,
    frequencyType: "daily",
    times: ["09:00"],
    expectedResponse: "yes_no",
    matchedBy: { target: "medication", code: m.atcCode, medicationName: m.medicationName, diseaseName: null },
  }));
  list.push({
    ruleCode: "HYDRATION_ALL",
    ruleType: "hydration",
    message: `${e.name}님, 물 한 잔 드셨어요?`,
    frequencyType: "daily",
    times: ["11:00", "15:00"],
    expectedResponse: "yes_no",
    matchedBy: { target: "all", code: null, medicationName: null, diseaseName: null },
  });
  return list;
}

const today = () => new Date().toISOString().slice(0, 10);

/** 활성 약 전체 + 오늘 복용여부 파생 */
function deriveTodayMedications(elderId: number): MedicationIntakeResponse[] {
  const taken = store.intakes[elderId] ?? {};
  return (store.medications[elderId] ?? [])
    .filter((m) => m.status === "active")
    .map((m) => ({
      medicationId: m.id,
      medicationName: m.medicationName,
      dosage: m.dosage,
      taken: m.id in taken ? taken[m.id] : null, // 미확인이면 null
      intakeDate: today(),
    }));
}

/** 복약 순응도·수면·운동으로 건강점수 계산(가이드 D-8 산식) */
function deriveHealthScore(elderId: number): HealthScore {
  const meds = deriveTodayMedications(elderId);
  const confirmed = meds.filter((m) => m.taken !== null);
  const medicationScore = confirmed.length
    ? Math.round((confirmed.filter((m) => m.taken).length / confirmed.length) * 100)
    : null;

  const log = store.dailyLogs[elderId];
  const sleepScore =
    log?.sleepHours != null
      ? Math.max(0, Math.round(100 - Math.abs(7 - log.sleepHours) * 25))
      : null;
  const exerciseScore =
    log?.exerciseMinutes != null
      ? Math.max(0, Math.min(100, Math.round((log.exerciseMinutes / 30) * 100)))
      : null;

  const parts = [medicationScore, sleepScore, exerciseScore].filter(
    (v): v is number => v != null,
  );
  const score = parts.length ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : null;
  const comment =
    score == null
      ? "아직 오늘 건강 기록이 없어요."
      : score >= 90
        ? "오늘 건강 관리가 잘 되고 있어요."
        : score >= 70
          ? "대체로 양호하지만 조금 더 신경 써 주세요."
          : "오늘은 살펴봐야 할 부분이 있어요.";
  return { score, medicationScore, sleepScore, exerciseScore, comment };
}

// ── Auth (sessionStorage 로 로그인 유지) ─────────
const AUTH_KEY = "ongi_mock_user";
function getMockUser(): UserResponse | null {
  const s = sessionStorage.getItem(AUTH_KEY);
  return s ? (JSON.parse(s) as UserResponse) : null;
}
function setMockUser(u: UserResponse | null) {
  if (u) sessionStorage.setItem(AUTH_KEY, JSON.stringify(u));
  else sessionStorage.removeItem(AUTH_KEY);
}

export const authApi = {
  async me(): Promise<UserResponse> {
    await delay(150);
    const u = getMockUser();
    if (!u) throw new ApiError("인증이 필요합니다.", 401);
    return u;
  },
  async login(body: LoginRequest): Promise<UserResponse> {
    await delay();
    const u: UserResponse = {
      id: 1,
      email: body.email,
      name: body.email.split("@")[0] || "사용자",
      phone: null,
      createdAt: nowIso(),
    };
    setMockUser(u);
    return u;
  },
  async signup(body: SignupRequest): Promise<UserResponse> {
    await delay();
    const u: UserResponse = { id: 1, email: body.email, name: body.name, phone: body.phone ?? null, createdAt: nowIso() };
    setMockUser(u);
    return u;
  },
  async logout(): Promise<void> {
    await delay(100);
    setMockUser(null);
  },
};

// ── Elders ───────────────────────────────────────
export const eldersApi = {
  async listElders(): Promise<ElderSummaryResponse[]> {
    await delay();
    return store.elders.map((e) => ({
      id: e.id,
      name: e.name,
      birthDate: e.birthDate,
      gender: e.gender,
      relationship: e.relationship,
      activeDiseaseCount: (store.diseases[e.id] ?? []).filter((d) => d.status === "active").length,
      activeMedicationCount: (store.medications[e.id] ?? []).filter((m) => m.status === "active").length,
      lastCheckinAt: store.lastCheckin[e.id] ?? null,
    }));
  },
  async createElder(body: ElderCreateRequest): Promise<ElderResponse> {
    await delay();
    const elder: ElderResponse = {
      id: nextId(),
      name: body.name,
      birthDate: body.birthDate ?? null,
      gender: body.gender ?? null,
      phone: body.phone ?? null,
      relationship: body.relationship,
      createdAt: nowIso(),
    };
    store.elders.push(elder);
    store.diseases[elder.id] = [];
    store.medications[elder.id] = [];
    store.notes[elder.id] = null;
    store.guardians[elder.id] = [{ userId: 1, email: "me@example.com", name: "나", phone: null, relationship: body.relationship }];
    store.checkins[elder.id] = [];
    store.lastCheckin[elder.id] = null;
    store.dailyLogs[elder.id] = null;
    store.intakes[elder.id] = {};
    return clone(elder);
  },
  async getElder(elderId: number): Promise<ElderResponse> {
    await delay();
    return clone(findElder(elderId));
  },
  async updateElder(elderId: number, body: ElderUpdateRequest): Promise<ElderResponse> {
    await delay();
    const e = findElder(elderId);
    e.name = body.name;
    e.birthDate = body.birthDate ?? null;
    e.gender = body.gender ?? null;
    e.phone = body.phone ?? null;
    return clone(e);
  },
  async deleteElder(elderId: number): Promise<void> {
    await delay();
    findElder(elderId);
    store.elders = store.elders.filter((x) => x.id !== elderId);
    delete store.diseases[elderId];
    delete store.medications[elderId];
    delete store.notes[elderId];
    delete store.guardians[elderId];
    delete store.checkins[elderId];
    delete store.lastCheckin[elderId];
    delete store.dailyLogs[elderId];
    delete store.intakes[elderId];
  },
};

// ── Dashboard ────────────────────────────────────
export const dashboardApi = {
  async getDashboard(elderId: number): Promise<DashboardResponse> {
    await delay();
    const e = findElder(elderId);
    const note = store.notes[elderId];
    return {
      elder: { id: e.id, name: e.name, birthDate: e.birthDate, gender: e.gender },
      healthNote: note ? { contentMd: note.contentMd, updatedAt: note.updatedAt } : null,
      diseases: clone(store.diseases[elderId] ?? []),
      medications: clone(store.medications[elderId] ?? []),
      todayReminders: deriveReminders(elderId),
      recentCheckins: clone(store.checkins[elderId] ?? []),
      dailyLog: clone(store.dailyLogs[elderId] ?? null),
      todayMedications: deriveTodayMedications(elderId),
      healthScore: deriveHealthScore(elderId),
    };
  },
};

// ── Diseases ─────────────────────────────────────
export const diseasesApi = {
  async listDiseases(elderId: number, status?: DiseaseStatus): Promise<DiseaseResponse[]> {
    await delay();
    findElder(elderId);
    const list = store.diseases[elderId] ?? [];
    return clone(status ? list.filter((d) => d.status === status) : list);
  },
  async createDisease(elderId: number, body: DiseaseRequest): Promise<DiseaseResponse> {
    await delay();
    findElder(elderId);
    const d: DiseaseResponse = {
      id: nextId(),
      diseaseName: body.diseaseName,
      icdCode: body.icdCode ?? null,
      diagnosedAt: body.diagnosedAt ?? null,
      status: body.status ?? "active",
      notes: body.notes ?? null,
    };
    (store.diseases[elderId] ??= []).push(d);
    return clone(d);
  },
  async updateDisease(elderId: number, diseaseId: number, body: DiseaseRequest): Promise<DiseaseResponse> {
    await delay();
    const list = store.diseases[elderId] ?? [];
    const d = list.find((x) => x.id === diseaseId);
    if (!d) throw new ApiError("리소스를 찾을 수 없습니다.", 404);
    Object.assign(d, {
      diseaseName: body.diseaseName,
      icdCode: body.icdCode ?? null,
      diagnosedAt: body.diagnosedAt ?? null,
      status: body.status ?? d.status,
      notes: body.notes ?? null,
    });
    return clone(d);
  },
  async deleteDisease(elderId: number, diseaseId: number): Promise<void> {
    await delay();
    store.diseases[elderId] = (store.diseases[elderId] ?? []).filter((x) => x.id !== diseaseId);
  },
};

// ── Medications ──────────────────────────────────
export const medicationsApi = {
  async listMedications(elderId: number, status?: MedicationStatus): Promise<MedicationResponse[]> {
    await delay();
    findElder(elderId);
    const list = store.medications[elderId] ?? [];
    return clone(status ? list.filter((m) => m.status === status) : list);
  },
  async createMedication(elderId: number, body: MedicationRequest): Promise<MedicationResponse> {
    await delay();
    findElder(elderId);
    const m: MedicationResponse = {
      id: nextId(),
      medicationName: body.medicationName,
      atcCode: body.atcCode ?? null,
      dosage: body.dosage ?? null,
      intervalHours: body.intervalHours ?? null,
      startDate: body.startDate ?? null,
      endDate: body.endDate ?? null,
      status: body.status ?? "active",
    };
    (store.medications[elderId] ??= []).push(m);
    return clone(m);
  },
  async updateMedication(elderId: number, medicationId: number, body: MedicationRequest): Promise<MedicationResponse> {
    await delay();
    const list = store.medications[elderId] ?? [];
    const m = list.find((x) => x.id === medicationId);
    if (!m) throw new ApiError("리소스를 찾을 수 없습니다.", 404);
    Object.assign(m, {
      medicationName: body.medicationName,
      atcCode: body.atcCode ?? null,
      dosage: body.dosage ?? null,
      intervalHours: body.intervalHours ?? null,
      startDate: body.startDate ?? null,
      endDate: body.endDate ?? null,
      status: body.status ?? m.status,
    });
    return clone(m);
  },
  async deleteMedication(elderId: number, medicationId: number): Promise<void> {
    await delay();
    store.medications[elderId] = (store.medications[elderId] ?? []).filter((x) => x.id !== medicationId);
  },
};

// ── HealthNote ───────────────────────────────────
export const healthNoteApi = {
  async getHealthNote(elderId: number): Promise<HealthNoteResponse | null> {
    await delay();
    findElder(elderId);
    return clone(store.notes[elderId] ?? null);
  },
  async putHealthNote(elderId: number, contentMd: string): Promise<HealthNoteResponse> {
    await delay();
    findElder(elderId);
    const prev = store.notes[elderId];
    const note: HealthNoteResponse = {
      elderId,
      contentMd,
      createdAt: prev?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    };
    store.notes[elderId] = note;
    return clone(note);
  },
};

// ── Check-in ─────────────────────────────────────
export const checkinApi = {
  async getTodayCheckin(elderId: number): Promise<CheckinTodayResponse[]> {
    await delay();
    return deriveReminders(elderId).map((r) => ({
      ruleCode: r.ruleCode,
      question: r.message,
      expectedResponse: r.expectedResponse,
      scheduledTimes: r.times,
    }));
  },
  async submitCheckin(elderId: number, body: CheckinSubmitRequest): Promise<CheckinSubmitResponse> {
    await delay();
    findElder(elderId);
    const conversationId = nextId();
    const yes = body.answers.filter((a) => a.answer === "yes").length;
    (store.checkins[elderId] ??= []).unshift({
      conversationId,
      purpose: "daily_checkin",
      createdAt: nowIso(),
      summary: `문진 응답 ${body.answers.length}건 (예 ${yes})`,
    });
    store.lastCheckin[elderId] = nowIso();
    return { conversationId, savedAt: nowIso() };
  },
};

// ── Guardians ────────────────────────────────────
export const guardiansApi = {
  async listGuardians(elderId: number): Promise<GuardianResponse[]> {
    await delay();
    findElder(elderId);
    return clone(store.guardians[elderId] ?? []);
  },
  async addGuardian(elderId: number, body: GuardianAddRequest): Promise<GuardianResponse> {
    await delay();
    findElder(elderId);
    const list = (store.guardians[elderId] ??= []);
    if (list.some((g) => g.email === body.email)) throw new ApiError("이미 등록된 보호자입니다.", 409);
    const g: GuardianResponse = {
      userId: nextId(),
      email: body.email,
      name: body.email.split("@")[0] || "보호자",
      phone: null,
      relationship: body.relationship,
    };
    list.push(g);
    return clone(g);
  },
  async removeGuardian(elderId: number, userId: number): Promise<void> {
    await delay();
    store.guardians[elderId] = (store.guardians[elderId] ?? []).filter((g) => g.userId !== userId);
  },
};

// ── Conversations ────────────────────────────────
export const conversationsApi = {
  async listConversations(elderId: number): Promise<ConversationSummaryResponse[]> {
    await delay();
    return (store.checkins[elderId] ?? []).map((c) => ({
      id: c.conversationId,
      elderId,
      purpose: c.purpose,
      createdAt: c.createdAt,
      summary: c.summary,
    }));
  },
  async getConversation(conversationId: number): Promise<ConversationDetailResponse> {
    await delay();
    return {
      id: conversationId,
      elderId: 1,
      purpose: "daily_checkin",
      transcript: [{ role: "agent", text: "약 드셨어요?" }, { role: "elder", answer: "yes" }],
      createdAt: nowIso(),
    };
  },
  async createConversation(elderId: number, body: ConversationCreateRequest): Promise<ConversationSummaryResponse> {
    await delay();
    return { id: nextId(), elderId, purpose: body.purpose, createdAt: nowIso() };
  },
};

// ── Reminders ────────────────────────────────────
export const remindersApi = {
  async getElderReminders(elderId: number): Promise<ElderReminderResponse[]> {
    await delay();
    return deriveReminders(elderId);
  },
  async listReminderRules(): Promise<ReminderRuleResponse[]> {
    await delay();
    return [];
  },
};

// ── Documents (MOCK 위의 MOCK) ───────────────────
export const documentsApi = {
  async uploadDocument(elderId: number, _file: File, docType: DocType): Promise<DocumentIntakeResponse> {
    await delay(600);
    findElder(elderId);
    // 처방전이면 복약 1건 추가하여 추출을 흉내
    const extractedMedications: MedicationResponse[] = [];
    if (docType === "prescription") {
      const m: MedicationResponse = {
        id: nextId(),
        medicationName: "아스피린",
        atcCode: "B01AC06",
        dosage: "100mg 1정",
        intervalHours: 24,
        startDate: null,
        endDate: null,
        status: "active",
      };
      (store.medications[elderId] ??= []).push(m);
      extractedMedications.push(clone(m));
    }
    return {
      conversationId: nextId(),
      docType,
      extractedMedications,
      extractedDiseases: [],
      healthNoteUpdated: false,
    };
  },
};

// ── DailyLog / 복약 체크 ─────────────────────────
export const dailyLogApi = {
  async getDailyLog(elderId: number, _date?: string): Promise<DailyLogResponse> {
    await delay();
    findElder(elderId);
    return (
      clone(store.dailyLogs[elderId]) ?? {
        elderId,
        logDate: today(),
        sleepHours: null,
        exerciseMinutes: null,
        conditionSummary: null,
        checklist: [],
        sourceConversationId: null,
        updatedAt: null,
      }
    );
  },
  async putDailyLog(elderId: number, body: DailyLogUpdateRequest): Promise<DailyLogResponse> {
    await delay();
    findElder(elderId);
    const prev = store.dailyLogs[elderId];
    const next: DailyLogResponse = {
      elderId,
      logDate: body.logDate ?? prev?.logDate ?? today(),
      sleepHours: body.sleepHours ?? prev?.sleepHours ?? null,
      exerciseMinutes: body.exerciseMinutes ?? prev?.exerciseMinutes ?? null,
      conditionSummary: body.conditionSummary ?? prev?.conditionSummary ?? null,
      checklist: prev?.checklist ?? [],
      sourceConversationId: prev?.sourceConversationId ?? null,
      updatedAt: nowIso(),
    };
    store.dailyLogs[elderId] = next;
    return clone(next);
  },
  async extractDailyLog(elderId: number, _conversationId?: number): Promise<DailyLogResponse> {
    await delay(500);
    return dailyLogApi.getDailyLog(elderId);
  },
  async getMedicationIntake(elderId: number, _date?: string): Promise<MedicationIntakeResponse[]> {
    await delay();
    findElder(elderId);
    return deriveTodayMedications(elderId).filter((m) => m.taken !== null);
  },
  async submitMedicationIntake(
    elderId: number,
    body: MedicationIntakeRequest,
  ): Promise<MedicationIntakeResponse> {
    await delay();
    findElder(elderId);
    (store.intakes[elderId] ??= {})[body.medicationId] = body.taken;
    const med = (store.medications[elderId] ?? []).find((m) => m.id === body.medicationId);
    if (!med) throw new ApiError("리소스를 찾을 수 없습니다.", 404);
    return {
      medicationId: med.id,
      medicationName: med.medicationName,
      dosage: med.dosage,
      taken: body.taken,
      intakeDate: body.intakeDate ?? today(),
    };
  },
};

// ── Chat (에이전트 챗봇 흉내) ────────────────────
export const chatApi = {
  async sendChat(elderId: number, body: ChatRequest): Promise<ChatResponse> {
    await delay(700);
    const e = findElder(elderId);
    const reply = `${e.name}님 이야기 잘 들었어요. "${body.message}" — 많이 신경 쓰이셨겠어요. 조금 더 자세히 들려주시겠어요?`;
    let conversationId: number | null = null;
    if (body.save) {
      conversationId = nextId();
      (store.checkins[elderId] ??= []).unshift({
        conversationId,
        purpose: "daily_checkin",
        createdAt: nowIso(),
        summary: body.message.slice(0, 30),
      });
      store.lastCheckin[elderId] = nowIso();
    }
    return { reply, conversationId };
  },
};
