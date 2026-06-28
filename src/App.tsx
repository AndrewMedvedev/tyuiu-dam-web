import { Suspense, lazy, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { LoadingFallback } from "./components/LoadingFallback";
import { useAuth } from "./context/AuthContext";

const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("./pages/RegisterPage").then((m) => ({ default: m.RegisterPage })),
);
const CollectionsPage = lazy(() =>
  import("./pages/CollectionsPage").then((m) => ({
    default: m.CollectionsPage,
  })),
);
const CollectionDetailPage = lazy(() =>
  import("./pages/CollectionDetailPage").then((m) => ({
    default: m.CollectionDetailPage,
  })),
);
const CollectionSettingsPage = lazy(() =>
  import("./pages/CollectionSettingsPage").then((m) => ({
    default: m.CollectionSettingsPage,
  })),
);
const WatermarksPage = lazy(() =>
  import("./pages/WatermarksPage").then((m) => ({ default: m.WatermarksPage })),
);
const EditorPage = lazy(() =>
  import("./pages/EditorPage").then((m) => ({ default: m.EditorPage })),
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/collections"
              element={
                <RequireAuth>
                  <CollectionsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/collections/:id"
              element={
                <RequireAuth>
                  <CollectionDetailPage />
                </RequireAuth>
              }
            />
            <Route
              path="/collections/:id/settings"
              element={
                <RequireAuth>
                  <CollectionSettingsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/collections/:id/editor/:fileId"
              element={
                <RequireAuth>
                  <EditorPage />
                </RequireAuth>
              }
            />
            <Route
              path="/collections/:id/watermarks"
              element={
                <RequireAuth>
                  <WatermarksPage />
                </RequireAuth>
              }
            />
            <Route path="/" element={<Navigate to="/collections" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
