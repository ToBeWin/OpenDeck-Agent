/**
 * Theme tokens used by layout renderers.
 * Standalone type — does not depend on @opendeck/slide-dsl.
 */
export interface ThemeTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    textInverse: string;
    border: string;
    chartColors: string[];
  };
  typography: {
    titleFont: string;
    bodyFont: string;
    titleSize: number;
    subtitleSize: number;
    bodySize: number;
    captionSize: number;
    titleWeight: string;
    bodyWeight: string;
  };
  shapes: {
    cornerRadius: number;
    lineColor: string;
  };
}

/** Default dark theme used when no theme is provided */
export const defaultTheme: ThemeTokens = {
  colors: {
    primary: "4FC3F7",
    secondary: "78909C",
    accent: "FF7043",
    background: "0F1B2D",
    surface: "1A2744",
    textPrimary: "FFFFFF",
    textSecondary: "B0BEC5",
    textInverse: "0F1B2D",
    border: "2A3F5F",
    chartColors: ["4FC3F7", "FF7043", "66BB6A", "FFA726", "AB47BC", "26C6DA"],
  },
  typography: {
    titleFont: "Microsoft YaHei",
    bodyFont: "Microsoft YaHei",
    titleSize: 44,
    subtitleSize: 22,
    bodySize: 18,
    captionSize: 14,
    titleWeight: "bold",
    bodyWeight: "normal",
  },
  shapes: {
    cornerRadius: 8,
    lineColor: "2A3F5F",
  },
};

/**
 * Merge a partial theme override with defaults.
 */
export function resolveTheme(partial?: Partial<ThemeTokens>): ThemeTokens {
  if (!partial) return defaultTheme;
  return {
    colors: { ...defaultTheme.colors, ...partial.colors },
    typography: { ...defaultTheme.typography, ...partial.typography },
    shapes: { ...defaultTheme.shapes, ...partial.shapes },
  };
}
