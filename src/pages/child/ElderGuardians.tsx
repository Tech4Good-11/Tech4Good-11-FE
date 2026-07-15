import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AsyncBoundary, Badge, Button, Card, Header, Screen } from "../../components/common";
import { useApi } from "../../hooks/useApi";
import { guardiansApi } from "../../apis";
import { cn } from "../../utils/cn";
import { RELATIONSHIP_LABEL } from "../../utils/apiLabels";
import type { Relationship } from "../../types/api";

const RELATIONSHIPS: Relationship[] = ["son", "daughter", "spouse", "sibling", "relative", "caregiver", "other"];

export default function ElderGuardians() {
  const navigate = useNavigate();
  const elderId = Number(useParams().elderId);
  const { data, loading, error, reload } = useApi(() => guardiansApi.listGuardians(elderId), [elderId]);

  const [email, setEmail] = useState("");
  const [rel, setRel] = useState<Relationship>("daughter");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function add() {
    if (!email.trim()) return;
    setBusy(true);
    setFormError(null);
    try {
      await guardiansApi.addGuardian(elderId, { email: email.trim(), relationship: rel });
      setEmail("");
      reload();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "추가에 실패했어요.");
    } finally {
      setBusy(false);
    }
  }
  async function remove(userId: number) {
    await guardiansApi.removeGuardian(elderId, userId);
    reload();
  }

  const inputClass =
    "w-full rounded-input bg-gray-100 px-4 py-3 text-body-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200";

  return (
    <div className="app-shell min-h-dvh">
      <Header title="가족 공유" subtitle="공동 보호자 관리" onBack={() => navigate(`/child/elders/${elderId}`)} />
      <Screen withNav={false} className="space-y-4">
        <AsyncBoundary loading={loading} error={error} data={data} onRetry={reload}>
          {(guardians) => (
            <div className="space-y-2">
              {guardians.map((g) => (
                <Card key={g.userId} padding="md">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-lg font-bold text-primary-600">
                      {g.name.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-body-lg font-semibold text-gray-900">
                        {g.name} <Badge tone="gray">{RELATIONSHIP_LABEL[g.relationship]}</Badge>
                      </p>
                      <p className="truncate text-caption text-gray-400">{g.email}</p>
                    </div>
                    <button onClick={() => remove(g.userId)} className="px-2 text-gray-300 hover:text-danger" aria-label="해제">
                      ✕
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </AsyncBoundary>

        {/* 공동 보호자 추가 */}
        <Card padding="lg">
          <h2 className="mb-3 text-card-title font-bold text-gray-900">공동 보호자 추가</h2>
          <p className="mb-3 text-caption text-gray-400">이미 온기에 가입된 이메일만 추가할 수 있어요.</p>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="이메일" className={inputClass} />
          <div className="mt-2 flex flex-wrap gap-2">
            {RELATIONSHIPS.map((r) => (
              <button
                key={r}
                onClick={() => setRel(r)}
                className={cn(
                  "rounded-full border-2 px-3 py-1.5 text-caption font-semibold transition-colors",
                  rel === r ? "border-primary-500 bg-primary-50 text-primary-700" : "border-transparent bg-gray-100 text-gray-600",
                )}
              >
                {RELATIONSHIP_LABEL[r]}
              </button>
            ))}
          </div>
          {formError && (
            <p className="mt-3 rounded-input bg-danger-light px-4 py-3 text-body font-medium text-danger-dark">{formError}</p>
          )}
          <Button fullWidth className="mt-3" onClick={add} disabled={busy || !email.trim()}>
            {busy ? "추가 중…" : "보호자 추가"}
          </Button>
        </Card>
      </Screen>
    </div>
  );
}
