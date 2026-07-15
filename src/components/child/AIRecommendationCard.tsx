import { Card } from "../common";
import type { AIRecommendation, CareTipCategory } from "../../types";

const categoryMeta: Record<CareTipCategory, { icon: string; label: string }> = {
  diet: { icon: "🥗", label: "식사" },
  exercise: { icon: "🚶", label: "운동" },
  medication: { icon: "💊", label: "복약" },
  lifestyle: { icon: "🌙", label: "생활" },
  checkup: { icon: "🩺", label: "검진" },
};

/** AI 맞춤 케어팁 카드. */
export function AIRecommendationCard({ rec }: { rec: AIRecommendation }) {
  const meta = categoryMeta[rec.category];
  return (
    <Card padding="lg">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sheet bg-primary-50 text-2xl">
          {meta.icon}
        </span>
        <div>
          <span className="text-caption font-semibold text-primary-500">
            AI 케어팁 · {meta.label}
          </span>
          <p className="text-card-title font-bold text-gray-900">{rec.title}</p>
        </div>
      </div>
      <p className="mt-3 text-body-lg leading-relaxed text-gray-600">{rec.body}</p>
    </Card>
  );
}
