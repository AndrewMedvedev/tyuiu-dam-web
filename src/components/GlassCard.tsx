import type { ReactNode } from "react";
import { GlassSurface } from "./GlassSurface";

interface GlassCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function GlassCard({
  title,
  subtitle,
  children,
  className = "",
}: GlassCardProps) {
  return (
    <GlassSurface className={`overflow-hidden p-5 ${className}`}>
      {title || subtitle ? (
        <div className="mb-4">
          {title ? (
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          ) : null}
          {subtitle ? (
            <p className="text-sm text-slate-600">{subtitle}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </GlassSurface>
  );
}
