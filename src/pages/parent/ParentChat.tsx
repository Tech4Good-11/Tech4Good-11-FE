import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/common";
import { ChatBubble, TypingBubble } from "../../components/parent/ChatBubble";
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
        text: "말씀해 주셔서 고마워요. 오늘 혈압이나 혈당은 재보셨어요?",
        quickReplies: ["아직 안 쟀어요", "쟀어요"],
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

export default function ParentChat() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
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

    // 체크리스트 보기 → 화면 이동
    if (trimmed === GO_CHECKLIST) {
      navigate("/parent/checklist");
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

    const userCount = chatHistory.filter((m) => m.sender === "user").length + 1;
    const turn = aiTurnFor(userCount);
    if (!turn) return;

    setIsTyping(true);
    timerRef.current = setTimeout(() => {
      setIsTyping(false);
      if (turn.generateChecklist) {
        dispatch({ type: "GENERATE_CHECKLIST", items: createTodayChecklist() });
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
    <div className="mx-auto flex h-dvh max-w-app flex-col bg-gray-100">
      <Header senior title="건강 대화" subtitle="AI 도우미" onBack={() => navigate("/parent")} />

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
