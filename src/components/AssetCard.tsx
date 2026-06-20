import type { Asset } from "../mocks/types";
import { GlassSurface } from "./GlassSurface";

interface AssetCardProps {
  asset: Asset;
}

export function AssetCard({ asset }: AssetCardProps) {
  return (
    <GlassSurface className="flex h-full flex-col overflow-hidden p-0">
      <div className="relative overflow-hidden bg-slate-100">
        <img
          className="h-56 w-full object-cover"
          src={asset.imageUrl}
          alt={asset.title}
          loading="lazy"
          decoding="async"
        />
        {asset.watermarkState ? (
          <div className="absolute left-3 top-3 rounded-full bg-sky-600/80 px-3 py-1 text-xs font-semibold text-white">
            Водяной знак присутствует
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {asset.title}
          </h3>
          <p className="text-sm text-slate-600">{asset.fileName}</p>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>{asset.sizeKB} KB</span>
          <span>
            {asset.width}×{asset.height}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 pt-3">
          <button className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500">
            Скачать
          </button>
          <span className="text-xs text-slate-500">{asset.uploadedAt}</span>
        </div>
      </div>
    </GlassSurface>
  );
}
