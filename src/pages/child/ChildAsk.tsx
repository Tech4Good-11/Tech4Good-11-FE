import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Header, Screen } from "../../components/common";
import { useApp } from "../../hooks/useApp";
import { nextId } from "../../data/mockData";
import { cn } from "../../utils/cn";

const SUGGESTIONS = [
  "오늘 아침은 드셨어요?",
  "약은 잘 챙겨 드셨나요?",
  "어디 불편한 곳은 없으세요?",
  "잠은 잘 주무셨어요?",
];

export default function ChildAsk() {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [sent, setSent] = useState<string[]>([]);

  function ask(text: string) {
    const q = text.trim();
    if (!q) return;

    // 부모 대화창에 AI가 대신 질문을 전달
    dispatch({
      type: "ADD_CHAT_MESSAGE",
      message: {
        id: nextId("msg"),
        sender: "ai",
        text: `자녀분이 여쭤보셨어요.\n"${q}"`,
        timestamp: new Date().toISOString(),
        quickReplies: ["네, 괜찮아요", "아니요"],
      },
    });
    dispatch({
      type: "ADD_NOTIFICATION",
      notification: {
        id: nextId("noti"),
        type: "alert",
        title: "부모님께 질문을 보냈어요",
        message: q,
        read: false,
        createdAt: new Date().toISOString(),
      },
    });
    setSent((prev) => [q, ...prev]);
    setInput("");
  }

  return (
    <>
      <Header title="AI 추가 질문" subtitle="부모님께 물어보기" onBack={() => navigate("/child")} />
      <Screen withNav={false} className="space-y-4">
        <Card padding="lg">
          <p className="text-body-lg font-semibold text-gray-800">
            궁금한 점을 보내면 AI가 부모님께 대신 여쭤봐요.
          </p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            placeholder="예) 오늘 기분은 어떠세요?"
            className="mt-3 w-full resize-none rounded-input bg-gray-100 px-4 py-3 text-body-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className={cn(
                  "rounded-full border border-gray-200 bg-white px-3 py-1.5 text-caption font-medium text-gray-600",
                  "transition-colors hover:border-primary-200 hover:text-primary-600",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <Button fullWidth className="mt-4" disabled={!input.trim()} onClick={() => ask(input)}>
            질문 보내기
          </Button>
        </Card>

        {sent.length > 0 && (
          <div>
            <h2 className="mb-2 px-1 text-body-lg font-bold text-gray-900">보낸 질문</h2>
            <div className="space-y-2">
              {sent.map((q, i) => (
                <Card key={i} padding="md">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📤</span>
                    <p className="flex-1 text-body-lg text-gray-800">{q}</p>
                    <span className="text-caption font-medium text-primary-500">전송됨</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Screen>
    </>
  );
}
