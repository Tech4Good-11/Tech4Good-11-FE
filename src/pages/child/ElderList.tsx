import { useNavigate } from "react-router-dom";
import { AccentIcon, AsyncBoundary, Button, EmptyState, Header, Screen } from "../../components/common";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { eldersApi } from "../../apis";
import { ageFromBirth, RELATIONSHIP_LABEL } from "../../utils/apiLabels";
import { ACCENT } from "../../utils/accents";
import { relativeTime } from "../../utils/format";

function StatPill({ accent, label }: { accent: keyof typeof ACCENT; label: string }) {
  return (
    <span
      className="rounded-full px-2.5 py-1 text-caption font-semibold"
      style={{ backgroundColor: ACCENT[accent].soft, color: ACCENT[accent].deep }}
    >
      {label}
    </span>
  );
}

export default function ElderList() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data, loading, error, reload } = useApi(() => eldersApi.listElders(), []);

  return (
    <>
      <Header
        subtitle={user ? `${user.name}님, 안녕하세요` : undefined}
        title="우리 가족 건강"
        right={
          <button
            onClick={async () => {
              await logout();
              navigate("/", { replace: true });
            }}
            className="rounded-full bg-white px-3 py-1.5 text-caption font-semibold text-gray-500 shadow-soft"
          >
            로그아웃
          </button>
        }
      />
      <Screen withNav={false} className="space-y-4">
        <AsyncBoundary loading={loading} error={error} data={data} onRetry={reload} loadingLabel="불러오는 중…">
          {(elders) =>
            elders.length === 0 ? (
              <EmptyState
                icon="👵"
                title="등록된 어르신이 없어요"
                description="관리할 어르신을 추가해 주세요."
                action={<Button size="md" onClick={() => navigate("/child/add")}>어르신 추가</Button>}
              />
            ) : (
              <>
                {elders.map((e) => {
                  const age = ageFromBirth(e.birthDate);
                  return (
                    <button
                      key={e.id}
                      onClick={() => navigate(`/child/elders/${e.id}`)}
                      className="block w-full rounded-3xl bg-white p-6 text-left shadow-soft transition-transform duration-fast ease-smooth active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-4">
                        <AccentIcon accent="peach" emoji="👵" size="lg" />
                        <div className="min-w-0 flex-1">
                          <p className="text-card-title font-bold text-gray-900">{e.name}</p>
                          <p className="text-body text-gray-400">
                            {RELATIONSHIP_LABEL[e.relationship]}
                            {age != null && ` · ${age}세`}
                          </p>
                        </div>
                        <span className="text-2xl text-gray-300">›</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <StatPill accent="blue" label={`질병 ${e.activeDiseaseCount}`} />
                        <StatPill accent="rose" label={`복약 ${e.activeMedicationCount}`} />
                        <StatPill
                          accent="purple"
                          label={e.lastCheckinAt ? `안부 ${relativeTime(e.lastCheckinAt)}` : "안부 기록 없음"}
                        />
                      </div>
                    </button>
                  );
                })}

                {/* 어르신 추가 */}
                <button
                  onClick={() => navigate("/child/add")}
                  className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-gray-200 bg-white/50 py-5 text-body-lg font-bold text-gray-500 transition-colors hover:border-primary-200 hover:text-primary-500"
                >
                  <span className="text-xl">＋</span> 어르신 추가하기
                </button>
              </>
            )
          }
        </AsyncBoundary>
      </Screen>
    </>
  );
}
