export type VisualIntensity = "low" | "medium" | "high";

export interface ColorTokens {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textInverse: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  chartColors: string[];
}

export interface TypographyTokens {
  titleFont: string;
  bodyFont: string;
  monoFont: string;
  titleSize: number;
  subtitleSize: number;
  bodySize: number;
  captionSize: number;
  titleWeight: string;
  bodyWeight: string;
  lineHeight: number;
}

export interface SpacingTokens {
  slidePaddingX: number;
  slidePaddingY: number;
  elementGap: number;
  sectionGap: number;
}

export interface ShapeTokens {
  cornerRadius: number;
  lineWidth: number;
  lineColor: string;
}

export interface ChartTokens {
  axisColor: string;
  gridColor: string;
  labelColor: string;
  fontFamily: string;
}

export interface ImageTokens {
  borderRadius: number;
  overlayOpacity: number;
  overlayColor: string;
}

export type ThemeStyle =
  | "apple_keynote"
  | "bloomberg_dark"
  | "mckinsey_consulting"
  | "startup_pitch"
  | "education_clean"
  | "government_formal"
  | "tech_cinematic";

export interface ThemeSpec {
  id: string;
  name: string;
  style: ThemeStyle;
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  shapes: ShapeTokens;
  chart: ChartTokens;
  image: ImageTokens;
  density: "low" | "medium" | "high";
  defaultVisualIntensity: VisualIntensity;
}
