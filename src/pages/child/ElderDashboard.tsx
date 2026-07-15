import { useNavigate, useParams } from "react-router-dom";
import { AsyncBoundary, Badge, Card, Header, Screen, StatusBadge } from "../../components/common";
import { useApi } from "../../hooks/useApi";
import { dashboardApi } from "../../apis";
import { ageFromBirth, diseaseTone, GENDER_LABEL } from "../../utils/apiLabels";
import { relativeTime } from "../../utils/format";

export default function ElderDashboard() {
  const navigate = useNavigate();
  const { elderId: raw } = useParams();
  const elderId = Number(raw);

  const { data, loading, error, reload } = useApi(
    () => dashboardApi.getDashboard(elderId),
    [elderId],
  );

  const base = `/child/elders/${elderId}`;
  const actions = [
    { to: `${base}/health`, icon: "💊", label: "건강정보" },
    { to: `${base}/checkin`, icon: "☑️", label: "안부확인" },
    { to: `${base}/guardians`, icon: "👨‍👩‍👧", label: "가족공유" },
  ];

  return (
    <>
      <Header title="건강 대시보드" onBack={() => navigate("/child")} />
      <Screen withNav={false} className="space-y-4">
        <AsyncBoundary loading={loading} error={error} data={data} onRetry={reload} loadingLabel="대시보드 불러오는 중…">
          {(d) => {
            const age = ageFromBirth(d.elder.birthDate);
            return (
              <>
                {/* 어르신 정보 */}
                <Card padding="lg">
                  <div className="flex items-center gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-sheet bg-primary-50 text-2xl">👵</span>
                    <div>
                      <p className="text-card-title font-bold text-gray-900">{d.elder.name}</p>
                      <p className="text-body text-gray-500">
                        {age != null && `${age}세`}
                        {d.elder.gender && ` · ${GENDER_LABEL[d.elder.gender]}`}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* 바로가기 */}
                <div className="grid grid-cols-3 gap-2">
                  {actions.map((a) => (
                    <Card key={a.to} padding="sm" onClick={() => navigate(a.to)}>
                      <p className="text-center text-2xl">{a.icon}</p>
                      <p className="mt-1 text-center text-caption font-bold text-gray-700">{a.label}</p>
                    </Card>
                  ))}
                </div>

                {/* 건강노트 */}
                <Card padding="lg" onClick={() => navigate(`${base}/health`)}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-card-title font-bold text-gray-900">건강노트</h2>
                    {d.healthNote && (
                      <span className="text-caption text-gray-400">
                        {relativeTime(d.healthNote.updatedAt)}
                      </span>
                    )}
                  </div>
                  {d.healthNote ? (
                    <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-body text-gray-600">
                      {d.healthNote.contentMd}
                    </p>
                  ) : (
                    <p className="mt-2 text-body text-gray-400">아직 작성된 건강노트가 없어요. 탭하여 작성해요.</p>
                  )}
                </Card>

                {/* 오늘의 리마인드 */}
                {d.todayReminders.length > 0 && (
                  <Card padding="lg">
                    <h2 className="mb-3 text-card-title font-bold text-gray-900">오늘의 리마인드</h2>
                    <ul className="space-y-2">
                      {d.todayReminders.map((r) => (
                        <li key={r.ruleCode} className="flex items-start gap-3">
                          <span className="mt-0.5 text-lg">⏰</span>
                          <div>
                            <p className="text-body-lg text-gray-800">{r.message}</p>
                            <p className="text-caption text-gray-400">{r.times.join(", ")}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* 질병 */}
                <Card padding="lg" onClick={() => navigate(`${base}/health`)}>
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-card-title font-bold text-gray-900">질병 {d.diseases.length}</h2>
                    <span className="text-caption font-semibold text-primary-500">관리 ›</span>
                  </div>
                  {d.diseases.length === 0 ? (
                    <p className="text-body text-gray-400">등록된 질병이 없어요.</p>
                  ) : (
                    <div className="space-y-2">
                      {d.diseases.slice(0, 4).map((dis) => (
                        <div key={dis.id} className="flex items-center justify-between">
                          <span className="text-body-lg text-gray-800">{dis.diseaseName}</span>
                          <StatusBadge status={diseaseTone(dis.status)} showDot={false} />
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* 복약 */}
                <Card padding="lg" onClick={() => navigate(`${base}/health`)}>
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-card-title font-bold text-gray-900">복약 {d.medications.length}</h2>
                    <span className="text-caption font-semibold text-primary-500">관리 ›</span>
                  </div>
                  {d.medications.length === 0 ? (
                    <p className="text-body text-gray-400">등록된 약이 없어요.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {d.medications.map((m) => (
                        <Badge key={m.id} tone="gray">
                          💊 {m.medicationName}
                          {m.dosage && ` ${m.dosage}`}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Card>

                {/* 최근 안부 */}
                <Card padding="lg">
                  <h2 className="mb-3 text-card-title font-bold text-gray-900">최근 안부</h2>
                  {d.recentCheckins.length === 0 ? (
                    <p className="text-body text-gray-400">안부 기록이 없어요.</p>
                  ) : (
                    <ul className="space-y-2">
                      {d.recentCheckins.map((c) => (
                        <li key={c.conversationId} className="flex items-center justify-between">
                          <span className="text-body-lg text-gray-800">{c.summary}</span>
                          <span className="shrink-0 text-caption text-gray-400">{relativeTime(c.createdAt)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </>
            );
          }}
        </AsyncBoundary>
      </Screen>
    </>
  );
}
