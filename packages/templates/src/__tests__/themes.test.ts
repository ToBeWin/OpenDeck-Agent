import { describe, it, expect } from "vitest";
import { getTheme, listThemes } from "../registry";
import { appleKeynoteTheme } from "../themes/apple-keynote";
import { bloombergDarkTheme } from "../themes/bloomberg-dark";
import { mckinseyConsultingTheme } from "../themes/mckinsey-consulting";
import type { ThemeSpec } from "../types";

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

function assertAllFieldsPresent(theme: ThemeSpec): void {
  expect(theme.id).toBeDefined();
  expect(theme.name).toBeDefined();
  expect(theme.style).toBeDefined();

  // Colors
  expect(theme.colors.primary).toBeDefined();
  expect(theme.colors.secondary).toBeDefined();
  expect(theme.colors.accent).toBeDefined();
  expect(theme.colors.background).toBeDefined();
  expect(theme.colors.surface).toBeDefined();
  expect(theme.colors.textPrimary).toBeDefined();
  expect(theme.colors.textSecondary).toBeDefined();
  expect(theme.colors.textInverse).toBeDefined();
  expect(theme.colors.border).toBeDefined();
  expect(theme.colors.success).toBeDefined();
  expect(theme.colors.warning).toBeDefined();
  expect(theme.colors.error).toBeDefined();
  expect(theme.colors.chartColors).toBeDefined();

  // Typography
  expect(theme.typography.titleFont).toBeDefined();
  expect(theme.typography.bodyFont).toBeDefined();
  expect(theme.typography.monoFont).toBeDefined();
  expect(theme.typography.titleSize).toBeDefined();
  expect(theme.typography.subtitleSize).toBeDefined();
  expect(theme.typography.bodySize).toBeDefined();
  expect(theme.typography.captionSize).toBeDefined();
  expect(theme.typography.titleWeight).toBeDefined();
  expect(theme.typography.bodyWeight).toBeDefined();
  expect(theme.typography.lineHeight).toBeDefined();

  // Spacing
  expect(theme.spacing.slidePaddingX).toBeDefined();
  expect(theme.spacing.slidePaddingY).toBeDefined();
  expect(theme.spacing.elementGap).toBeDefined();
  expect(theme.spacing.sectionGap).toBeDefined();

  // Shapes
  expect(theme.shapes.cornerRadius).toBeDefined();
  expect(theme.shapes.lineWidth).toBeDefined();
  expect(theme.shapes.lineColor).toBeDefined();

  // Chart
  expect(theme.chart.axisColor).toBeDefined();
  expect(theme.chart.gridColor).toBeDefined();
  expect(theme.chart.labelColor).toBeDefined();
  expect(theme.chart.fontFamily).toBeDefined();

  // Image
  expect(theme.image.borderRadius).toBeDefined();
  expect(theme.image.overlayOpacity).toBeDefined();
  expect(theme.image.overlayColor).toBeDefined();

  // Meta
  expect(theme.density).toBeDefined();
  expect(theme.defaultVisualIntensity).toBeDefined();
}

function assertValidHexColors(theme: ThemeSpec): void {
  const colorFields = [
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.accent,
    theme.colors.background,
    theme.colors.surface,
    theme.colors.textPrimary,
    theme.colors.textSecondary,
    theme.colors.textInverse,
    theme.colors.border,
    theme.colors.success,
    theme.colors.warning,
    theme.colors.error,
  ];

  for (const color of colorFields) {
    expect(color, `Expected hex color but got: ${color}`).toMatch(HEX_COLOR_RE);
  }

  for (const color of theme.colors.chartColors) {
    expect(color, `Expected hex chart color but got: ${color}`).toMatch(HEX_COLOR_RE);
  }

  // Shape/chart line colors
  expect(theme.shapes.lineColor).toMatch(HEX_COLOR_RE);
  expect(theme.chart.axisColor).toMatch(HEX_COLOR_RE);
  expect(theme.chart.gridColor).toMatch(HEX_COLOR_RE);
  expect(theme.chart.labelColor).toMatch(HEX_COLOR_RE);
  expect(theme.image.overlayColor).toMatch(HEX_COLOR_RE);
}

function assertPositiveNumbers(theme: ThemeSpec): void {
  expect(theme.typography.titleSize).toBeGreaterThan(0);
  expect(theme.typography.subtitleSize).toBeGreaterThan(0);
  expect(theme.typography.bodySize).toBeGreaterThan(0);
  expect(theme.typography.captionSize).toBeGreaterThan(0);
  expect(theme.typography.lineHeight).toBeGreaterThan(0);

  expect(theme.spacing.slidePaddingX).toBeGreaterThan(0);
  expect(theme.spacing.slidePaddingY).toBeGreaterThan(0);
  expect(theme.spacing.elementGap).toBeGreaterThan(0);
  expect(theme.spacing.sectionGap).toBeGreaterThan(0);

  expect(theme.shapes.cornerRadius).toBeGreaterThanOrEqual(0);
  expect(theme.shapes.lineWidth).toBeGreaterThan(0);
  expect(theme.image.borderRadius).toBeGreaterThanOrEqual(0);
}

describe("Theme definitions", () => {
  const allThemes = [appleKeynoteTheme, bloombergDarkTheme, mckinseyConsultingTheme];

  it.each(allThemes)("$name has all required ThemeSpec fields", (theme) => {
    assertAllFieldsPresent(theme);
  });

  it.each(allThemes)("$name has valid hex color strings", (theme) => {
    assertValidHexColors(theme);
  });

  it.each(allThemes)("$name has positive numeric values for sizes/spacing", (theme) => {
    assertPositiveNumbers(theme);
  });
});

describe("Theme registry", () => {
  it("getTheme('apple_keynote') returns the correct theme", () => {
    const theme = getTheme("apple_keynote");
    expect(theme).toBeDefined();
    expect(theme!.id).toBe("theme_apple_keynote");
    expect(theme!.name).toBe("Apple Keynote");
  });

  it("getTheme('bloomberg_dark') returns the correct theme", () => {
    const theme = getTheme("bloomberg_dark");
    expect(theme).toBeDefined();
    expect(theme!.id).toBe("theme_bloomberg_dark");
    expect(theme!.name).toBe("Bloomberg Dark");
  });

  it("getTheme('mckinsey_consulting') returns the correct theme", () => {
    const theme = getTheme("mckinsey_consulting");
    expect(theme).toBeDefined();
    expect(theme!.id).toBe("theme_mckinsey_consulting");
    expect(theme!.name).toBe("McKinsey Consulting");
  });

  it("getTheme('unknown') returns undefined", () => {
    expect(getTheme("unknown")).toBeUndefined();
  });

  it("listThemes() returns exactly 3 themes", () => {
    const themes = listThemes();
    expect(themes).toHaveLength(3);
  });
});
