import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAssetsByCollection,
  getCollectionById,
  uploadAsset,
} from "../mocks/api";
import { useAuth } from "../context/AuthContext";
import { useCollectionRole } from "../hooks/useCollectionRole";
import { GlassButton } from "../components/GlassButton";
import { AssetCard } from "../components/AssetCard";
import { GlassSurface } from "../components/GlassSurface";
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
  const [uploadTitle, setUploadTitle] = useState("Новое фото");
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

  const collectionRole = role ? <RoleBadge role={role} /> : null;
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
          uploadTitle,
          uploadFile.name,
          imageData,
        );
        setAssets((prev) => [asset, ...prev]);
        setUploadTitle("Новое фото");
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

  if (loading) {
    return <LoadingFallback />;
  }

  if (error || !collection) {
    return (
      <GlassSurface className="p-8">
        <p className="text-sm text-rose-600">
          {error ?? "Коллекция не найдена."}
        </p>
        <GlassButton
          variant="secondary"
          onClick={() => navigate("/collections")}
          className="mt-4"
        >
          Вернуться к коллекциям
        </GlassButton>
      </GlassSurface>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex gap-3">
        <GlassButton
          variant="secondary"
          onClick={() => navigate("/collections")}
          className="w-auto"
        >
          ← Вернуться
        </GlassButton>
      </div>
      <GlassSurface className="p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                Коллекция
              </span>
              {collectionRole}
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold text-slate-950">
                {collection.title}
              </h2>
              <p className="text-slate-600">{collection.description}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                Файлов:{" "}
                <span className="font-semibold text-slate-900">
                  {collection.assetCount}
                </span>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                Создано:{" "}
                <span className="font-semibold text-slate-900">
                  {collection.createdAt}
                </span>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                Участников:{" "}
                <span className="font-semibold text-slate-900">
                  {collection.members.length}
                </span>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <GlassButton
              onClick={() => navigate(`/collections/${id}/settings`)}
              className="w-full"
            >
              Настройки
            </GlassButton>
            <GlassButton
              onClick={() => navigate(`/collections/${id}/watermarks`)}
              variant="secondary"
              className="w-full"
            >
              Водяные знаки
            </GlassButton>
          </div>
        </div>
      </GlassSurface>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">Галерея</h3>
          <p className="text-sm text-slate-600">
            Просматривайте миниатюры, скачивайте и редактируйте изображения.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {canUpload ? (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 file:mr-3 file:border-0 file:bg-sky-100 file:px-2 file:py-1 file:text-sm file:font-semibold file:text-sky-700"
              />
              {uploadFile && (
                <div className="flex gap-2">
                  <input
                    value={uploadTitle}
                    onChange={(event) => setUploadTitle(event.target.value)}
                    placeholder="Название фото"
                    className="rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400"
                  />
                  <GlassButton
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full sm:w-auto"
                  >
                    {uploading ? "Загрузка..." : "Загрузить"}
                  </GlassButton>
                </div>
              )}
              {!uploadFile && (
                <div className="text-sm text-slate-500">Выберите фото</div>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-500">
              Добавлять фото может только создатель коллекции
            </div>
          )}
        </div>
      </div>
      {error && !loading ? (
        <GlassSurface className="p-6 text-sm text-rose-600">
          {error}
        </GlassSurface>
      ) : null}
      {filteredAssets.length === 0 ? (
        <GlassSurface className="p-10 text-center">
          <h3 className="text-xl font-semibold text-slate-950">
            В коллекции нет файлов
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Добавьте файлы в коллекцию через кнопку выше.
          </p>
        </GlassSurface>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
}
