import { type ReactNode } from "react";

interface GlassSurfaceProps {
  children: ReactNode;
  className?: string;
}

export function GlassSurface({ children, className = "" }: GlassSurfaceProps) {
  return (
    <div
      className={`block w-full rounded-[28px] border border-white/40 bg-white/40 backdrop-blur-xl shadow-glow ${className}`.trim()}
    >
      {children}
    </div>
  );
}
