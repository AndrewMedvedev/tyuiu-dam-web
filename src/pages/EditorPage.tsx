import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAssetById,
  getCollectionById,
  getCollectionWatermarks,
  saveWatermarkState,
} from "../mocks/api";
import { useAuth } from "../context/AuthContext";
import { GlassButton } from "../components/GlassButton";
import { GlassSurface } from "../components/GlassSurface";
import { LoadingFallback } from "../components/LoadingFallback";
import { RoleBadge } from "../components/RoleBadge";

export function EditorPage() {
  const { id, fileId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [collection, setCollection] = useState<any | null>(null);
  const [asset, setAsset] = useState<any | null>(null);
  const [watermarks, setWatermarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageFilter, setImageFilter] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    invert: 0,
  });
  const [editMode, setEditMode] = useState<"watermark" | "image">("image");

  useEffect(() => {
    if (!id || !fileId) return;
    setLoading(true);
    Promise.all([
      getCollectionById(id),
      getAssetById(id, fileId),
      getCollectionWatermarks(id),
    ])
      .then(([collectionData, assetData, watermarksData]) => {
        setCollection(collectionData);
        setAsset(assetData);
        setWatermarks(watermarksData);
        setState(
          assetData.watermarkState ?? {
            watermarkId: watermarksData[0]?.id ?? "",
            x: 0.5,
            y: 0.6,
            scale: 0.22,
            opacity: 0.28,
            rotate: 0,
          },
        );
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [id, fileId]);

  const role = useMemo(() => {
    return collection?.members.find((member: any) => member.userId === user?.id)
      ?.role;
  }, [collection, user]);

  if (loading) {
    return <LoadingFallback />;
  }

  if (!collection || !asset || !user) {
    return (
      <p className="text-slate-700">Файл не найден или доступ ограничен.</p>
    );
  }

  const canEdit = role === "creator" || role === "moderator";

  const handleSave = async () => {
    if (!id || !fileId || !state) return;
    setSaving(true);
    setError(null);
    try {
      await saveWatermarkState(user.id, id, fileId, state);
      navigate(`/collections/${id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <GlassSurface className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-sm uppercase tracking-[0.24em] text-sky-700">
              Редактор фото
            </span>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">
              {asset.title}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <RoleBadge role={role || "participant"} />
            <GlassButton
              variant="secondary"
              onClick={() => navigate(`/collections/${id}`)}
            >
              Назад в коллекцию
            </GlassButton>
          </div>
        </div>
      </GlassSurface>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {!canEdit ? (
        <GlassSurface className="p-10 text-center text-slate-700">
          <h3 className="text-xl font-semibold text-slate-950">
            Доступ ограничен
          </h3>
          <p className="mt-2 text-sm">
            Редактирование водяного знака доступно только модераторам и
            создателям.
          </p>
        </GlassSurface>
      ) : (
        <div className="space-y-6">
          <GlassSurface className="p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
              <button
                onClick={() => setEditMode("image")}
                className={`flex-1 rounded-3xl px-4 py-3 text-sm font-semibold transition ${editMode === "image" ? "bg-sky-600 text-white" : "border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
              >
                Редактирование фото
              </button>
              <button
                onClick={() => setEditMode("watermark")}
                className={`flex-1 rounded-3xl px-4 py-3 text-sm font-semibold transition ${editMode === "watermark" ? "bg-sky-600 text-white" : "border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
              >
                Водяной знак
              </button>
            </div>
          </GlassSurface>
          {editMode === "image" ? (
            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <GlassSurface className="p-6">
                <div className="relative overflow-hidden rounded-[28px] bg-slate-950">
                  <img
                    src={asset.imageUrl}
                    alt={asset.title}
                    className="w-full object-cover"
                    style={{
                      filter: `brightness(${imageFilter.brightness}%) contrast(${imageFilter.contrast}%) saturate(${imageFilter.saturation}%)`,
                    }}
                  />
                </div>
              </GlassSurface>
              <GlassSurface className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-800">
                      Яркость
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={imageFilter.brightness}
                      onChange={(e) =>
                        setImageFilter((prev) => ({
                          ...prev,
                          brightness: Number(e.target.value),
                        }))
                      }
                      className="mt-3 w-full"
                    />
                    <div className="mt-2 text-sm text-slate-600">
                      {imageFilter.brightness}%
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-800">
                      Контрастность
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={imageFilter.contrast}
                      onChange={(e) =>
                        setImageFilter((prev) => ({
                          ...prev,
                          contrast: Number(e.target.value),
                        }))
                      }
                      className="mt-3 w-full"
                    />
                    <div className="mt-2 text-sm text-slate-600">
                      {imageFilter.contrast}%
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-800">
                      Насыщенность
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={imageFilter.saturation}
                      onChange={(e) =>
                        setImageFilter((prev) => ({
                          ...prev,
                          saturation: Number(e.target.value),
                        }))
                      }
                      className="mt-3 w-full"
                    />
                    <div className="mt-2 text-sm text-slate-600">
                      {imageFilter.saturation}%
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-800">
                      Оттенок (Hue)
                    </label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={imageFilter.hue}
                      onChange={(e) =>
                        setImageFilter((prev) => ({
                          ...prev,
                          hue: Number(e.target.value),
                        }))
                      }
                      className="mt-3 w-full"
                    />
                    <div className="mt-2 text-sm text-slate-600">
                      {imageFilter.hue}°
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-800">
                      Размытие (Blur)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="0.1"
                      value={imageFilter.blur}
                      onChange={(e) =>
                        setImageFilter((prev) => ({
                          ...prev,
                          blur: Number(e.target.value),
                        }))
                      }
                      className="mt-3 w-full"
                    />
                    <div className="mt-2 text-sm text-slate-600">
                      {imageFilter.blur.toFixed(1)}px
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-800">
                      Серое (Grayscale)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={imageFilter.grayscale}
                      onChange={(e) =>
                        setImageFilter((prev) => ({
                          ...prev,
                          grayscale: Number(e.target.value),
                        }))
                      }
                      className="mt-3 w-full"
                    />
                    <div className="mt-2 text-sm text-slate-600">
                      {imageFilter.grayscale}%
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-800">
                      Сепия (Sepia)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={imageFilter.sepia}
                      onChange={(e) =>
                        setImageFilter((prev) => ({
                          ...prev,
                          sepia: Number(e.target.value),
                        }))
                      }
                      className="mt-3 w-full"
                    />
                    <div className="mt-2 text-sm text-slate-600">
                      {imageFilter.sepia}%
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-800">
                      Инверсия (Invert)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={imageFilter.invert}
                      onChange={(e) =>
                        setImageFilter((prev) => ({
                          ...prev,
                          invert: Number(e.target.value),
                        }))
                      }
                      className="mt-3 w-full"
                    />
                    <div className="mt-2 text-sm text-slate-600">
                      {imageFilter.invert}%
                    </div>
                  </div>
                </div>
                <GlassButton
                  onClick={() =>
                    setImageFilter({
                      brightness: 100,
                      contrast: 100,
                      saturation: 100,
                      hue: 0,
                      blur: 0,
                      grayscale: 0,
                      sepia: 0,
                      invert: 0,
                    })
                  }
                  variant="secondary"
                >
                  Сбросить фильтры
                </GlassButton>
              </GlassSurface>
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <GlassSurface className="p-6">
                <div className="relative overflow-hidden rounded-[28px] bg-slate-950">
                  <img
                    src={asset.imageUrl}
                    alt={asset.title}
                    className="w-full object-cover"
                    style={{
                      filter: `brightness(${imageFilter.brightness}%) contrast(${imageFilter.contrast}%) saturate(${imageFilter.saturation}%) hue-rotate(${imageFilter.hue}deg) blur(${imageFilter.blur}px) grayscale(${imageFilter.grayscale}%) sepia(${imageFilter.sepia}%) invert(${imageFilter.invert}%)`,
                    }}
                  />
                  {state?.watermarkId ? (
                    <img
                      src={
                        watermarks.find((wm) => wm.id === state.watermarkId)
                          ?.imageUrl
                      }
                      alt="Watermark preview"
                      className="absolute pointer-events-none"
                      style={{
                        left: `${state.x * 100}%`,
                        top: `${state.y * 100}%`,
                        width: `${state.scale * 100}%`,
                        opacity: state.opacity,
                        transform: `translate(-50%, -50%) rotate(${state.rotate}deg)`,
                      }}
                    />
                  ) : null}
                </div>
              </GlassSurface>
              <GlassSurface className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-800">
                      Выберите водяной знак
                    </label>
                    <select
                      className="mt-3 w-full rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400"
                      value={state?.watermarkId ?? ""}
                      onChange={(event) =>
                        setState((prev: any) => ({
                          ...prev,
                          watermarkId: event.target.value,
                        }))
                      }
                    >
                      {watermarks.map((watermark) => (
                        <option key={watermark.id} value={watermark.id}>
                          {watermark.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-4">
                    {["x", "y", "scale", "opacity", "rotate"].map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-slate-800">
                          {field === "x"
                            ? "Позиция X"
                            : field === "y"
                              ? "Позиция Y"
                              : field === "scale"
                                ? "Масштаб"
                                : field === "opacity"
                                  ? "Прозрачность"
                                  : "Угол"}
                        </label>
                        <input
                          type="range"
                          min={field === "rotate" ? -180 : 0}
                          max={
                            field === "rotate" ? 180 : field === "scale" ? 1 : 1
                          }
                          step={field === "rotate" ? 1 : 0.01}
                          value={state?.[field] ?? 0}
                          onChange={(event) =>
                            setState((prev: any) => ({
                              ...prev,
                              [field]: Number(event.target.value),
                            }))
                          }
                          className="mt-3 w-full"
                        />
                        <div className="mt-2 text-sm text-slate-600">
                          {String(state?.[field])}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <GlassButton onClick={handleSave} disabled={saving}>
                  {saving ? "Сохранение..." : "Сохранить изменения"}
                </GlassButton>
              </GlassSurface>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
