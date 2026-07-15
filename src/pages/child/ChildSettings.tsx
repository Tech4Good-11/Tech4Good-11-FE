import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Header, Screen } from "../../components/common";
import { useApp } from "../../hooks/useApp";
import { CHRONIC_DISEASES } from "../../data/mockData";
import { relativeTime } from "../../utils/format";

export default function ChildSettings() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const p = state.parentProfile;
  const diseases = CHRONIC_DISEASES.filter((d) => p.chronicDiseaseIds.includes(d.id));

  function switchRole() {
    dispatch({ type: "RESET_ROLE" });
    navigate("/");
  }

  return (
    <>
      <Header title="설정" subtitle="가족 · 알림" />
      <Screen className="space-y-4">
        {/* 가족 정보 */}
        <Card padding="lg">
          <div className="flex items-center gap-4">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-sheet text-2xl font-bold text-white"
              style={{ backgroundColor: p.avatarColor }}
            >
              {p.name.slice(0, 1)}
            </span>
            <div>
              <p className="text-card-title font-bold text-gray-900">
                {p.name} · {p.relation}
              </p>
              <p className="text-body text-gray-500">
                {p.age}세 · {p.gender}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {diseases.map((d) => (
              <Badge key={d.id} tone="primary">
                {d.icon} {d.name}
              </Badge>
            ))}
          </div>
        </Card>

        {/* 알림 */}
        <div>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-body-lg font-bold text-gray-900">알림</h2>
            {state.notifications.some((n) => !n.read) && (
              <button
                onClick={() => dispatch({ type: "MARK_ALL_NOTIFICATIONS_READ" })}
                className="text-caption font-semibold text-primary-500"
              >
                모두 읽음
              </button>
            )}
          </div>
          <div className="space-y-2">
            {state.notifications.slice(0, 6).map((n) => (
              <Card
                key={n.id}
                padding="md"
                onClick={() => dispatch({ type: "MARK_NOTIFICATION_READ", id: n.id })}
                className={n.read ? undefined : "ring-2 ring-primary-100"}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-body font-semibold text-gray-900">{n.title}</p>
                    <p className="truncate text-caption text-gray-500">{n.message}</p>
                  </div>
                  <span className="shrink-0 text-caption text-gray-400">
                    {relativeTime(n.createdAt)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Button variant="secondary" fullWidth onClick={switchRole}>
          역할 다시 선택하기
        </Button>
      </Screen>
    </>
  );
}
