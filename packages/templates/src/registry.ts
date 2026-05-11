import type { ThemeSpec } from "./types";
import { appleKeynoteTheme } from "./themes/apple-keynote";
import { bloombergDarkTheme } from "./themes/bloomberg-dark";
import { mckinseyConsultingTheme } from "./themes/mckinsey-consulting";

const themes: Record<string, ThemeSpec> = {
  apple_keynote: appleKeynoteTheme,
  bloomberg_dark: bloombergDarkTheme,
  mckinsey_consulting: mckinseyConsultingTheme,
};

export function getTheme(style: string): ThemeSpec | undefined {
  return themes[style];
}

export function listThemes(): ThemeSpec[] {
  return Object.values(themes);
}
