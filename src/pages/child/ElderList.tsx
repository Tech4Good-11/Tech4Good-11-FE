import { useNavigate } from "react-router-dom";
import { AsyncBoundary, Button, Card, EmptyState, Header, Screen } from "../../components/common";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { eldersApi } from "../../apis";
import { ageFromBirth, RELATIONSHIP_LABEL } from "../../utils/apiLabels";
import { relativeTime } from "../../utils/format";

export default function ElderList() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data, loading, error, reload } = useApi(() => eldersApi.listElders(), []);

  return (
    <>
      <Header
        subtitle={user ? `${user.name}님` : undefined}
        title="어르신 목록"
        right={
          <button
            onClick={async () => {
              await logout();
              navigate("/", { replace: true });
            }}
            className="text-caption font-semibold text-gray-500"
          >
            로그아웃
          </button>
        }
      />
      <Screen withNav={false} className="space-y-3">
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
                    <Card key={e.id} onClick={() => navigate(`/child/elders/${e.id}`)}>
                      <div className="flex items-center gap-4">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sheet bg-primary-50 text-2xl">
                          👵
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-card-title font-bold text-gray-900">
                            {e.name}
                            <span className="ml-2 text-body font-medium text-gray-400">
                              {RELATIONSHIP_LABEL[e.relationship]}
                              {age != null && ` · ${age}세`}
                            </span>
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-caption text-gray-600">
                              질병 {e.activeDiseaseCount}
                            </span>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-caption text-gray-600">
                              복약 {e.activeMedicationCount}
                            </span>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-caption text-gray-500">
                              {e.lastCheckinAt ? `안부 ${relativeTime(e.lastCheckinAt)}` : "안부 기록 없음"}
                            </span>
                          </div>
                        </div>
                        <span className="text-2xl text-gray-300">›</span>
                      </div>
                    </Card>
                  );
                })}
                <Button variant="secondary" fullWidth className="mt-2" onClick={() => navigate("/child/add")}>
                  + 어르신 추가
                </Button>
              </>
            )
          }
        </AsyncBoundary>
      </Screen>
    </>
  );
}
