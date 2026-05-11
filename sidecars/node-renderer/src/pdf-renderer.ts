import * as fs from "fs";
import * as path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { DeckData, SlideData, SlideElement } from "./renderer";

interface PdfTheme {
  background: [number, number, number];
  textPrimary: [number, number, number];
  textSecondary: [number, number, number];
  accent: [number, number, number];
  surface: [number, number, number];
}

const THEMES: Record<string, PdfTheme> = {
  bloomberg_dark: {
    background: [0.07, 0.07, 0.07],
    textPrimary: [0.96, 0.96, 0.96],
    textSecondary: [0.62, 0.62, 0.62],
    accent: [1.0, 0.65, 0.15],
    surface: [0.12, 0.12, 0.12],
  },
  dark_elegance: {
    background: [0.1, 0.1, 0.18],
    textPrimary: [0.92, 0.92, 0.92],
    textSecondary: [0.63, 0.63, 0.69],
    accent: [0.91, 0.27, 0.37],
    surface: [0.09, 0.13, 0.24],
  },
  minimal_light: {
    background: [0.98, 0.98, 0.98],
    textPrimary: [0.1, 0.1, 0.1],
    textSecondary: [0.4, 0.4, 0.4],
    accent: [0.0, 0.4, 1.0],
    surface: [1.0, 1.0, 1.0],
  },
  tech_gradient: {
    background: [0.06, 0.05, 0.16],
    textPrimary: [0.91, 0.91, 1.0],
    textSecondary: [0.6, 0.6, 0.72],
    accent: [0.0, 0.82, 1.0],
    surface: [0.1, 0.09, 0.25],
  },
};

function resolvePdfTheme(theme?: Record<string, unknown>): PdfTheme {
  const style = (theme?.style as string) ?? "bloomberg_dark";
  return THEMES[style] ?? THEMES.bloomberg_dark;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  ];
}

function findEl(elements: SlideElement[], type: string, role?: string): SlideElement | undefined {
  return elements.find((el) => el.type === type && (!role || el.role === role));
}

function getAccentColor(theme: PdfTheme): ReturnType<typeof rgb> {
  return rgb(theme.accent[0], theme.accent[1], theme.accent[2]);
}

function getTextColor(theme: PdfTheme): ReturnType<typeof rgb> {
  return rgb(theme.textPrimary[0], theme.textPrimary[1], theme.textPrimary[2]);
}

function getSecondaryColor(theme: PdfTheme): ReturnType<typeof rgb> {
  return rgb(theme.textSecondary[0], theme.textSecondary[1], theme.textSecondary[2]);
}

function getBgColor(theme: PdfTheme): ReturnType<typeof rgb> {
  return rgb(theme.background[0], theme.background[1], theme.background[2]);
}

async function renderSlideToPdf(
  doc: PDFDocument,
  slide: SlideData,
  theme: PdfTheme,
  font: ReturnType<typeof StandardFonts> extends Promise<infer T> ? T : never,
  boldFont: ReturnType<typeof StandardFonts> extends Promise<infer T> ? T : never
): Promise<void> {
  const page = doc.addPage([960, 540]); // 16:9 aspect ratio
  const { width, height } = page.getSize();

  // Background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: getBgColor(theme),
  });

  const title = findEl(slide.elements, "text", "title");
  const subtitle = findEl(slide.elements, "text", "subtitle");
  const bodyEls = slide.elements.filter((el) => el.type === "text" && el.role === "body");
  const metric = findEl(slide.elements, "text", "metric");

  let y = height - 60;

  // Title
  if (title?.content) {
    const titleText = title.content.slice(0, 80);
    page.drawText(titleText, {
      x: 50,
      y,
      size: 24,
      font: boldFont,
      color: getAccentColor(theme),
    });
    y -= 40;
  }

  // Subtitle
  if (subtitle?.content) {
    page.drawText(subtitle.content.slice(0, 100), {
      x: 50,
      y,
      size: 14,
      font,
      color: getSecondaryColor(theme),
    });
    y -= 30;
  }

  // Metric (big number)
  if (metric?.content) {
    page.drawText(metric.content, {
      x: 50,
      y,
      size: 48,
      font: boldFont,
      color: getAccentColor(theme),
    });
    y -= 60;
  }

  // Body elements
  for (const body of bodyEls) {
    if (!body.content) continue;
    const lines = body.content.split("\n").filter(Boolean);
    for (const line of lines) {
      if (y < 50) break;
      const isBullet = line.startsWith("•") || line.startsWith("-") || /^\d+\./.test(line);
      const displayLine = line.slice(0, 90);
      page.drawText(displayLine, {
        x: isBullet ? 70 : 50,
        y,
        size: 12,
        font,
        color: getTextColor(theme),
      });
      y -= 18;
    }
    y -= 8;
  }

  // Slide number
  page.drawText(`${slide.index + 1}`, {
    x: width - 40,
    y: 20,
    size: 10,
    font,
    color: getSecondaryColor(theme),
  });
}

export async function renderPdf(
  deckPath: string,
  outputPath: string
): Promise<{ filePath: string; slideCount: number }> {
  const resolvedDeckPath = path.resolve(deckPath);
  const deckRaw = fs.readFileSync(resolvedDeckPath, "utf-8");
  const deck: DeckData = JSON.parse(deckRaw);

  const theme = resolvePdfTheme(deck.theme as Record<string, unknown> | undefined);

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  for (const slide of deck.slides) {
    await renderSlideToPdf(doc, slide, theme, font, boldFont);
  }

  const pdfBytes = await doc.save();
  const resolvedOutput = path.resolve(outputPath);
  const outputDir = path.dirname(resolvedOutput);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(resolvedOutput, pdfBytes);

  return {
    filePath: resolvedOutput,
    slideCount: deck.slides.length,
  };
}
