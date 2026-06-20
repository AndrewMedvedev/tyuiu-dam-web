import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GlassSurface } from "../components/GlassSurface";
import { GlassButton } from "../components/GlassButton";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("polina.petrova@tiu.ru");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/collections");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <GlassSurface className="w-full max-w-md p-8">
        <div className="mb-6 space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-700">
            Добро пожаловать
          </p>
          <h1 className="text-3xl font-semibold text-slate-950">
            Вход в TIU DAM
          </h1>
          <p className="text-sm text-slate-600">
            Используйте демо-учетную запись, чтобы исследовать интерфейс.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-800">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-800">Пароль</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400"
              required
            />
          </label>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <GlassButton
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Входим..." : "Войти"}
          </GlassButton>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Нет аккаунта?{" "}
          <Link
            to="/register"
            className="font-semibold text-sky-700 hover:text-sky-900"
          >
            Зарегистрироваться
          </Link>
        </p>
      </GlassSurface>
    </div>
  );
}
