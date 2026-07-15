import type { ChecklistItem } from "../../types";
import { cn } from "../../utils/cn";

/**
 * 부모 건강 체크리스트 카드.
 * 시니어용 큰 아이콘·글씨·넓은 터치 영역. 탭하면 '기록'(완료) 처리.
 * 완료 시 측정값(recordedText)을 함께 보여준다.
 */
export function ChecklistCard({
  item,
  recordedText,
  onComplete,
}: {
  item: ChecklistItem;
  recordedText?: string;
  onComplete: () => void;
}) {
  const { completed } = item;
  return (
    <button
      type="button"
      onClick={completed ? undefined : onComplete}
      disabled={completed}
      className={cn(
        "flex w-full items-center gap-4 rounded-card p-5 text-left transition-all duration-fast ease-smooth",
        completed
          ? "bg-success-light"
          : "bg-white shadow-card active:scale-[0.99] hover:shadow-card-hover",
      )}
    >
      <span
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-sheet text-3xl",
          completed ? "bg-white/70" : "bg-primary-50",
        )}
      >
        {item.icon}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-senior-body font-bold",
            completed ? "text-success-dark" : "text-gray-900",
          )}
        >
          {item.title}
        </p>
        {completed && recordedText ? (
          <p className="mt-0.5 text-body font-semibold text-success-dark">
            {recordedText} 기록됨
          </p>
        ) : (
          item.description && (
            <p className="mt-0.5 text-body text-gray-500">{item.description}</p>
          )
        )}
      </div>

      {/* 체크 표시 */}
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          completed
            ? "border-success bg-success text-white"
            : "border-gray-300 text-transparent",
        )}
        aria-hidden="true"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}
