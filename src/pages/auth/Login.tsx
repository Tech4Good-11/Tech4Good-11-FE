import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/common";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login({ email: email.trim(), password });
      navigate("/child", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell flex min-h-dvh flex-col px-[--app-gutter] pb-10 pt-safe">
      <div className="pt-16">
        <p className="text-body-lg font-semibold text-primary-500">온기</p>
        <h1 className="mt-2 text-display font-bold text-gray-900">로그인</h1>
        <p className="mt-2 text-body-lg text-gray-500">부모님 건강을 함께 돌봐요.</p>
      </div>

      <form onSubmit={onSubmit} className="mt-10 space-y-3">
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          className="w-full rounded-input bg-gray-100 px-4 py-4 text-body-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          className="w-full rounded-input bg-gray-100 px-4 py-4 text-body-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />

        {error && (
          <p className="rounded-input bg-danger-light px-4 py-3 text-body font-medium text-danger-dark">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth disabled={busy || !email.trim() || !password}>
          {busy ? "로그인 중…" : "로그인"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate("/child/signup")}
          className="text-body font-semibold text-primary-500"
        >
          계정이 없으신가요? 회원가입
        </button>
      </div>

      <button
        onClick={() => navigate("/")}
        className="mt-auto pt-8 text-center text-caption text-gray-400"
      >
        ← 역할 선택으로
      </button>
    </div>
  );
}
