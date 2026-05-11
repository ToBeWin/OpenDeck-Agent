import type { ThemeSpec } from "./types";
import { appleKeynoteTheme } from "./themes/apple-keynote";
import { bloombergDarkTheme } from "./themes/bloomberg-dark";
import { mckinseyConsultingTheme } from "./themes/mckinsey-consulting";
import { darkEleganceTheme } from "./themes/dark-elegance";
import { minimalLightTheme } from "./themes/minimal-light";
import { techGradientTheme } from "./themes/tech-gradient";

const themes: Record<string, ThemeSpec> = {
  apple_keynote: appleKeynoteTheme,
  bloomberg_dark: bloombergDarkTheme,
  mckinsey_consulting: mckinseyConsultingTheme,
  dark_elegance: darkEleganceTheme,
  minimal_light: minimalLightTheme,
  tech_gradient: techGradientTheme,
};

export function getTheme(style: string): ThemeSpec | undefined {
  return themes[style];
}

export function listThemes(): ThemeSpec[] {
  return Object.values(themes);
}
