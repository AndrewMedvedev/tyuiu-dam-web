export interface GlassConfig {
  displacementScale: number;
  blurAmount: number;
  saturation: number;
  aberrationIntensity: number;
  elasticity: number;
  cornerRadius: number;
  padding: string;
}

export function useGlassConfig() {
  const useFallback = true; // liquid-glass-react ломает позиционирование — отключено

  const config: GlassConfig = {
    displacementScale: 0,
    blurAmount: 0.1,
    saturation: 130,
    aberrationIntensity: 0,
    elasticity: 0.35,
    cornerRadius: 24,
    padding: "16px 24px",
  };

  return { useFallback, config };
}
