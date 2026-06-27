import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAssetsByCollection,
  getCollectionById,
  uploadAsset,
} from "../mocks/api";
import { useAuth } from "../context/AuthContext";
import { useCollectionRole } from "../hooks/useCollectionRole";
import { AssetCard } from "../components/AssetCard";
import { LoadingFallback } from "../components/LoadingFallback";
import { RoleBadge } from "../components/RoleBadge";

export function CollectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = useCollectionRole(id);
  const [collection, setCollection] = useState<any | null>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getCollectionById(id), getAssetsByCollection(id)])
      .then(([collectionData, assetData]) => {
        setCollection(collectionData);
        setAssets(assetData);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  const filteredAssets = useMemo(() => assets, [assets]);
  const canUpload = role === "creator";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async () => {
    if (!id || !user || !uploadFile) return;
    setUploading(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageData = event.target?.result as string;
        const asset = await uploadAsset(
          user.id,
          id,
          uploadTitle || uploadFile.name,
          uploadFile.name,
          imageData,
        );
        setAssets((prev) => [asset, ...prev]);
        setUploadTitle("");
        setUploadFile(null);
        navigate(`/collections/${id}/editor/${asset.id}`);
      };
      reader.readAsDataURL(uploadFile);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingFallback />;

  if (error || !collection) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6">
        <p className="text-sm text-rose-600">
          {error ?? "Коллекция не найдена."}
        </p>
        <button
          onClick={() => navigate("/collections")}
          className="mt-3 text-sm text-slate-600 hover:text-slate-900 underline"
        >
          Вернуться к коллекциям
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate("/collections")}
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
        Коллекции
      </button>

      {/* Collection header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Коллекция
              </span>
              {role && <RoleBadge role={role} />}
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {collection.title}
            </h1>
            <p className="text-sm text-slate-500">{collection.description}</p>
            <div className="flex flex-wrap gap-3 pt-1">
              {[
                { label: "Файлов", value: collection.assetCount },
                { label: "Участников", value: collection.members.length },
                { label: "Создано", value: collection.createdAt },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg bg-slate-50 px-3 py-2"
                >
                  <p className="text-xs text-slate-400">{stat.label}</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => navigate(`/collections/${id}/settings`)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Настройки
            </button>
            <button
              onClick={() => navigate(`/collections/${id}/watermarks`)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Водяные знаки
            </button>
          </div>
        </div>
      </div>

      {/* Gallery section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Галерея</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Миниатюры, скачивание и редактирование.
          </p>
        </div>
        {canUpload ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-600 cursor-pointer hover:border-slate-400 hover:bg-slate-100 transition-colors">
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
              {uploadFile ? uploadFile.name : "Выбрать файл"}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {uploadFile && (
              <>
                <input
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Название"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 w-36"
                />
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 transition-colors"
                >
                  {uploading ? "Загрузка…" : "Загрузить"}
                </button>
              </>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            Загружать может только создатель
          </p>
        )}
      </div>

      {error && !loading && <p className="text-xs text-rose-500">{error}</p>}

      {filteredAssets.length === 0 ? (
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
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-900">Пустая галерея</p>
          <p className="mt-1 text-xs text-slate-400">
            Добавьте первый файл через кнопку выше.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
}
