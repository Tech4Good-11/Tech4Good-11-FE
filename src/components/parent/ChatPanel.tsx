import { useEffect, useRef, useState } from "react";
import { ChatBubble, TypingBubble } from "./ChatBubble";
import { useApp } from "../../hooks/useApp";
import { createTodayChecklist, nextId } from "../../data/mockData";
import type { ChatMessage } from "../../types";

const GO_CHECKLIST = "체크리스트 보기";

/** 사용자 답변 수에 따른 AI 다음 응답 스크립트 (Mock AI) */
function aiTurnFor(userCount: number): {
  text: string;
  quickReplies?: string[];
  generateChecklist?: boolean;
} | null {
  switch (userCount) {
    case 1:
      return {
        text: "말씀해 주셔서 고마워요. 오늘 약은 챙겨 드셨어요? 산책은 좀 하셨고요?",
        quickReplies: ["아직이요", "네, 했어요"],
      };
    case 2:
      return {
        text: "알겠어요! 오늘 챙기시면 좋은 것들을 체크리스트로 정리해 드렸어요. 하나씩 해볼까요?",
        quickReplies: [GO_CHECKLIST],
        generateChecklist: true,
      };
    default:
      return null;
  }
}

/**
 * 부모 AI 대화 패널 (헤더 없는 본문만).
 * 전환탭 화면(ParentCheck) 안에서 렌더된다.
 * "체크리스트 보기"를 누르면 부모를 건강 체크 탭으로 이동시킨다.
 */
export function ChatPanel({ onGoChecklist }: { onGoChecklist: () => void }) {
  const { state, dispatch } = useApp();
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { chatHistory } = state;
  const lastMessage = chatHistory[chatHistory.length - 1];
  const quickReplies =
    !isTyping && lastMessage?.sender === "ai" ? lastMessage.quickReplies : undefined;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory.length, isTyping]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    // 체크리스트 보기 → 건강 체크 탭으로 전환
    if (trimmed === GO_CHECKLIST) {
      onGoChecklist();
      return;
    }

    const userMsg: ChatMessage = {
      id: nextId("msg"),
      sender: "user",
      text: trimmed,
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: "ADD_CHAT_MESSAGE", message: userMsg });
    setInput("");

    // 긍정 답변("네, 했어요" 등)이면 약/산책 항목을 완료로 반영 → 자녀에게도 연동
    const affirmative = /네|했|응|먹었|다녀|좋/.test(trimmed) && !/아직|안|못/.test(trimmed);

    const userCount = chatHistory.filter((m) => m.sender === "user").length + 1;
    const turn = aiTurnFor(userCount);
    if (!turn) return;

    setIsTyping(true);
    timerRef.current = setTimeout(() => {
      setIsTyping(false);
      if (turn.generateChecklist) {
        const items = createTodayChecklist();
        dispatch({ type: "GENERATE_CHECKLIST", items });
        // 방금 답한 약/산책 여부를 체크리스트에 미리 반영
        if (affirmative) {
          for (const it of items) {
            if (it.targetMetric === "medication" || it.targetMetric === "steps") {
              dispatch({ type: "COMPLETE_CHECKLIST_ITEM", id: it.id });
            }
          }
        }
      }
      dispatch({
        type: "ADD_CHAT_MESSAGE",
        message: {
          id: nextId("msg"),
          sender: "ai",
          text: turn.text,
          timestamp: new Date().toISOString(),
          quickReplies: turn.quickReplies,
        },
      });
    }, 900);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gray-100">
      {/* 메시지 영역 */}
      <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-[--app-gutter] py-4">
        {chatHistory.map((m) => (
          <ChatBubble key={m.id} message={m} />
        ))}
        {isTyping && <TypingBubble />}
        <div ref={bottomRef} />
      </div>

      {/* 빠른 답변 + 입력 */}
      <div className="border-t border-gray-200 bg-white px-[--app-gutter] pb-safe pt-3">
        {quickReplies && quickReplies.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                onClick={() => send(reply)}
                className="rounded-full border-2 border-primary-200 bg-white px-5 py-3 text-body-lg font-semibold text-primary-600 transition-transform duration-fast ease-smooth active:scale-95"
              >
                {reply}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 pb-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="편하게 말씀해 보세요"
            className="min-w-0 flex-1 rounded-input bg-gray-100 px-4 py-3 text-senior-body text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            aria-label="보내기"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white transition-transform duration-fast active:scale-90 disabled:bg-gray-200"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12l16-8-6 16-2.5-6.5L4 12z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                fill="currentColor"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
