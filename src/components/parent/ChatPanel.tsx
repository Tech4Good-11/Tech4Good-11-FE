import { useEffect, useRef, useState } from "react";
import { ChatBubble, TypingBubble } from "./ChatBubble";
import { useApp } from "../../hooks/useApp";
import { chatApi } from "../../apis";
import { nextId } from "../../data/mockData";
import { readActiveElderId } from "../../utils/parentBridge";
import type { ChatMessage } from "../../types";
import type { ChatHistoryMessage } from "../../types/api";

const GO_CHECKLIST = "체크리스트 보기";
// 부모 앱엔 elderId 개념이 없어, 자녀가 마지막으로 연 어르신을 사용(없으면 1번).
const FALLBACK_ELDER_ID = 1;

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

  const { chatHistory } = state;
  const lastMessage = chatHistory[chatHistory.length - 1];
  const quickReplies =
    !isTyping && lastMessage?.sender === "ai" ? lastMessage.quickReplies : undefined;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory.length, isTyping]);

  async function send(text: string) {
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

    // 이전 맥락(방금 보낼 메시지 제외)을 history 로 전달
    const history: ChatHistoryMessage[] = chatHistory.map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));
    const elderId = readActiveElderId() ?? FALLBACK_ELDER_ID;

    setIsTyping(true);
    try {
      // ⚠️ /chat = 어르신 발화. save=true → 대화 저장 + 수면·운동·복약 지표 자동 추출
      //    (자녀 대시보드에 반영). 자녀 화면은 /consult 를 써야 함.
      const res = await chatApi.sendChat(elderId, {
        message: trimmed,
        history,
        purpose: "daily_checkin",
        save: true,
      });
      dispatch({
        type: "ADD_CHAT_MESSAGE",
        message: {
          id: nextId("msg"),
          sender: "ai",
          text: res.reply,
          timestamp: new Date().toISOString(),
          quickReplies: [GO_CHECKLIST],
        },
      });
    } catch {
      dispatch({
        type: "ADD_CHAT_MESSAGE",
        message: {
          id: nextId("msg"),
          sender: "ai",
          text: "지금은 답변을 드리기 어려워요. 잠시 후 다시 말씀해 주세요.",
          timestamp: new Date().toISOString(),
        },
      });
    } finally {
      setIsTyping(false);
    }
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
