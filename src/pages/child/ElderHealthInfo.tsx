import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AccentCard, Button, Header, Screen, Spinner, StatusBadge } from "../../components/common";
import { useApi } from "../../hooks/useApi";
import { diseasesApi, documentsApi, healthNoteApi, medicationsApi } from "../../apis";
import { DISEASE_STATUS_LABEL, MEDICATION_STATUS_LABEL, diseaseTone } from "../../utils/apiLabels";
import { ACCENT } from "../../utils/accents";
import type { DocType } from "../../types/api";

const inputClass =
  "w-full rounded-input bg-canvas px-4 py-3 text-body text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200";

export default function ElderHealthInfo() {
  const navigate = useNavigate();
  const elderId = Number(useParams().elderId);

  const diseases = useApi(() => diseasesApi.listDiseases(elderId), [elderId]);
  const meds = useApi(() => medicationsApi.listMedications(elderId), [elderId]);
  const note = useApi(() => healthNoteApi.getHealthNote(elderId), [elderId]);

  const [diseaseName, setDiseaseName] = useState("");
  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("");
  const [noteDraft, setNoteDraft] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  async function addDisease() {
    if (!diseaseName.trim()) return;
    await diseasesApi.createDisease(elderId, { diseaseName: diseaseName.trim(), status: "active" });
    setDiseaseName("");
    diseases.reload();
  }
  async function removeDisease(id: number) {
    await diseasesApi.deleteDisease(elderId, id);
    diseases.reload();
  }
  async function addMed() {
    if (!medName.trim()) return;
    await medicationsApi.createMedication(elderId, {
      medicationName: medName.trim(),
      dosage: medDosage.trim() || null,
      status: "active",
    });
    setMedName("");
    setMedDosage("");
    meds.reload();
  }
  async function removeMed(id: number) {
    await medicationsApi.deleteMedication(elderId, id);
    meds.reload();
  }
  async function saveNote() {
    if (noteDraft == null) return;
    setSavingNote(true);
    try {
      await healthNoteApi.putHealthNote(elderId, noteDraft);
      setNoteDraft(null);
      note.reload();
    } finally {
      setSavingNote(false);
    }
  }
  async function onUpload(file: File, docType: DocType) {
    setUploadMsg("문서를 분석하고 있어요…");
    try {
      const res = await documentsApi.uploadDocument(elderId, file, docType);
      setUploadMsg(`처리 완료 · 복약 ${res.extractedMedications.length}건, 질병 ${res.extractedDiseases.length}건 추가됨`);
      diseases.reload();
      meds.reload();
      note.reload();
    } catch (e) {
      setUploadMsg(e instanceof Error ? e.message : "업로드에 실패했어요.");
    }
  }

  const currentNote = note.data?.contentMd ?? "";

  return (
    <div className="app-shell min-h-dvh">
      <Header title="건강정보" subtitle="질병 · 복약 · 노트" onBack={() => navigate(`/child/elders/${elderId}`)} />
      <Screen withNav={false} className="space-y-5">
        {/* 질병 */}
        <AccentCard accent="blue" emoji="🩺" title="질병" subtitle="진단 이력">
          {diseases.loading ? (
            <Spinner />
          ) : (
            <div className="space-y-2.5">
              {(diseases.data ?? []).map((dis) => (
                <div key={dis.id} className="flex items-center gap-2 rounded-2xl bg-accent-blue/50 px-4 py-3">
                  <div className="flex-1">
                    <p className="text-body-lg font-semibold text-gray-800">{dis.diseaseName}</p>
                    <p className="text-caption text-gray-400">
                      {DISEASE_STATUS_LABEL[dis.status]}
                      {dis.icdCode && ` · ${dis.icdCode}`}
                    </p>
                  </div>
                  <StatusBadge status={diseaseTone(dis.status)} showDot={false} />
                  <button onClick={() => removeDisease(dis.id)} className="px-1.5 text-gray-300 hover:text-danger" aria-label="삭제">
                    ✕
                  </button>
                </div>
              ))}
              {(diseases.data ?? []).length === 0 && <p className="text-body text-gray-400">등록된 질병이 없어요.</p>}
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <input value={diseaseName} onChange={(e) => setDiseaseName(e.target.value)} placeholder="질병명 추가" className={inputClass} />
            <Button size="md" onClick={addDisease} disabled={!diseaseName.trim()}>추가</Button>
          </div>
        </AccentCard>

        {/* 복약 */}
        <AccentCard accent="rose" emoji="💊" title="복약" subtitle="복용 중인 약">
          {meds.loading ? (
            <Spinner />
          ) : (
            <div className="space-y-2.5">
              {(meds.data ?? []).map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ backgroundColor: ACCENT.rose.soft }}>
                  <span className="text-xl">💊</span>
                  <div className="flex-1">
                    <p className="text-body-lg font-semibold text-gray-800">{m.medicationName}</p>
                    <p className="text-caption text-gray-400">
                      {m.dosage ?? "용량 미입력"}
                      {m.intervalHours != null && ` · ${m.intervalHours}시간마다`} · {MEDICATION_STATUS_LABEL[m.status]}
                    </p>
                  </div>
                  <button onClick={() => removeMed(m.id)} className="px-1.5 text-gray-300 hover:text-danger" aria-label="삭제">
                    ✕
                  </button>
                </div>
              ))}
              {(meds.data ?? []).length === 0 && <p className="text-body text-gray-400">등록된 약이 없어요.</p>}
            </div>
          )}
          <div className="mt-4 space-y-2">
            <input value={medName} onChange={(e) => setMedName(e.target.value)} placeholder="약 이름" className={inputClass} />
            <div className="flex gap-2">
              <input value={medDosage} onChange={(e) => setMedDosage(e.target.value)} placeholder="용량 (예: 5mg 1정)" className={inputClass} />
              <Button size="md" onClick={addMed} disabled={!medName.trim()}>추가</Button>
            </div>
          </div>
        </AccentCard>

        {/* 건강노트 */}
        <AccentCard accent="mint" emoji="📝" title="건강노트" subtitle="자유롭게 기록해요">
          {note.loading ? (
            <Spinner />
          ) : (
            <>
              <textarea
                value={noteDraft ?? currentNote}
                onChange={(e) => setNoteDraft(e.target.value)}
                rows={6}
                placeholder={"## 최근 상태\n- 혈압 안정적\n- 식사 잘 하심"}
                className="w-full resize-none rounded-2xl bg-accent-mint/50 px-4 py-3 text-body leading-relaxed text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
              <Button fullWidth className="mt-3" onClick={saveNote} disabled={savingNote || noteDraft == null || noteDraft === currentNote}>
                {savingNote ? "저장 중…" : "노트 저장"}
              </Button>
            </>
          )}
        </AccentCard>

        {/* 문서 업로드 */}
        <AccentCard accent="peach" emoji="📷" title="진단서 · 처방전" subtitle="사진을 올리면 자동 등록해요">
          <div className="flex gap-2">
            <UploadButton label="처방전" docType="prescription" onPick={onUpload} />
            <UploadButton label="진단서" docType="diagnosis" onPick={onUpload} />
          </div>
          {uploadMsg && <p className="mt-3 text-body font-semibold" style={{ color: ACCENT.peach.deep }}>{uploadMsg}</p>}
        </AccentCard>
      </Screen>
    </div>
  );
}

function UploadButton({
  label,
  docType,
  onPick,
}: {
  label: string;
  docType: DocType;
  onPick: (file: File, docType: DocType) => void;
}) {
  return (
    <label
      className="flex-1 cursor-pointer rounded-2xl py-4 text-center text-body-lg font-bold text-gray-700 transition-transform active:scale-[0.97]"
      style={{ backgroundColor: ACCENT.peach.soft }}
    >
      📷 {label}
      <input
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f, docType);
          e.target.value = "";
        }}
      />
    </label>
  );
}
