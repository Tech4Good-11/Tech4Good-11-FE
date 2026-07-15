import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AccentCard, AsyncBoundary, Badge, Button, Header, Screen } from "../../components/common";
import { useApi } from "../../hooks/useApi";
import { guardiansApi } from "../../apis";
import { cn } from "../../utils/cn";
import { RELATIONSHIP_LABEL } from "../../utils/apiLabels";
import { ACCENT } from "../../utils/accents";
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

  return (
    <div className="app-shell min-h-dvh">
      <Header title="가족 공유" subtitle="공동 보호자 관리" onBack={() => navigate(`/child/elders/${elderId}`)} />
      <Screen withNav={false} className="space-y-5">
        <AccentCard accent="sky" emoji="👨‍👩‍👧" title="함께 돌보는 가족" subtitle="여러 보호자가 건강을 공유해요">
          <AsyncBoundary loading={loading} error={error} data={data} onRetry={reload}>
            {(guardians) => (
              <div className="space-y-2.5">
                {guardians.map((g) => (
                  <div key={g.userId} className="flex items-center gap-3 rounded-2xl bg-accent-sky/50 px-4 py-3">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                      style={{ backgroundColor: ACCENT.sky.deep }}
                    >
                      {g.name.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-body-lg font-semibold text-gray-900">
                        {g.name} <Badge tone="gray">{RELATIONSHIP_LABEL[g.relationship]}</Badge>
                      </p>
                      <p className="truncate text-caption text-gray-400">{g.email}</p>
                    </div>
                    <button onClick={() => remove(g.userId)} className="px-1.5 text-gray-300 hover:text-danger" aria-label="해제">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </AsyncBoundary>
        </AccentCard>

        {/* 공동 보호자 추가 */}
        <AccentCard accent="mint" emoji="➕" title="공동 보호자 추가" subtitle="이미 온기에 가입된 이메일만 가능">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="이메일"
            className="w-full rounded-input bg-canvas px-4 py-3 text-body-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {RELATIONSHIPS.map((r) => {
              const active = rel === r;
              return (
                <button
                  key={r}
                  onClick={() => setRel(r)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-caption font-semibold transition-colors",
                    !active && "bg-canvas text-gray-500",
                  )}
                  style={active ? { backgroundColor: ACCENT.mint.soft, color: ACCENT.mint.deep } : undefined}
                >
                  {RELATIONSHIP_LABEL[r]}
                </button>
              );
            })}
          </div>
          {formError && (
            <p className="mt-3 rounded-input bg-danger-light px-4 py-3 text-body font-medium text-danger-dark">{formError}</p>
          )}
          <Button fullWidth className="mt-4" onClick={add} disabled={busy || !email.trim()}>
            {busy ? "추가 중…" : "보호자 추가"}
          </Button>
        </AccentCard>
      </Screen>
    </div>
  );
}
