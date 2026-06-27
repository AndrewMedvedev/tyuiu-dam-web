import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserCollections } from "../mocks/api";
import { CollectionCard } from "../components/CollectionCard";
import { LoadingFallback } from "../components/LoadingFallback";

export function ProfilePage() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getUserCollections(user.id).then((items) => {
      setCollections(items);
      setLoading(false);
    });
  }, [user]);

  if (!user)
    return <p className="text-sm text-slate-500">Требуется авторизация.</p>;

  if (loading) return <LoadingFallback />;

  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-lg font-semibold shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
              Профиль
            </p>
            <h1 className="text-xl font-semibold text-slate-900">
              {user.name}
            </h1>
            <p className="text-sm text-slate-400">{user.email}</p>
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Зарегистрирован:{" "}
            <span className="text-slate-600">{user.registeredAt}</span>
          </p>
        </div>
      </div>

      {/* Collections */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Мои коллекции
        </h2>
        {collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm font-semibold text-slate-900">Пусто</p>
            <p className="mt-1 text-xs text-slate-400">
              Создайте коллекцию или присоединитесь к существующей.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
