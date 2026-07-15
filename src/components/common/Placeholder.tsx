import { Card } from "./Card";

/** 구현 예정 화면용 임시 플레이스홀더. (다음 단계에서 교체) */
export function Placeholder({ step, note }: { step: string; note: string }) {
  return (
    <Card className="mt-4 border border-dashed border-gray-200 bg-white/60 text-center">
      <p className="text-3xl">🚧</p>
      <p className="mt-2 text-body-lg font-semibold text-gray-700">{note}</p>
      <p className="mt-1 text-caption text-gray-400">{step} 에서 구현 예정</p>
    </Card>
  );
}
