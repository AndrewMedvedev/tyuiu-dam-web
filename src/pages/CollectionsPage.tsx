import { useEffect, useMemo, useState } from "react";
import type { Collection } from "../mocks/types";
import { getCollections, createCollection } from "../mocks/api";
import { useAuth } from "../context/AuthContext";
import { CollectionCard } from "../components/CollectionCard";
import { GlassButton } from "../components/GlassButton";
import { GlassSurface } from "../components/GlassSurface";
import { LoadingFallback } from "../components/LoadingFallback";

export function CollectionsPage() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("Новая коллекция TIU");
  const [description, setDescription] = useState("Описание новой коллекции");
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
        (collection: any) =>
          collection.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [activeTab, myCollections, otherCollections, search],
  );

  const handleCreate = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const collection = await createCollection(user.id, title, description);
      setCollections((prev) => [collection, ...prev]);
      setTitle("Новая коллекция TIU");
      setDescription("Описание новой коллекции");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <div className="space-y-8">
      <GlassSurface className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-700">
              Коллекции
            </p>
            <h2 className="text-2xl font-semibold text-slate-950">
              Ваши коллекции
            </h2>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-slate-700 hover:text-slate-900 underline"
          >
            Обновить
          </button>
        </div>
        <div className="mt-6 flex gap-3 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("mine")}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === "mine"
                ? "border-b-2 border-sky-600 text-sky-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Мои коллекции
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === "all"
                ? "border-b-2 border-sky-600 text-sky-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Все коллекции
          </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск коллекций"
            className="rounded-3xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400"
          />
          {activeTab === "mine" && (
            <GlassButton onClick={handleCreate} disabled={creating}>
              {creating ? "Создание..." : "Создать коллекцию"}
            </GlassButton>
          )}
        </div>
      </GlassSurface>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {filteredCollections.length === 0 ? (
        <GlassSurface className="p-10 text-center">
          <h3 className="text-xl font-semibold text-slate-950">
            {activeTab === "mine"
              ? "У вас нет созданных коллекций"
              : "Других коллекций нет"}
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {activeTab === "mine"
              ? "Создайте первую коллекцию и добавьте туда файлы."
              : "Попросите доступ к коллекции у другого пользователя."}
          </p>
        </GlassSurface>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCollections.map((collection: any) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}
    </div>
  );
}
