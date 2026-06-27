import { useEffect, useMemo, useState } from "react";
import type { Collection } from "../mocks/types";
import { getCollections, createCollection } from "../mocks/api";
import { useAuth } from "../context/AuthContext";
import { CollectionCard } from "../components/CollectionCard";
import { LoadingFallback } from "../components/LoadingFallback";

export function CollectionsPage() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"mine" | "all">("mine");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getCollections(user.id)
      .then((items) => setCollections(items))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [user]);

  const myCollections = useMemo(
    () =>
      collections.filter((col: any) =>
        col.members.some(
          (m: any) => m.userId === user?.id && m.role === "creator",
        ),
      ),
    [collections, user],
  );

  const otherCollections = useMemo(
    () =>
      collections.filter(
        (col: any) =>
          !col.members.some(
            (m: any) => m.userId === user?.id && m.role === "creator",
          ),
      ),
    [collections, user],
  );

  const filteredCollections = useMemo(
    () =>
      (activeTab === "mine" ? myCollections : otherCollections).filter(
        (c: any) => c.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [activeTab, myCollections, otherCollections, search],
  );

  const handleCreate = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const collection = await createCollection(
        user.id,
        "Новая коллекция",
        "Описание коллекции",
      );
      setCollections((prev) => [collection, ...prev]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingFallback />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1">
            Библиотека
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">Коллекции</h1>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-xs text-slate-400 hover:text-slate-700 transition-colors self-start sm:self-auto"
        >
          Обновить
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Tabs */}
        <div className="flex gap-0 rounded-xl bg-slate-100 p-1 shrink-0">
          {(["mine", "all"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "mine" ? "Мои" : "Все"}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск…"
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 transition-colors"
          />
        </div>

        {activeTab === "mine" && (
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 transition-colors shrink-0"
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            {creating ? "Создание…" : "Новая коллекция"}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-rose-500">{error}</p>}

      {filteredCollections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              className="text-slate-400"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-900">
            {activeTab === "mine" ? "Нет коллекций" : "Нет других коллекций"}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {activeTab === "mine"
              ? "Создайте первую коллекцию выше."
              : "Попросите доступ у другого пользователя."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCollections.map((collection: any) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}
    </div>
  );
}
