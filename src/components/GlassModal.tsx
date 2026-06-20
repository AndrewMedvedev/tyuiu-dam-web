import type { ReactNode } from "react";
import { GlassSurface } from "./GlassSurface";

interface GlassModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
}

export function GlassModal({
  open,
  title,
  onClose,
  children,
}: GlassModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="max-w-3xl w-full">
        <GlassSurface className="relative p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              {title ? (
                <h3 className="text-xl font-semibold text-slate-900">
                  {title}
                </h3>
              ) : null}
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-900"
            >
              Закрыть
            </button>
          </div>
          {children}
        </GlassSurface>
      </div>
    </div>
  );
}
