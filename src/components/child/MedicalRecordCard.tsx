import { Badge, Card } from "../common";
import { formatKoreanDate } from "../../utils/format";
import type { MedicalRecord } from "../../types";

/** 병원 진료 기록 카드. */
export function MedicalRecordCard({ record }: { record: MedicalRecord }) {
  return (
    <Card padding="lg">
      <div className="flex items-center justify-between">
        <Badge tone="primary">{record.department}</Badge>
        <span className="text-caption text-gray-400">{formatKoreanDate(record.date)}</span>
      </div>

      <p className="mt-2 text-card-title font-bold text-gray-900">{record.diagnosis}</p>
      <p className="text-body text-gray-500">
        {record.hospital}
        {record.doctor && ` · ${record.doctor} 원장`}
      </p>

      {record.prescriptions && record.prescriptions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {record.prescriptions.map((p) => (
            <span
              key={p}
              className="rounded-full bg-gray-100 px-2.5 py-1 text-caption font-medium text-gray-600"
            >
              💊 {p}
            </span>
          ))}
        </div>
      )}

      {record.memo && (
        <p className="mt-3 rounded-input bg-gray-50 px-3 py-2 text-body text-gray-600">
          {record.memo}
        </p>
      )}

      {record.nextVisit && (
        <p className="mt-3 text-caption font-medium text-primary-600">
          📅 다음 진료 {formatKoreanDate(record.nextVisit)}
        </p>
      )}
    </Card>
  );
}
