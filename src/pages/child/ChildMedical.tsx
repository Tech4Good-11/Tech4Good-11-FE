import { useNavigate } from "react-router-dom";
import { Header, Screen } from "../../components/common";
import { MedicalRecordCard } from "../../components/child";
import { useApp } from "../../hooks/useApp";

export default function ChildMedical() {
  const { state } = useApp();
  const navigate = useNavigate();
  const records = [...state.medicalRecords].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <Header title="병원 기록" subtitle={`총 ${records.length}건`} onBack={() => navigate("/child")} />
      <Screen withNav={false} className="space-y-3">
        {records.map((r) => (
          <MedicalRecordCard key={r.id} record={r} />
        ))}
      </Screen>
    </>
  );
}
