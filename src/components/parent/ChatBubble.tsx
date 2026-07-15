import type { ChatMessage } from "../../types";
import { cn } from "../../utils/cn";

/** AI 어시스턴트 아바타 */
function AiAvatar() {
  return (
    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg">
      🤖
    </span>
  );
}

/**
 * AI 대화 말풍선.
 * AI = 연한 파랑(bubble-ai) 왼쪽, 부모 = 밝은 노랑(bubble-user) 오른쪽.
 * 시니어 가독성을 위해 큰 글씨(senior-body) 사용.
 */
export function ChatBubble({ message }: { message: ChatMessage }) {
  const isAi = message.sender === "ai";
  return (
    <div className={cn("flex items-end gap-2", isAi ? "justify-start" : "justify-end")}>
      {isAi && <AiAvatar />}
      <div
        className={cn(
          "max-w-[78%] px-4 py-3 text-senior-body leading-relaxed text-gray-800 shadow-card",
          isAi
            ? "rounded-card rounded-bl-md bg-bubble-ai"
            : "rounded-card rounded-br-md bg-bubble-user",
        )}
      >
        {message.text}
      </div>
    </div>
  );
}

/** 입력 중 표시 (AI가 답변 준비 중) */
export function TypingBubble() {
  return (
    <div className="flex items-end gap-2">
      <AiAvatar />
      <div className="flex items-center gap-1.5 rounded-card rounded-bl-md bg-bubble-ai px-5 py-4 shadow-card">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-2 w-2 animate-bounce rounded-full bg-primary-300"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

// 스펙상 명시된 별칭 컴포넌트
export const AIMessage = ChatBubble;
export const UserMessage = ChatBubble;
