import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAssetById,
  getCollectionById,
  getCollectionWatermarks,
  saveWatermarkState,
} from "../mocks/api";
import { useAuth } from "../context/AuthContext";
import { LoadingFallback } from "../components/LoadingFallback";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface FilterValues {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  grayscale: number;
  sepia: number;
  invert: number;
}

const DEFAULT_FILTER: FilterValues = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  invert: 0,
};

function buildFilter(f: FilterValues) {
  return `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) hue-rotate(${f.hue}deg) blur(${f.blur}px) grayscale(${f.grayscale}%) sepia(${f.sepia}%) invert(${f.invert}%)`;
}

// ---------------------------------------------------------------------------
// Slider — uncontrolled, communicates via DOM directly
// ---------------------------------------------------------------------------
function Slider({
  label,
  unit,
  min,
  max,
  step = 1,
  defaultValue,
  onInput,
}: {
  label: string;
  unit?: string;
  min: number;
  max: number;
  step?: number;
  defaultValue: number;
  onInput: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  const update = useCallback(
    (raw: number) => {
      const v = Number(raw);
      // Update track fill directly — no React state, zero lag
      if (trackRef.current) {
        const pct = ((v - min) / (max - min)) * 100;
        trackRef.current.style.width = `${pct}%`;
      }
      // Update display value directly
      if (labelRef.current) {
        labelRef.current.textContent =
          (Number.isInteger(step) ? String(v) : v.toFixed(1)) + (unit ?? "");
      }
      onInput(v);
    },
    [min, max, step, unit, onInput],
  );

  const initialPct = ((defaultValue - min) / (max - min)) * 100;
  const displayVal =
    (Number.isInteger(step) ? String(defaultValue) : defaultValue.toFixed(1)) +
    (unit ?? "");

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">
          {label}
        </span>
        <span
          ref={labelRef}
          className="text-xs font-semibold text-slate-900 tabular-nums"
        >
          {displayVal}
        </span>
      </div>
      <div className="relative h-1 rounded-full bg-slate-200">
        {/* fill track — mutated directly via ref */}
        <div
          ref={trackRef}
          className="absolute inset-y-0 left-0 rounded-full bg-slate-900"
          style={{ width: `${initialPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          defaultValue={defaultValue}
          onInput={(e) => update(Number((e.target as HTMLInputElement).value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ height: "16px", top: "-7px" }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EditorPage
// ---------------------------------------------------------------------------
export function EditorPage() {
  const { id, fileId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [collection, setCollection] = useState<any | null>(null);
  const [asset, setAsset] = useState<any | null>(null);
  const [watermarks, setWatermarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<"image" | "watermark">("image");
  const [isDragging, setIsDragging] = useState(false);

  // Watermark UI state (needs React renders for selection & position display)
  const [wmState, setWmState] = useState<any>(null);
  const [selectedWmId, setSelectedWmId] = useState<string>("");

  // Refs for DOM-direct manipulation
  const imgRef = useRef<HTMLImageElement>(null);
  const wmImgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<FilterValues>({ ...DEFAULT_FILTER });

  useEffect(() => {
    if (!id || !fileId) return;
    setLoading(true);
    Promise.all([
      getCollectionById(id),
      getAssetById(id, fileId),
      getCollectionWatermarks(id),
    ])
      .then(([col, ast, wms]) => {
        setCollection(col);
        setAsset(ast);
        setWatermarks(wms);
        const ws = ast.watermarkState ?? {
          watermarkId: wms[0]?.id ?? "",
          x: 0.5,
          y: 0.5,
          scale: 0.22,
          opacity: 0.75,
          rotate: 0,
        };
        setWmState(ws);
        setSelectedWmId(ws.watermarkId ?? wms[0]?.id ?? "");
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [id, fileId]);

  const role = useMemo(
    () => collection?.members.find((m: any) => m.userId === user?.id)?.role,
    [collection, user],
  );
  const canEdit = role === "creator" || role === "moderator";

  // Apply filter to img DOM node directly — called from Slider onInput
  const applyFilter = useCallback((key: keyof FilterValues, value: number) => {
    filterRef.current = { ...filterRef.current, [key]: value };
    if (imgRef.current) {
      imgRef.current.style.filter = buildFilter(filterRef.current);
    }
  }, []);

  const resetFilters = useCallback(() => {
    filterRef.current = { ...DEFAULT_FILTER };
    if (imgRef.current) {
      imgRef.current.style.filter = buildFilter(DEFAULT_FILTER);
    }
    // Force Slider re-mount to reset defaultValues
    setResetKey((k) => k + 1);
  }, []);
  const [resetKey, setResetKey] = useState(0);

  // Watermark position via mouse drag
  const getRelPos = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (editMode !== "watermark" || !selectedWmId) return;
    setIsDragging(true);
    const pos = getRelPos(e);
    if (pos) setWmState((p: any) => ({ ...p, x: pos.x, y: pos.y }));
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const pos = getRelPos(e);
    if (pos) setWmState((p: any) => ({ ...p, x: pos.x, y: pos.y }));
  };
  const handleMouseUp = () => setIsDragging(false);

  // Watermark param sliders — also DOM-direct for the overlay image
  const applyWmParam = useCallback(
    (key: "scale" | "opacity" | "rotate", raw: number) => {
      const value =
        key === "scale" ? raw / 100 : key === "opacity" ? raw / 100 : raw;
      setWmState((p: any) => {
        const next = { ...p, [key]: value };
        // Immediately apply to DOM
        if (wmImgRef.current) {
          wmImgRef.current.style.width = `${next.scale * 100}%`;
          wmImgRef.current.style.opacity = String(next.opacity);
          wmImgRef.current.style.transform = `translate(-50%, -50%) rotate(${next.rotate}deg)`;
        }
        return next;
      });
    },
    [],
  );

  const handleSave = async () => {
    if (!id || !fileId || !wmState) return;
    setSaving(true);
    setError(null);
    try {
      await saveWatermarkState(user!.id, id, fileId, {
        ...wmState,
        watermarkId: selectedWmId,
        filters: filterRef.current,
      });
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

  const selectedWm = watermarks.find((wm) => wm.id === selectedWmId);

  return (
    <div style={{ margin: "-2rem", minHeight: "70vh" }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between gap-4 px-5 h-12"
        style={{
          background: "rgba(10,22,40,0.7)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(`/collections/${id}`)}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/90 transition-colors shrink-0"
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
            Назад
          </button>
          <div className="w-px h-3 bg-white/10" />
          <span className="text-xs font-semibold text-white/80 truncate">
            {asset.title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-red-400">{error}</span>}
          {canEdit && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-7 px-4 rounded-full text-xs font-semibold text-white disabled:opacity-40 transition-all"
              style={{
                background: "linear-gradient(135deg,#2563eb,#3b82f6)",
                boxShadow: "0 0 12px rgba(59,130,246,0.4)",
              }}
            >
              {saving ? "Сохранение…" : "Сохранить"}
            </button>
          )}
        </div>
      </div>

      {!canEdit ? (
        <div className="flex items-center justify-center py-32 text-center">
          <div>
            <p className="text-base font-semibold text-white/80">
              Доступ ограничен
            </p>
            <p className="mt-1 text-sm text-white/40">
              Редактирование доступно только модераторам и создателям.
            </p>
          </div>
        </div>
      ) : (
        <div
          className="flex flex-col xl:flex-row"
          style={{ minHeight: "calc(70vh - 48px)" }}
        >
          {/* ── Canvas ── */}
          <div className="flex-1 flex flex-col">
            {/* Mode tabs */}
            <div
              className="flex gap-1 px-4 py-2.5"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {(["image", "watermark"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setEditMode(mode)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={
                    editMode === mode
                      ? {
                          background: "linear-gradient(135deg,#2563eb,#3b82f6)",
                          color: "#fff",
                          boxShadow: "0 0 10px rgba(59,130,246,0.35)",
                        }
                      : { color: "rgba(255,255,255,0.45)" }
                  }
                >
                  {mode === "image" ? "Коррекция фото" : "Водяной знак"}
                </button>
              ))}
            </div>

            {/* Canvas area */}
            <div
              className="flex-1 flex items-center justify-center p-6"
              style={{ background: "rgba(0,0,0,0.25)" }}
            >
              <div
                ref={containerRef}
                className="relative w-full rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  maxWidth: 720,
                  cursor:
                    editMode === "watermark" && selectedWmId
                      ? isDragging
                        ? "grabbing"
                        : "crosshair"
                      : "default",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  ref={imgRef}
                  src={asset.imageUrl}
                  alt={asset.title}
                  className="w-full block select-none"
                  draggable={false}
                />
                {editMode === "watermark" && selectedWmId && selectedWm && (
                  <img
                    ref={wmImgRef}
                    src={selectedWm.imageUrl}
                    alt="Водяной знак"
                    className="absolute pointer-events-none select-none"
                    style={{
                      left: `${(wmState?.x ?? 0.5) * 100}%`,
                      top: `${(wmState?.y ?? 0.5) * 100}%`,
                      width: `${(wmState?.scale ?? 0.22) * 100}%`,
                      opacity: wmState?.opacity ?? 0.75,
                      transform: `translate(-50%, -50%) rotate(${wmState?.rotate ?? 0}deg)`,
                    }}
                    draggable={false}
                  />
                )}
                {editMode === "watermark" && selectedWmId && (
                  <div
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white text-xs px-3 py-1 rounded-full pointer-events-none"
                    style={{
                      background: "rgba(0,0,0,0.55)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    Кликните или перетащите для позиционирования
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div
            className="xl:w-72 overflow-y-auto"
            style={{
              borderLeft: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div className="p-5 space-y-6">
              {editMode === "image" ? (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">
                      Коррекция
                    </p>
                    <button
                      onClick={resetFilters}
                      className="text-xs text-white/30 hover:text-white/70 transition-colors"
                    >
                      Сбросить
                    </button>
                  </div>
                  <div className="space-y-5" key={resetKey}>
                    <Slider
                      key="br"
                      label="Яркость"
                      unit="%"
                      min={0}
                      max={200}
                      defaultValue={DEFAULT_FILTER.brightness}
                      onInput={(v) => applyFilter("brightness", v)}
                    />
                    <Slider
                      key="co"
                      label="Контраст"
                      unit="%"
                      min={0}
                      max={200}
                      defaultValue={DEFAULT_FILTER.contrast}
                      onInput={(v) => applyFilter("contrast", v)}
                    />
                    <Slider
                      key="sa"
                      label="Насыщенность"
                      unit="%"
                      min={0}
                      max={200}
                      defaultValue={DEFAULT_FILTER.saturation}
                      onInput={(v) => applyFilter("saturation", v)}
                    />
                    <Slider
                      key="hu"
                      label="Оттенок"
                      unit="°"
                      min={-180}
                      max={180}
                      defaultValue={DEFAULT_FILTER.hue}
                      onInput={(v) => applyFilter("hue", v)}
                    />
                    <div
                      className="h-px"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    />
                    <Slider
                      key="bl"
                      label="Размытие"
                      unit="px"
                      min={0}
                      max={20}
                      step={0.1}
                      defaultValue={DEFAULT_FILTER.blur}
                      onInput={(v) => applyFilter("blur", v)}
                    />
                    <Slider
                      key="gr"
                      label="Ч/Б"
                      unit="%"
                      min={0}
                      max={100}
                      defaultValue={DEFAULT_FILTER.grayscale}
                      onInput={(v) => applyFilter("grayscale", v)}
                    />
                    <Slider
                      key="se"
                      label="Сепия"
                      unit="%"
                      min={0}
                      max={100}
                      defaultValue={DEFAULT_FILTER.sepia}
                      onInput={(v) => applyFilter("sepia", v)}
                    />
                    <Slider
                      key="in"
                      label="Инверсия"
                      unit="%"
                      min={0}
                      max={100}
                      defaultValue={DEFAULT_FILTER.invert}
                      onInput={(v) => applyFilter("invert", v)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">
                    Водяной знак
                  </p>
                  {watermarks.length === 0 ? (
                    <p className="text-xs text-white/30">
                      Нет водяных знаков. Добавьте их в настройках коллекции.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {watermarks.map((wm) => (
                        <button
                          key={wm.id}
                          onClick={() => {
                            setSelectedWmId(wm.id);
                            setWmState((p: any) => ({
                              ...p,
                              watermarkId: wm.id,
                            }));
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                          style={{
                            border:
                              selectedWmId === wm.id
                                ? "1px solid rgba(59,130,246,0.6)"
                                : "1px solid rgba(255,255,255,0.08)",
                            background:
                              selectedWmId === wm.id
                                ? "rgba(59,130,246,0.1)"
                                : "rgba(255,255,255,0.03)",
                          }}
                        >
                          <img
                            src={wm.imageUrl}
                            alt={wm.name}
                            className="h-8 w-14 object-contain shrink-0"
                          />
                          <span className="text-xs font-medium text-white/70 truncate">
                            {wm.name}
                          </span>
                          {selectedWmId === wm.id && (
                            <svg
                              className="ml-auto shrink-0 text-blue-400"
                              width="13"
                              height="13"
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

                  {selectedWmId && wmState && (
                    <div
                      className="space-y-5 pt-2"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">
                        Параметры
                      </p>
                      <Slider
                        label="Масштаб"
                        unit="%"
                        min={5}
                        max={100}
                        defaultValue={Math.round((wmState.scale ?? 0.22) * 100)}
                        onInput={(v) => applyWmParam("scale", v)}
                      />
                      <Slider
                        label="Прозрачность"
                        unit="%"
                        min={0}
                        max={100}
                        defaultValue={Math.round(
                          (wmState.opacity ?? 0.75) * 100,
                        )}
                        onInput={(v) => applyWmParam("opacity", v)}
                      />
                      <Slider
                        label="Поворот"
                        unit="°"
                        min={-180}
                        max={180}
                        defaultValue={wmState.rotate ?? 0}
                        onInput={(v) => applyWmParam("rotate", v)}
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
