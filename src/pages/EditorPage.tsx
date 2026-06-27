import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAssetById,
  getCollectionById,
  getCollectionWatermarks,
  saveWatermarkState,
} from "../mocks/api";
import { useAuth } from "../context/AuthContext";
import { LoadingFallback } from "../components/LoadingFallback";

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">
          {label}
        </span>
        <span className="text-xs font-semibold text-slate-900 tabular-nums">
          {typeof value === "number" && !Number.isInteger(value)
            ? value.toFixed(1)
            : value}
          {unit}
        </span>
      </div>
      <div className="relative h-1 rounded-full bg-slate-200">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-slate-900 transition-all"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-4 -top-1.5"
        />
      </div>
    </div>
  );
}

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
  const [editMode, setEditMode] = useState<"image" | "watermark">("image");
  const [isDragging, setIsDragging] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

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
            y: 0.5,
            scale: 0.22,
            opacity: 0.75,
            rotate: 0,
          },
        );
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [id, fileId]);

  const role = useMemo(
    () => collection?.members.find((m: any) => m.userId === user?.id)?.role,
    [collection, user],
  );

  const canEdit = role === "creator" || role === "moderator";

  const filterStyle = `brightness(${imageFilter.brightness}%) contrast(${imageFilter.contrast}%) saturate(${imageFilter.saturation}%) hue-rotate(${imageFilter.hue}deg) blur(${imageFilter.blur}px) grayscale(${imageFilter.grayscale}%) sepia(${imageFilter.sepia}%) invert(${imageFilter.invert}%)`;

  const getRelativePos = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = imageContainerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (editMode !== "watermark" || !state?.watermarkId) return;
    setIsDragging(true);
    const pos = getRelativePos(e);
    if (pos) setState((prev: any) => ({ ...prev, x: pos.x, y: pos.y }));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const pos = getRelativePos(e);
    if (pos) setState((prev: any) => ({ ...prev, x: pos.x, y: pos.y }));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleSave = async () => {
    if (!id || !fileId || !state) return;
    setSaving(true);
    setError(null);
    try {
      await saveWatermarkState(user!.id, id, fileId, state);
      navigate(`/collections/${id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingFallback />;
  if (!collection || !asset || !user)
    return (
      <p className="text-slate-500 text-sm">
        Файл не найден или доступ ограничен.
      </p>
    );

  const selectedWatermark = watermarks.find(
    (wm) => wm.id === state?.watermarkId,
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => navigate(`/collections/${id}`)}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors shrink-0"
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Назад
            </button>
            <div className="w-px h-4 bg-slate-200" />
            <span className="text-sm font-semibold text-slate-900 truncate">
              {asset.title}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {error && <span className="text-xs text-rose-500">{error}</span>}
            <button
              onClick={handleSave}
              disabled={saving || !canEdit}
              className="h-8 px-4 rounded-full bg-slate-900 text-white text-xs font-semibold disabled:opacity-40 hover:bg-slate-700 transition-colors"
            >
              {saving ? "Сохранение…" : "Сохранить"}
            </button>
          </div>
        </div>
      </div>

      {!canEdit ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-slate-900">
              Доступ ограничен
            </p>
            <p className="text-sm text-slate-500">
              Редактирование доступно только модераторам и создателям.
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-0 min-h-[calc(100vh-56px)]">
          {/* Canvas area */}
          <div className="flex-1 flex flex-col">
            {/* Mode tabs */}
            <div className="flex gap-1 p-4 border-b border-slate-200 bg-white/50">
              {(["image", "watermark"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setEditMode(mode)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    editMode === mode
                      ? "bg-slate-900 text-white"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {mode === "image" ? "Фото" : "Водяной знак"}
                </button>
              ))}
            </div>

            {/* Image canvas */}
            <div className="flex-1 flex items-center justify-center p-6 bg-slate-100">
              <div
                ref={imageContainerRef}
                className={`relative max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl ${
                  editMode === "watermark" && state?.watermarkId
                    ? isDragging
                      ? "cursor-grabbing"
                      : "cursor-crosshair"
                    : ""
                }`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  src={asset.imageUrl}
                  alt={asset.title}
                  className="w-full block select-none"
                  style={{ filter: filterStyle }}
                  draggable={false}
                />
                {editMode === "watermark" &&
                  state?.watermarkId &&
                  selectedWatermark && (
                    <img
                      src={selectedWatermark.imageUrl}
                      alt="Водяной знак"
                      className="absolute pointer-events-none select-none"
                      style={{
                        left: `${state.x * 100}%`,
                        top: `${state.y * 100}%`,
                        width: `${state.scale * 100}%`,
                        opacity: state.opacity,
                        transform: `translate(-50%, -50%) rotate(${state.rotate}deg)`,
                      }}
                      draggable={false}
                    />
                  )}
                {editMode === "watermark" && state?.watermarkId && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none">
                    Кликните или перетащите для позиционирования
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar controls */}
          <div className="xl:w-72 border-t xl:border-t-0 xl:border-l border-slate-200 bg-white overflow-y-auto">
            <div className="p-5 space-y-6">
              {editMode === "image" ? (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-900 uppercase tracking-widest">
                      Коррекция
                    </p>
                    <button
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
                      className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      Сбросить
                    </button>
                  </div>
                  <div className="space-y-5">
                    <Slider
                      label="Яркость"
                      value={imageFilter.brightness}
                      min={0}
                      max={200}
                      unit="%"
                      onChange={(v) =>
                        setImageFilter((p) => ({ ...p, brightness: v }))
                      }
                    />
                    <Slider
                      label="Контраст"
                      value={imageFilter.contrast}
                      min={0}
                      max={200}
                      unit="%"
                      onChange={(v) =>
                        setImageFilter((p) => ({ ...p, contrast: v }))
                      }
                    />
                    <Slider
                      label="Насыщенность"
                      value={imageFilter.saturation}
                      min={0}
                      max={200}
                      unit="%"
                      onChange={(v) =>
                        setImageFilter((p) => ({ ...p, saturation: v }))
                      }
                    />
                    <Slider
                      label="Оттенок"
                      value={imageFilter.hue}
                      min={-180}
                      max={180}
                      unit="°"
                      onChange={(v) =>
                        setImageFilter((p) => ({ ...p, hue: v }))
                      }
                    />
                    <div className="h-px bg-slate-100" />
                    <Slider
                      label="Размытие"
                      value={imageFilter.blur}
                      min={0}
                      max={20}
                      step={0.1}
                      unit="px"
                      onChange={(v) =>
                        setImageFilter((p) => ({ ...p, blur: v }))
                      }
                    />
                    <Slider
                      label="Чёрно-белое"
                      value={imageFilter.grayscale}
                      min={0}
                      max={100}
                      unit="%"
                      onChange={(v) =>
                        setImageFilter((p) => ({ ...p, grayscale: v }))
                      }
                    />
                    <Slider
                      label="Сепия"
                      value={imageFilter.sepia}
                      min={0}
                      max={100}
                      unit="%"
                      onChange={(v) =>
                        setImageFilter((p) => ({ ...p, sepia: v }))
                      }
                    />
                    <Slider
                      label="Инверсия"
                      value={imageFilter.invert}
                      min={0}
                      max={100}
                      unit="%"
                      onChange={(v) =>
                        setImageFilter((p) => ({ ...p, invert: v }))
                      }
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold text-slate-900 uppercase tracking-widest">
                    Водяной знак
                  </p>

                  {watermarks.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      Нет водяных знаков. Добавьте их в настройках коллекции.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {watermarks.map((wm) => (
                        <button
                          key={wm.id}
                          onClick={() =>
                            setState((prev: any) => ({
                              ...prev,
                              watermarkId: wm.id,
                            }))
                          }
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${
                            state?.watermarkId === wm.id
                              ? "border-slate-900 bg-slate-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <img
                            src={wm.imageUrl}
                            alt={wm.name}
                            className="h-8 w-14 object-contain shrink-0"
                          />
                          <span className="text-xs font-medium text-slate-800 truncate">
                            {wm.name}
                          </span>
                          {state?.watermarkId === wm.id && (
                            <svg
                              className="ml-auto shrink-0"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {state?.watermarkId && (
                    <div className="space-y-5 pt-2 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 uppercase tracking-widest">
                        Параметры
                      </p>
                      <Slider
                        label="Масштаб"
                        value={Math.round(state.scale * 100)}
                        min={5}
                        max={100}
                        unit="%"
                        onChange={(v) =>
                          setState((p: any) => ({ ...p, scale: v / 100 }))
                        }
                      />
                      <Slider
                        label="Прозрачность"
                        value={Math.round(state.opacity * 100)}
                        min={0}
                        max={100}
                        unit="%"
                        onChange={(v) =>
                          setState((p: any) => ({ ...p, opacity: v / 100 }))
                        }
                      />
                      <Slider
                        label="Угол поворота"
                        value={state.rotate}
                        min={-180}
                        max={180}
                        unit="°"
                        onChange={(v) =>
                          setState((p: any) => ({ ...p, rotate: v }))
                        }
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
