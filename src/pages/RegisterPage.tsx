import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("Полина Петрова");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(email, name, password);
      navigate("/collections");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-900 mb-4">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="white"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Регистрация</h1>
          <p className="mt-1 text-sm text-slate-400">Создайте демо-аккаунт</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Имя", value: name, set: setName, type: "text" },
            { label: "Email", value: email, set: setEmail, type: "email" },
            {
              label: "Пароль",
              value: password,
              set: setPassword,
              type: "password",
            },
          ].map(({ label, value, set, type }) => (
            <div key={label}>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                {label}
              </label>
              <input
                value={value}
                onChange={(e) => set(e.target.value)}
                type={type}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 transition-colors"
              />
            </div>
          ))}
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 transition-colors mt-2"
          >
            {loading ? "Создаём…" : "Зарегистрироваться"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Уже есть аккаунт?{" "}
          <Link
            to="/login"
            className="font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          >
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
