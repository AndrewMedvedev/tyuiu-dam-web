import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCollectionById,
  getCollectionWatermarks,
  uploadWatermark,
  deleteWatermark,
} from "../mocks/api";
import { useAuth } from "../context/AuthContext";
import { GlassButton } from "../components/GlassButton";
import { GlassSurface } from "../components/GlassSurface";
import { LoadingFallback } from "../components/LoadingFallback";
import { RoleBadge } from "../components/RoleBadge";

export function WatermarksPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [collection, setCollection] = useState<any | null>(null);
  const [watermarks, setWatermarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("Новый водяной знак");
  const [watermarkType, setWatermarkType] = useState<"text" | "file">("text");
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getCollectionById(id), getCollectionWatermarks(id)])
      .then(([collectionData, watermarksData]) => {
        setCollection(collectionData);
        setWatermarks(watermarksData);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <LoadingFallback />;
  }

  if (!collection || !user) {
    return <p className="text-slate-700">Коллекция не найдена.</p>;
  }

  const currentRole = collection.members.find(
    (member: any) => member.userId === user.id,
  )?.role;
  const canManage = currentRole === "creator" || currentRole === "moderator";

  const handleAdd = async () => {
    if (!id) return;
    setAdding(true);
    setError(null);
    try {
      let imageUrl: string;

      if (watermarkType === "file" && watermarkFile) {
        const reader = new FileReader();
        imageUrl = await new Promise((resolve, reject) => {
          reader.onload = (event) => {
            const data = event.target?.result as string;
            resolve(data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(watermarkFile);
        });
      } else {
        imageUrl = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 280 80'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Inter, sans-serif' font-size='26' fill='%231d4ed8'>${encodeURIComponent(name)}</text></svg>`;
      }

      const watermark = await uploadWatermark(user.id, id, name, imageUrl);
      setWatermarks((prev) => [...prev, watermark]);
      setName("Новый водяной знак");
      setWatermarkFile(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (watermarkId: string) => {
    if (!id) return;
    setError(null);
    try {
      await deleteWatermark(user.id, id, watermarkId);
      setWatermarks((prev) => prev.filter((item) => item.id !== watermarkId));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex gap-3">
        <GlassButton
          variant="secondary"
          onClick={() => navigate(`/collections/${id}`)}
          className="w-auto"
        >
          ← Вернуться в коллекцию
        </GlassButton>
      </div>
      <GlassSurface className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-sm uppercase tracking-[0.24em] text-sky-700">
              Библиотека водяных знаков
            </span>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">
              {collection.title}
            </h2>
          </div>
          <RoleBadge role={currentRole || "participant"} />
        </div>
        <p className="mt-3 text-sm text-slate-600">
          Здесь хранятся логотипы и подписи, которые можно применить к фото.
        </p>
      </GlassSurface>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {canManage ? (
        <GlassSurface className="p-6 space-y-4">
          <div className="flex gap-3">
            <button
              onClick={() => setWatermarkType("text")}
              className={`flex-1 rounded-3xl px-4 py-3 text-sm font-semibold transition ${watermarkType === "text" ? "bg-sky-600 text-white" : "border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
            >
              Текстовый
            </button>
            <button
              onClick={() => setWatermarkType("file")}
              className={`flex-1 rounded-3xl px-4 py-3 text-sm font-semibold transition ${watermarkType === "file" ? "bg-sky-600 text-white" : "border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
            >
              Из файла
            </button>
          </div>
          {watermarkType === "text" ? (
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Название водяного знака"
                className="w-full rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400"
              />
              <GlassButton onClick={handleAdd} disabled={adding}>
                {adding ? "Загрузка..." : "Добавить текст"}
              </GlassButton>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <div className="flex gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      setWatermarkFile(file);
                      setName(file.name.replace(/\.[^/.]+$/, ""));
                    }
                  }}
                  className="flex-1 rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 file:mr-3 file:border-0 file:bg-sky-100 file:px-2 file:py-1 file:text-sm file:font-semibold file:text-sky-700"
                />
                {watermarkFile && (
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Название водяного знака"
                    className="rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400"
                  />
                )}
              </div>
              {watermarkFile && (
                <GlassButton onClick={handleAdd} disabled={adding}>
                  {adding ? "Загрузка..." : "Добавить файл"}
                </GlassButton>
              )}
            </div>
          )}
        </GlassSurface>
      ) : (
        <GlassSurface className="p-6 text-slate-600">
          У вас нет доступа к управлению водяными знаками.
        </GlassSurface>
      )}
      {watermarks.length === 0 ? (
        <GlassSurface className="p-10 text-center">
          <h3 className="text-xl font-semibold text-slate-950">
            В библиотеке пока нет водяных знаков
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Загрузите первый знак, чтобы использовать его в редакторе.
          </p>
        </GlassSurface>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {watermarks.map((watermark) => (
            <GlassSurface key={watermark.id} className="p-4">
              <div className="flex flex-col gap-4">
                <div className="rounded-3xl bg-slate-50 p-3">
                  <img
                    src={watermark.imageUrl}
                    alt={watermark.name}
                    className="h-24 w-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-950">
                    {watermark.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Добавлен {watermark.addedAt}
                  </p>
                  <p className="text-sm text-slate-500">
                    Автор: {watermark.createdBy}
                  </p>
                </div>
                <GlassButton
                  variant="secondary"
                  onClick={() => handleDelete(watermark.id)}
                >
                  Удалить
                </GlassButton>
              </div>
            </GlassSurface>
          ))}
        </div>
      )}
    </div>
  );
}
