export function LoadingFallback() {
  return (
    <div className="flex min-h-60 items-center justify-center rounded-[28px] border border-white/30 bg-white/40 p-8 shadow-glow backdrop-blur-xl">
      <div className="flex flex-col items-center gap-3 text-slate-700">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-300 border-t-sky-600" />
        <span className="text-sm font-medium">Загрузка...</span>
      </div>
    </div>
  );
}
