import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header, Screen } from "../../components/common";
import { consultApi, eldersApi } from "../../apis";
import { useApi } from "../../hooks/useApi";
import type { ChatHistoryMessage } from "../../types/api";
import { cn } from "../../utils/cn";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// 자녀(보호자)가 부모님 상태에 대해 AI에게 묻는 관점의 예시
const SUGGESTIONS = [
  "어머니 요즘 어떠세요?",
  "잠은 잘 주무시나요?",
  "약은 잘 챙겨 드시나요?",
  "제가 뭘 챙겨드리면 좋을까요?",
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

  const greeting = `${name ? `${name}님` : "부모님"}에 대해 궁금한 점을 물어보세요. 남기신 대화·건강 기록을 바탕으로 알려드릴게요.`;

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;

    // 상담은 서버에 저장되지 않으므로, 맥락을 이어가려면 history 를 직접 넘긴다
    const history: ChatHistoryMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      // ⚠️ 자녀 화면은 /consult (저장·지표추출 없음). /chat 을 쓰면 어르신 발화로 오염됨
      const res = await consultApi.sendConsult(elderId, { message, history });
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
