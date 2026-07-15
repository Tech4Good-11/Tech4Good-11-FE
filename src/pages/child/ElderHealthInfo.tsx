import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Header, Screen, Spinner, StatusBadge } from "../../components/common";
import { useApi } from "../../hooks/useApi";
import { diseasesApi, documentsApi, healthNoteApi, medicationsApi } from "../../apis";
import { DISEASE_STATUS_LABEL, MEDICATION_STATUS_LABEL, diseaseTone } from "../../utils/apiLabels";
import type { DocType } from "../../types/api";

export default function ElderHealthInfo() {
  const navigate = useNavigate();
  const elderId = Number(useParams().elderId);

  const diseases = useApi(() => diseasesApi.listDiseases(elderId), [elderId]);
  const meds = useApi(() => medicationsApi.listMedications(elderId), [elderId]);
  const note = useApi(() => healthNoteApi.getHealthNote(elderId), [elderId]);

  // 입력 상태
  const [diseaseName, setDiseaseName] = useState("");
  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("");
  const [noteDraft, setNoteDraft] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  const inputClass =
    "w-full rounded-input bg-gray-100 px-3 py-2.5 text-body text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200";

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
      setUploadMsg(
        `처리 완료 · 복약 ${res.extractedMedications.length}건, 질병 ${res.extractedDiseases.length}건 추가됨`,
      );
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
      <Screen withNav={false} className="space-y-4">
        {/* 질병 */}
        <Card padding="lg">
          <h2 className="mb-3 text-card-title font-bold text-gray-900">질병</h2>
          {diseases.loading ? (
            <Spinner />
          ) : (
            <div className="space-y-2">
              {(diseases.data ?? []).map((dis) => (
                <div key={dis.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <p className="text-body-lg font-semibold text-gray-800">{dis.diseaseName}</p>
                    <p className="text-caption text-gray-400">
                      {DISEASE_STATUS_LABEL[dis.status]}
                      {dis.icdCode && ` · ${dis.icdCode}`}
                    </p>
                  </div>
                  <StatusBadge status={diseaseTone(dis.status)} showDot={false} />
                  <button onClick={() => removeDisease(dis.id)} className="px-2 text-gray-300 hover:text-danger" aria-label="삭제">
                    ✕
                  </button>
                </div>
              ))}
              {(diseases.data ?? []).length === 0 && (
                <p className="text-body text-gray-400">등록된 질병이 없어요.</p>
              )}
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <input value={diseaseName} onChange={(e) => setDiseaseName(e.target.value)} placeholder="질병명 추가" className={inputClass} />
            <Button size="md" onClick={addDisease} disabled={!diseaseName.trim()}>추가</Button>
          </div>
        </Card>

        {/* 복약 */}
        <Card padding="lg">
          <h2 className="mb-3 text-card-title font-bold text-gray-900">복약</h2>
          {meds.loading ? (
            <Spinner />
          ) : (
            <div className="space-y-2">
              {(meds.data ?? []).map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <span className="text-xl">💊</span>
                  <div className="flex-1">
                    <p className="text-body-lg font-semibold text-gray-800">{m.medicationName}</p>
                    <p className="text-caption text-gray-400">
                      {m.dosage ?? "용량 미입력"}
                      {m.intervalHours != null && ` · ${m.intervalHours}시간마다`} · {MEDICATION_STATUS_LABEL[m.status]}
                    </p>
                  </div>
                  <button onClick={() => removeMed(m.id)} className="px-2 text-gray-300 hover:text-danger" aria-label="삭제">
                    ✕
                  </button>
                </div>
              ))}
              {(meds.data ?? []).length === 0 && (
                <p className="text-body text-gray-400">등록된 약이 없어요.</p>
              )}
            </div>
          )}
          <div className="mt-3 space-y-2">
            <input value={medName} onChange={(e) => setMedName(e.target.value)} placeholder="약 이름" className={inputClass} />
            <div className="flex gap-2">
              <input value={medDosage} onChange={(e) => setMedDosage(e.target.value)} placeholder="용량 (예: 5mg 1정)" className={inputClass} />
              <Button size="md" onClick={addMed} disabled={!medName.trim()}>추가</Button>
            </div>
          </div>
        </Card>

        {/* 건강노트 */}
        <Card padding="lg">
          <h2 className="mb-3 text-card-title font-bold text-gray-900">건강노트</h2>
          {note.loading ? (
            <Spinner />
          ) : (
            <>
              <textarea
                value={noteDraft ?? currentNote}
                onChange={(e) => setNoteDraft(e.target.value)}
                rows={6}
                placeholder="## 최근 상태&#10;- 혈압 안정적&#10;- 식사 잘 하심"
                className="w-full resize-none rounded-input bg-gray-100 px-4 py-3 text-body text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
              <Button
                fullWidth
                className="mt-2"
                onClick={saveNote}
                disabled={savingNote || noteDraft == null || noteDraft === currentNote}
              >
                {savingNote ? "저장 중…" : "노트 저장"}
              </Button>
            </>
          )}
        </Card>

        {/* 문서 업로드 (MOCK) */}
        <Card padding="lg">
          <h2 className="mb-1 text-card-title font-bold text-gray-900">진단서 · 처방전 업로드</h2>
          <p className="mb-3 text-caption text-gray-400">사진을 올리면 복약·질병을 자동 등록해요.</p>
          <div className="flex gap-2">
            <UploadButton label="처방전" docType="prescription" onPick={onUpload} />
            <UploadButton label="진단서" docType="diagnosis" onPick={onUpload} />
          </div>
          {uploadMsg && <p className="mt-3 text-body font-medium text-primary-600">{uploadMsg}</p>}
        </Card>
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
    <label className="flex-1 cursor-pointer rounded-button bg-gray-100 py-3 text-center text-body font-semibold text-gray-700 transition-colors hover:bg-gray-200">
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
