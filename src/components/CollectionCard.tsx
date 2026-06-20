import { Link } from "react-router-dom";
import type { Collection } from "../mocks/types";
import { GlassCard } from "./GlassCard";

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link to={`/collections/${collection.id}`} className="group">
      <GlassCard className="h-full p-0 transition duration-200 hover:-translate-y-1 hover:shadow-[0_30px_60px_rgba(47,123,255,0.15)]">
        <div className="relative overflow-hidden rounded-[28px]">
          <img
            loading="lazy"
            src={collection.coverImage}
            alt={collection.title}
            className="h-56 w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-slate-950/80 to-transparent px-5 py-4">
            <h2 className="text-lg font-semibold text-white">
              {collection.title}
            </h2>
            <p className="text-sm text-slate-200">
              {collection.assetCount} файлов
            </p>
          </div>
        </div>
        <div className="space-y-2 p-5">
          <p className="text-sm text-slate-600">{collection.description}</p>
          <span className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Создано {collection.createdAt}
          </span>
        </div>
      </GlassCard>
    </Link>
  );
}
