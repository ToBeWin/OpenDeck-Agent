export interface ThemeColors {
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

export interface ThemeTypography {
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

export interface ThemeSpacing {
  slidePaddingX: number;
  slidePaddingY: number;
  elementGap: number;
  sectionGap: number;
}

export interface ThemeShapes {
  cornerRadius: number;
  lineWidth: number;
  lineColor: string;
}

export interface ThemeChart {
  axisColor: string;
  gridColor: string;
  labelColor: string;
  fontFamily: string;
}

export interface ThemeImage {
  borderRadius: number;
  overlayOpacity: number;
  overlayColor: string;
}

export interface DeckTheme {
  id: string;
  name: string;
  style: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  shapes: ThemeShapes;
  chart?: ThemeChart;
  image?: ThemeImage;
  density?: string;
  defaultVisualIntensity?: string;
}

export interface ChartSeries {
  name: string;
  values: number[];
}

export interface ChartData {
  categories: string[];
  series: ChartSeries[];
}

export interface ElementData {
  id: string;
  type: "text" | "table" | "chart" | "image";
  role: string;
  content?: string;
  editable?: boolean;
  headers?: string[];
  rows?: string[][];
  chartType?: string;
  data?: ChartData;
  style?: Record<string, unknown>;
}

export interface SlideData {
  id: string;
  index: number;
  type: string;
  layout: string;
  communicationGoal?: string;
  mainMessage?: string;
  speakerNote?: string;
  elements: ElementData[];
}

export interface DeckData {
  id: string;
  title: string;
  language: string;
  aspectRatio: string;
  purpose: string;
  theme: DeckTheme;
  slides: SlideData[];
  metadata?: {
    createdAt?: string;
    version?: string;
  };
}
