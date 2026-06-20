import { Link } from "react-router-dom";
import { GlassSurface } from "../components/GlassSurface";
import { GlassButton } from "../components/GlassButton";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <GlassSurface className="max-w-lg p-10 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-700">
          Страница не найдена
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950">404</h1>
        <p className="mt-3 text-sm text-slate-600">
          Указанный путь не существует или был удален.
        </p>
        <Link to="/collections">
          <GlassButton className="mt-8">Вернуться в коллекции</GlassButton>
        </Link>
      </GlassSurface>
    </div>
  );
}
