import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Header } from "../../components/common";
import { eldersApi } from "../../apis";
import { cn } from "../../utils/cn";
import { GENDER_LABEL, RELATIONSHIP_LABEL } from "../../utils/apiLabels";
import type { Gender, Relationship } from "../../types/api";

const GENDERS: Gender[] = ["M", "F", "other"];
const RELATIONSHIPS: Relationship[] = [
  "son",
  "daughter",
  "spouse",
  "sibling",
  "relative",
  "caregiver",
  "other",
];

export default function ElderAdd() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const inputClass =
    "w-full rounded-input bg-gray-100 px-4 py-4 text-body-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !relationship) return;
    setError(null);
    setBusy(true);
    try {
      const elder = await eldersApi.createElder({
        name: name.trim(),
        birthDate: birthDate || null,
        gender,
        phone: phone.trim() || null,
        relationship,
      });
      navigate(`/child/elders/${elder.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell min-h-dvh">
      <Header title="어르신 추가" subtitle="관리할 어르신 등록" onBack={() => navigate("/child")} />
      <form onSubmit={onSubmit} className="space-y-5 px-[--app-gutter] pb-10 pt-2">
        <div>
          <label className="mb-1.5 block px-1 text-body font-semibold text-gray-700">이름 *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="예) 홍길동" className={inputClass} />
        </div>

        <div>
          <label className="mb-1.5 block px-1 text-body font-semibold text-gray-700">생년월일</label>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="mb-1.5 block px-1 text-body font-semibold text-gray-700">성별</label>
          <div className="flex gap-2">
            {GENDERS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(gender === g ? null : g)}
                className={cn(
                  "flex-1 rounded-input border-2 py-3 text-body-lg font-semibold transition-colors",
                  gender === g ? "border-primary-500 bg-primary-50 text-primary-700" : "border-transparent bg-gray-100 text-gray-600",
                )}
              >
                {GENDER_LABEL[g]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block px-1 text-body font-semibold text-gray-700">전화번호</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" className={inputClass} />
        </div>

        <div>
          <label className="mb-1.5 block px-1 text-body font-semibold text-gray-700">관계 *</label>
          <div className="flex flex-wrap gap-2">
            {RELATIONSHIPS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRelationship(r)}
                className={cn(
                  "rounded-full border-2 px-4 py-2 text-body font-semibold transition-colors",
                  relationship === r ? "border-primary-500 bg-primary-50 text-primary-700" : "border-transparent bg-gray-100 text-gray-600",
                )}
              >
                {RELATIONSHIP_LABEL[r]}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-input bg-danger-light px-4 py-3 text-body font-medium text-danger-dark">{error}</p>
        )}

        <Button type="submit" fullWidth disabled={busy || !name.trim() || !relationship}>
          {busy ? "등록 중…" : "어르신 등록하기"}
        </Button>
      </form>
    </div>
  );
}
