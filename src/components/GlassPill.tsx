import LiquidGlass from "liquid-glass-react";
import { type ReactNode } from "react";

interface GlassPillProps {
  children: ReactNode;
  onClick?: () => void;
  background?: string;
}

/**
 * Маленькая "стеклянная" капсула через liquid-glass-react.
 * Библиотека рисует текст белым принудительно — поэтому нужен
 * собственный тёмный/насыщенный фон под стеклом (см. background).
 */
export function GlassPill({
  children,
  onClick,
  background = "rgba(37, 99, 235, 0.85)", // sky-600 с прозрачностью
}: GlassPillProps) {
  return (
    <LiquidGlass
      cornerRadius={999}
      padding="10px 20px"
      displacementScale={50}
      blurAmount={0.08}
      saturation={140}
      aberrationIntensity={1.2}
      elasticity={0.25}
      onClick={onClick}
      style={{ background }}
    >
      {children}
    </LiquidGlass>
  );
}
