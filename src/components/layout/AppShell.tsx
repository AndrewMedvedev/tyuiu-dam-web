import { useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { DevUserSwitcher } from "../DevUserSwitcher";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout, switchUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const hideNav = ["/login", "/register"].includes(location.pathname);

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      }}
    >
      {/* Ambient blobs */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: "60vw",
            height: "60vw",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-10%",
            width: "50vw",
            height: "50vw",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "40%",
            width: "40vw",
            height: "40vw",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Header */}
      {!hideNav && (
        <header
          className="sticky top-0 z-50"
          style={{
            background: "rgba(15, 12, 41, 0.55)",
            backdropFilter: "blur(24px) saturate(1.6)",
            WebkitBackdropFilter: "blur(24px) saturate(1.6)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 1px 40px rgba(0,0,0,0.3)",
          }}
        >
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            {/* Logo */}
            <Link
              to="/collections"
              className="flex items-center gap-2.5 select-none"
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background:
                    "linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 16px rgba(129,140,248,0.5)",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </div>
              <span className="text-base font-semibold text-white tracking-tight">
                TIU DAM
              </span>
            </Link>

            {/* Desktop nav */}
            {user && (
              <nav className="hidden md:flex items-center gap-1">
                {[
                  { to: "/collections", label: "Коллекции" },
                  { to: "/profile", label: "Профиль" },
                ].map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      [
                        "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-white/60 hover:text-white hover:bg-white/5",
                      ].join(" ")
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>
            )}

            {/* Right side */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <DevUserSwitcher
                    currentUserId={user.id}
                    onSelect={switchUser}
                  />
                  <div
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #818cf8, #a78bfa)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 600,
                        color: "white",
                      }}
                    >
                      {user.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <span className="text-sm text-white/80">
                      {user.name.split(" ")[0]}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all text-white/60 hover:text-white hover:bg-white/5"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-all"
                  style={{
                    background:
                      "linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)",
                    boxShadow: "0 0 16px rgba(129,140,248,0.35)",
                  }}
                >
                  Войти
                </Link>
              )}

              {/* Mobile burger */}
              <button
                type="button"
                className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
                onClick={() => setIsOpen((p) => !p)}
                aria-label="Меню"
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  {isOpen ? (
                    <path d="M18 6L6 18M6 6l12 12" />
                  ) : (
                    <path d="M3 12h18M3 6h18M3 18h18" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isOpen && user && (
            <div
              className="md:hidden border-t px-4 py-3 space-y-1"
              style={{
                borderColor: "rgba(255,255,255,0.08)",
                background: "rgba(15,12,41,0.7)",
              }}
            >
              {[
                { to: "/collections", label: "Коллекции" },
                { to: "/profile", label: "Профиль" },
              ].map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    [
                      "block px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:text-white",
                    ].join(" ")
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          )}
        </header>
      )}

      {/* Main content */}
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative">
        {/* Glass content wrapper */}
        <div
          style={{
            borderRadius: 24,
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px) saturate(1.4)",
            WebkitBackdropFilter: "blur(20px) saturate(1.4)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "2rem",
            minHeight: "70vh",
          }}
        >
          <PageStyleOverride />
          {children}
        </div>
      </main>
    </div>
  );
}

/**
 * Injects scoped CSS so all child page components (which use Tailwind classes
 * like border-slate-200, bg-white, text-slate-900 etc.) look correct on the
 * dark glass background without touching every page file.
 */
