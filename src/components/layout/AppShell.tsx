import { type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { DevUserSwitcher } from "../DevUserSwitcher";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout, switchUser } = useAuth();
  const location = useLocation();
  const hideNav = ["/login", "/register"].includes(location.pathname);

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(160deg, #0a1628 0%, #0d2144 50%, #0a1628 100%)",
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
            top: "-15%",
            left: "-5%",
            width: "55vw",
            height: "55vw",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 70%)",
            filter: "blur(70px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-5%",
            width: "45vw",
            height: "45vw",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)",
            filter: "blur(70px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "35%",
            left: "35%",
            width: "35vw",
            height: "35vw",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(147,197,253,0.08) 0%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
      </div>

      {/* Header */}
      {!hideNav && (
        <header
          className="sticky top-0 z-50"
          style={{
            background: "rgba(10,22,40,0.6)",
            backdropFilter: "blur(24px) saturate(1.8)",
            WebkitBackdropFilter: "blur(24px) saturate(1.8)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 1px 30px rgba(0,0,0,0.4)",
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
                    "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 18px rgba(59,130,246,0.55)",
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

            {/* Right side */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <DevUserSwitcher
                    currentUserId={user.id}
                    onSelect={switchUser}
                  />
                  <div
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
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
                    <span
                      style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}
                    >
                      {user.name.split(" ")[0]}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.55)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "white")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(255,255,255,0.55)")
                    }
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  style={{
                    padding: "6px 18px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "white",
                    textDecoration: "none",
                    background:
                      "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
                    boxShadow: "0 0 16px rgba(59,130,246,0.4)",
                  }}
                >
                  Войти
                </Link>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main */}
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative">
        <div
          style={{
            borderRadius: 24,
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(20px) saturate(1.5)",
            WebkitBackdropFilter: "blur(20px) saturate(1.5)",
            border: "1px solid rgba(255,255,255,0.07)",
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

function PageStyleOverride() {
  return (
    <style>{`
      /* Cards */
      [class*="rounded-2xl"][class*="border"],
      [class*="rounded-xl"][class*="border"] {
        background: rgba(255,255,255,0.05) !important;
        border-color: rgba(255,255,255,0.09) !important;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }
      [class*="bg-white"] {
        background: rgba(255,255,255,0.05) !important;
      }
      [class*="bg-slate-50"], [class*="bg-slate-100"] {
        background: rgba(255,255,255,0.04) !important;
      }

      /* Text */
      [class*="text-slate-900"], [class*="text-slate-950"] { color: rgba(255,255,255,0.95) !important; }
      [class*="text-slate-800"], [class*="text-slate-700"] { color: rgba(255,255,255,0.72) !important; }
      [class*="text-slate-600"], [class*="text-slate-500"], [class*="text-slate-400"] { color: rgba(255,255,255,0.42) !important; }

      /* Borders */
      [class*="border-slate-200"], [class*="border-slate-100"] { border-color: rgba(255,255,255,0.09) !important; }
      [class*="border-dashed"] { border-color: rgba(255,255,255,0.13) !important; }

      /* Inputs */
      input:not([type="range"]):not([type="file"]):not([type="checkbox"]),
      textarea, select {
        background: rgba(255,255,255,0.05) !important;
        border-color: rgba(255,255,255,0.12) !important;
        color: rgba(255,255,255,0.92) !important;
        caret-color: #60a5fa;
      }
      input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.25) !important; }
      input:focus, textarea:focus, select:focus {
        border-color: rgba(96,165,250,0.55) !important;
        outline: none;
        box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
      }
      select option { background: #0d2144; color: #fff; }

      /* Primary buttons */
      [class*="bg-slate-900"] {
        background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%) !important;
        box-shadow: 0 0 18px rgba(59,130,246,0.35) !important;
        color: #fff !important;
      }
      [class*="bg-slate-900"]:hover {
        background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%) !important;
      }
      [class*="bg-slate-700"] {
        background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%) !important;
      }

      /* Sky / accent */
      [class*="text-sky-700"], [class*="text-sky-600"] { color: #93c5fd !important; }
      [class*="bg-sky-600"] { background: linear-gradient(135deg, #2563eb, #3b82f6) !important; }
      [class*="bg-sky-100"] { background: rgba(59,130,246,0.14) !important; }

      /* Errors */
      [class*="text-rose-600"], [class*="text-rose-500"] { color: #fca5a5 !important; }
      [class*="border-rose-"] { border-color: rgba(252,165,165,0.28) !important; }
      [class*="bg-rose-50"] { background: rgba(252,165,165,0.07) !important; }

      /* Secondary outline buttons */
      [class*="border-slate-200"].rounded-xl,
      [class*="border-slate-200"].rounded-2xl {
        border-color: rgba(255,255,255,0.1) !important;
        color: rgba(255,255,255,0.65) !important;
      }
      [class*="border-slate-200"].rounded-xl:hover,
      [class*="border-slate-200"].rounded-2xl:hover {
        background: rgba(255,255,255,0.06) !important;
        color: #fff !important;
      }

      /* Segment tabs */
      [class*="bg-slate-100"].rounded-xl,
      [class*="bg-slate-100"].rounded-2xl { background: rgba(255,255,255,0.05) !important; }
      [class*="bg-white"].shadow-sm {
        background: rgba(255,255,255,0.12) !important;
        box-shadow: 0 1px 6px rgba(0,0,0,0.3) !important;
      }
      [class*="border-sky-600"] { border-color: #60a5fa !important; }

      /* Role badges */
      [class*="rounded-full"][class*="bg-sky-100"] {
        background: rgba(59,130,246,0.18) !important;
        color: #93c5fd !important;
        border: 1px solid rgba(96,165,250,0.22);
      }

      /* File inputs */
      input[type="file"] { color: rgba(255,255,255,0.55) !important; }
      input[type="file"]::file-selector-button {
        background: rgba(59,130,246,0.18) !important;
        color: #93c5fd !important;
        border: none; border-radius: 8px; padding: 4px 10px;
      }

      /* Sliders */
      .relative.h-1.rounded-full { background: rgba(255,255,255,0.1) !important; }
      .absolute.inset-y-0.left-0.rounded-full.bg-slate-900 {
        background: linear-gradient(90deg, #2563eb, #60a5fa) !important;
      }

      /* Danger */
      [class*="border-rose-200"] { border-color: rgba(252,165,165,0.22) !important; }
      [class*="bg-rose-50"]:hover { background: rgba(252,165,165,0.09) !important; }

      /* Scrollbar */
      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
    `}</style>
  );
}
