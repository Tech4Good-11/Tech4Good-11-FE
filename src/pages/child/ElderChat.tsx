import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header, Screen } from "../../components/common";
import { chatApi, eldersApi } from "../../apis";
import { useApi } from "../../hooks/useApi";
import type { ChatHistoryMessage } from "../../types/api";
import { cn } from "../../utils/cn";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "어젯밤에 잘 못 잤어요",
  "오늘 산책 다녀왔어요",
  "약을 깜빡하고 안 먹었어요",
  "요즘 입맛이 없어요",
];

export default function ElderChat() {
  const navigate = useNavigate();
  const elderId = Number(useParams().elderId);
  const { data: elder } = useApi(() => eldersApi.getElder(elderId), [elderId]);
  const name = elder?.name;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const greeting = `안녕하세요${name ? `, ${name}님` : ""}! 오늘 하루 어떻게 보내셨어요? 편하게 이야기해 주세요.`;

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;

    // 이전 대화 맥락(방금 보낼 메시지 제외)
    const history: ChatHistoryMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      // save=true → 대화 저장 + 수면·운동·복약 지표 자동 추출(대시보드 반영)
      const res = await chatApi.sendChat(elderId, {
        message,
        history,
        purpose: "free",
        save: true,
      });
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "답변을 받지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell flex min-h-dvh flex-col">
      <Header
        title="AI 상담"
        subtitle={name ? `${name}님과의 대화` : "대화하기"}
        onBack={() => navigate(`/child/elders/${elderId}`)}
      />

      <Screen withNav={false} className="flex flex-1 flex-col gap-4">
        {/* 대화 영역 */}
        <div className="flex flex-1 flex-col gap-3">
          {/* 에이전트 첫 인사 */}
          <Bubble role="assistant">{greeting}</Bubble>

          {messages.map((m, i) => (
            <Bubble key={i} role={m.role}>
              {m.content}
            </Bubble>
          ))}

          {busy && (
            <Bubble role="assistant">
              <span className="inline-flex gap-1">
                <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
              </span>
            </Bubble>
          )}

          {error && (
            <p className="rounded-input bg-danger-light px-4 py-3 text-body font-medium text-danger-dark">
              {error}
            </p>
          )}

          <div ref={scrollRef} />
        </div>

        {/* 첫 대화일 때만 추천 문구 노출 */}
        {messages.length === 0 && !busy && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-caption font-medium text-gray-600 transition-colors hover:border-primary-200 hover:text-primary-600"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* 입력창 */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="sticky bottom-0 flex items-end gap-2 bg-canvas/85 py-2 backdrop-blur-md"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="메시지를 입력하세요…"
            className="max-h-32 flex-1 resize-none rounded-2xl bg-white px-4 py-3 text-body-lg text-gray-900 shadow-soft placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          <button
            type="submit"
            disabled={!input.trim() || busy}
            aria-label="보내기"
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white transition-transform active:scale-[0.95]",
              !input.trim() || busy ? "bg-gray-200" : "bg-primary-500",
            )}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 12l16-8-6 8 6 8-16-8z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                fill="currentColor"
              />
            </svg>
          </button>
        </form>
      </Screen>
    </div>
  );
}

// ── 말풍선 ───────────────────────────────────────
function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <span className="mr-2 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-lg">
          🤖
        </span>
      )}
      <div
        className={cn(
          "max-w-[78%] whitespace-pre-wrap rounded-3xl px-4 py-3 text-body-lg leading-relaxed",
          isUser
            ? "rounded-br-lg bg-primary-500 text-white"
            : "rounded-bl-lg bg-white text-gray-800 shadow-soft",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function Dot({ delay = "0ms" }: { delay?: string }) {
  return (
    <span
      className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-300"
      style={{ animationDelay: delay }}
    />
  );
}