function PageStyleOverride() {
  return (
    <style>{`
      /* Cards & surfaces */
      .glass-card,
      [class*="rounded-2xl"][class*="border"],
      [class*="rounded-xl"][class*="border"] {
        background: rgba(255,255,255,0.07) !important;
        border-color: rgba(255,255,255,0.12) !important;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }

      /* White backgrounds → translucent glass */
      [class*="bg-white"] {
        background: rgba(255,255,255,0.07) !important;
      }
      [class*="bg-slate-50"],
      [class*="bg-slate-100"] {
        background: rgba(255,255,255,0.05) !important;
      }

      /* Text colors */
      [class*="text-slate-900"],
      [class*="text-slate-950"] {
        color: rgba(255,255,255,0.95) !important;
      }
      [class*="text-slate-800"],
      [class*="text-slate-700"] {
        color: rgba(255,255,255,0.75) !important;
      }
      [class*="text-slate-600"],
      [class*="text-slate-500"],
      [class*="text-slate-400"] {
        color: rgba(255,255,255,0.45) !important;
      }

      /* Borders */
      [class*="border-slate-200"],
      [class*="border-slate-100"] {
        border-color: rgba(255,255,255,0.1) !important;
      }
      [class*="border-dashed"] {
        border-color: rgba(255,255,255,0.15) !important;
      }

      /* Inputs & selects */
      input:not([type="range"]):not([type="file"]):not([type="checkbox"]),
      textarea,
      select {
        background: rgba(255,255,255,0.06) !important;
        border-color: rgba(255,255,255,0.14) !important;
        color: rgba(255,255,255,0.92) !important;
        caret-color: #a78bfa;
      }
      input::placeholder,
      textarea::placeholder {
        color: rgba(255,255,255,0.28) !important;
      }
      input:focus,
      textarea:focus,
      select:focus {
        border-color: rgba(167,139,250,0.6) !important;
        outline: none;
        box-shadow: 0 0 0 3px rgba(167,139,250,0.15);
      }
      select option {
        background: #302b63;
        color: #fff;
      }

      /* Primary buttons (bg-slate-900) */
      [class*="bg-slate-900"] {
        background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%) !important;
        box-shadow: 0 0 18px rgba(129,140,248,0.35) !important;
        color: #fff !important;
      }
      [class*="bg-slate-900"]:hover {
        background: linear-gradient(135deg, #6366f1 0%, #9333ea 100%) !important;
      }
      [class*="bg-slate-700"] {
        background: linear-gradient(135deg, #6366f1 0%, #9333ea 100%) !important;
      }

      /* Sky accent */
      [class*="text-sky-700"],
      [class*="text-sky-600"] {
        color: #a78bfa !important;
      }
      [class*="bg-sky-600"] {
        background: linear-gradient(135deg, #818cf8, #a78bfa) !important;
      }
      [class*="bg-sky-100"] {
        background: rgba(167,139,250,0.15) !important;
      }
      [class*="text-sky-700"] {
        color: #c4b5fd !important;
      }

      /* Rose errors */
      [class*="text-rose-600"],
      [class*="text-rose-500"] {
        color: #fca5a5 !important;
      }
      [class*="border-rose-"] {
        border-color: rgba(252,165,165,0.3) !important;
      }
      [class*="bg-rose-50"] {
        background: rgba(252,165,165,0.08) !important;
      }

      /* Secondary/outline buttons */
      [class*="border-slate-200"].rounded-xl,
      [class*="border-slate-200"].rounded-2xl {
        border-color: rgba(255,255,255,0.12) !important;
        color: rgba(255,255,255,0.7) !important;
      }
      [class*="border-slate-200"].rounded-xl:hover,
      [class*="border-slate-200"].rounded-2xl:hover {
        background: rgba(255,255,255,0.07) !important;
        color: #fff !important;
      }

      /* Segment controls (bg-slate-100 tabs) */
      [class*="bg-slate-100"].rounded-xl,
      [class*="bg-slate-100"].rounded-2xl {
        background: rgba(255,255,255,0.06) !important;
      }

      /* Active tab (bg-white inside segment) */
      [class*="bg-white"].shadow-sm {
        background: rgba(255,255,255,0.14) !important;
        box-shadow: 0 1px 6px rgba(0,0,0,0.25) !important;
      }

      /* Tab active text */
      [class*="border-sky-600"] {
        border-color: #a78bfa !important;
      }

      /* Role badges */
      [class*="rounded-full"][class*="bg-sky-100"] {
        background: rgba(129,140,248,0.18) !important;
        color: #c4b5fd !important;
        border: 1px solid rgba(167,139,250,0.25);
      }

      /* File inputs */
      input[type="file"] {
        color: rgba(255,255,255,0.6) !important;
      }
      input[type="file"]::file-selector-button {
        background: rgba(167,139,250,0.2) !important;
        color: #c4b5fd !important;
        border: none;
        border-radius: 8px;
        padding: 4px 10px;
      }

      /* Range sliders */
      .relative.h-1.rounded-full {
        background: rgba(255,255,255,0.1) !important;
      }
      .absolute.inset-y-0.left-0.rounded-full.bg-slate-900 {
        background: linear-gradient(90deg, #818cf8, #a78bfa) !important;
      }

      /* Danger button (delete) */
      [class*="border-rose-200"] {
        border-color: rgba(252,165,165,0.25) !important;
      }
      [class*="text-rose-600"] {
        color: #fca5a5 !important;
      }
      [class*="bg-rose-50"]:hover {
        background: rgba(252,165,165,0.1) !important;
      }

      /* Scrollbar */
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }
    `}</style>
  );
}
