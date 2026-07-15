import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Header } from "../../components/common";
import { useAuth } from "../../hooks/useAuth";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", name: "", phone: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const valid = form.email.trim() && form.password.length >= 4 && form.name.trim();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signup({
        email: form.email.trim(),
        password: form.password,
        name: form.name.trim(),
        phone: form.phone.trim() || null,
      });
      navigate("/child", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full rounded-input bg-gray-100 px-4 py-4 text-body-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200";

  return (
    <div className="app-shell min-h-dvh">
      <Header title="회원가입" subtitle="온기 시작하기" onBack={() => navigate("/child/login")} />
      <form onSubmit={onSubmit} className="space-y-3 px-[--app-gutter] pb-10 pt-2">
        <input type="text" value={form.name} onChange={set("name")} placeholder="이름" className={inputClass} />
        <input
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={set("email")}
          placeholder="이메일"
          className={inputClass}
        />
        <input
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={set("password")}
          placeholder="비밀번호 (4자 이상)"
          className={inputClass}
        />
        <input
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={set("phone")}
          placeholder="전화번호 (선택)"
          className={inputClass}
        />

        {error && (
          <p className="rounded-input bg-danger-light px-4 py-3 text-body font-medium text-danger-dark">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth disabled={busy || !valid}>
          {busy ? "가입 중…" : "회원가입하고 시작하기"}
        </Button>
      </form>
    </div>
  );
}
