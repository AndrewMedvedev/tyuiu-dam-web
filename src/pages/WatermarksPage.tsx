import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCollectionById,
  getCollectionWatermarks,
  uploadWatermark,
  deleteWatermark,
} from "../mocks/api";
import { useAuth } from "../context/AuthContext";
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
  const [name, setName] = useState("");
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

  if (loading) return <LoadingFallback />;
  if (!collection || !user)
    return <p className="text-sm text-slate-500">Коллекция не найдена.</p>;

  const currentRole = collection.members.find(
    (m: any) => m.userId === user.id,
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
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(watermarkFile);
        });
      } else {
        const label = name || "Водяной знак";
        imageUrl = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 280 80'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Inter, sans-serif' font-size='26' fill='%231d4ed8'>${encodeURIComponent(label)}</text></svg>`;
      }
      const watermark = await uploadWatermark(
        user.id,
        id,
        name || "Водяной знак",
        imageUrl,
      );
      setWatermarks((prev) => [...prev, watermark]);
      setName("");
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
      setWatermarks((prev) => prev.filter((wm) => wm.id !== watermarkId));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate(`/collections/${id}`)}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
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
        {collection.title}
      </button>

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Водяные знаки
              </span>
              <RoleBadge role={currentRole || "participant"} />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {collection.title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Логотипы и подписи для наложения на фото.
            </p>
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-rose-500">{error}</p>}

      {/* Add watermark */}
      {canManage ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Добавить водяной знак
          </h2>
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1 w-fit">
            {(["text", "file"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setWatermarkType(type)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  watermarkType === type
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {type === "text" ? "Текст" : "Файл"}
              </button>
            ))}
          </div>

          {watermarkType === "text" ? (
            <div className="flex gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Текст водяного знака"
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 transition-colors"
              />
              <button
                onClick={handleAdd}
                disabled={adding || !name.trim()}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-40 transition-colors"
              >
                {adding ? "Добавление…" : "Добавить"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex items-center gap-2 flex-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 cursor-pointer hover:border-slate-400 transition-colors">
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                {watermarkFile ? watermarkFile.name : "Выбрать изображение"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setWatermarkFile(file);
                      setName(file.name.replace(/\.[^/.]+$/, ""));
                    }
                  }}
                />
              </label>
              {watermarkFile && (
                <>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Название"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 w-36"
                  />
                  <button
                    onClick={handleAdd}
                    disabled={adding}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-40 transition-colors"
                  >
                    {adding ? "Добавление…" : "Добавить"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-400">
          Управление водяными знаками доступно только модераторам и создателям.
        </div>
      )}

      {/* Watermarks grid */}
      {watermarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              className="text-slate-400"
            >
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM8 12h8M12 8v8" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-900">
            Библиотека пуста
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Добавьте первый знак выше.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {watermarks.map((wm) => (
            <div
              key={wm.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3"
            >
              <div className="rounded-xl bg-slate-50 p-4 flex items-center justify-center h-24">
                <img
                  src={wm.imageUrl}
                  alt={wm.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {wm.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {wm.addedAt} · {wm.createdBy}
                </p>
              </div>
              {canManage && (
                <button
                  onClick={() => handleDelete(wm.id)}
                  className="w-full rounded-xl border border-rose-100 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  Удалить
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
