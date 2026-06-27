import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="text-center">
        <p className="text-7xl font-semibold text-slate-100 select-none">404</p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">
          Страница не найдена
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Этот путь не существует или был удалён.
        </p>
        <Link
          to="/collections"
          className="inline-flex items-center gap-2 mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
        >
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          В коллекции
        </Link>
      </div>
    </div>
  );
}
