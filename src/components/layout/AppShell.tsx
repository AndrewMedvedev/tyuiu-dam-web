import { useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { DevUserSwitcher } from "../DevUserSwitcher";
export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout, switchUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const hideHero = ["/login", "/register"].includes(location.pathname);

  return (
    <div className="min-h-screen text-slate-900">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(59,130,246,0.12),transparent_24%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(224,242,254,0.95),rgba(224,242,254,0.75))]" />
      </div>
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200/70 bg-slate-50/90 p-4 shadow-glow md:flex-row md:items-center md:justify-between">
            <div className="flex items-center justify-between gap-4">
              <Link
                to="/collections"
                className="text-xl font-semibold tracking-tight text-slate-950"
              >
                TIU DAM
              </Link>
              <button
                type="button"
                className="inline-flex items-center rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 md:hidden"
                onClick={() => setIsOpen((prev) => !prev)}
              >
                Меню
              </button>
            </div>
            <div
              className={`${isOpen ? "block" : "hidden"} md:flex md:items-center md:gap-3`}
            >
              {user ? (
                <>
                  <nav className="flex flex-col gap-2 text-sm font-medium md:flex-row md:gap-4">
                    <NavLink
                      to="/collections"
                      className={({ isActive }) =>
                        isActive
                          ? "text-slate-950"
                          : "text-slate-600 hover:text-slate-900"
                      }
                    >
                      Коллекции
                    </NavLink>
                  </nav>
                </>
              ) : null}
              <div className="flex flex-col gap-2 border-t border-slate-200/50 pt-4 md:border-none md:pt-0 md:flex-row md:items-center md:gap-4">
                {user ? (
                  <>
                    <div className="text-sm text-slate-700">{user.name}</div>
                    <button
                      type="button"
                      className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
                      onClick={logout}
                    >
                      Выйти
                    </button>
                  </>
                ) : (
                  <Link
                    className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
                    to="/login"
                  >
                    Войти
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {!hideHero ? (
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.24em] text-sky-700">
                Digital Asset Management
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Университет ТИУ — центр визуальной памяти
              </h1>
            </div>
            <DevUserSwitcher
              currentUserId={user?.id ?? null}
              onSelect={switchUser}
            />
          </div>
        ) : null}
        {children}
      </main>
    </div>
  );
}
