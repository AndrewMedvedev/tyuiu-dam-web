import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserCollections } from "../mocks/api";
import { GlassSurface } from "../components/GlassSurface";
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

  if (!user) {
    return <p className="text-slate-700">Требуется авторизация.</p>;
  }

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <div className="space-y-8">
      <GlassSurface className="p-6">
        <div className="grid gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-700">
              Профиль
            </p>
            <h2 className="text-3xl font-semibold text-slate-950">
              {user.name}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{user.email}</p>
            <p className="mt-1 text-xs text-slate-500">
              Зарегистрирован: {user.registeredAt}
            </p>
          </div>
        </div>
      </GlassSurface>
      <GlassSurface className="p-6">
        <h3 className="text-xl font-semibold text-slate-950">Мои коллекции</h3>
        <p className="text-sm text-slate-600">
          Список коллекций, в которых вы участвуете.
        </p>
      </GlassSurface>
      {collections.length === 0 ? (
        <GlassSurface className="p-10 text-center">
          <h3 className="text-xl font-semibold text-slate-950">
            Ваша панель пуста
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Создайте коллекцию или присоединитесь к уже существующей.
          </p>
        </GlassSurface>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}
    </div>
  );
}
