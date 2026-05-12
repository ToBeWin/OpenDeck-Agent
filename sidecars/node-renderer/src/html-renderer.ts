import * as fs from "fs";
import * as path from "path";
import type { DeckData, SlideData, SlideElement } from "./renderer";

interface HtmlTheme {
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentLight: string;
}

const THEMES: Record<string, HtmlTheme> = {
  bloomberg_dark: {
    background: "#111111",
    surface: "#1f1f1f",
    textPrimary: "#f5f5f5",
    textSecondary: "#999999",
    accent: "#ff9f1c",
    accentLight: "rgba(255,159,28,0.15)",
  },
  apple_keynote: {
    background: "#ffffff",
    surface: "#f5f5f7",
    textPrimary: "#1d1d1f",
    textSecondary: "#86868b",
    accent: "#0071e3",
    accentLight: "rgba(0,113,227,0.1)",
  },
  mckinsey_consulting: {
    background: "#ffffff",
    surface: "#f8f9fa",
    textPrimary: "#1a1a2e",
    textSecondary: "#6c757d",
    accent: "#0f3460",
    accentLight: "rgba(15,52,96,0.1)",
  },
  dark_elegance: {
    background: "#1a1a2e",
    surface: "#16213e",
    textPrimary: "#eaeaea",
    textSecondary: "#a0a0b0",
    accent: "#e94560",
    accentLight: "rgba(233,69,96,0.15)",
  },
  minimal_light: {
    background: "#fafafa",
    surface: "#ffffff",
    textPrimary: "#1a1a1a",
    textSecondary: "#666666",
    accent: "#0066ff",
    accentLight: "rgba(0,102,255,0.1)",
  },
  tech_gradient: {
    background: "#0f0d2b",
    surface: "#1a1740",
    textPrimary: "#e8e8ff",
    textSecondary: "#9999b8",
    accent: "#00d2ff",
    accentLight: "rgba(0,210,255,0.15)",
  },
};

function resolveTheme(theme?: Record<string, unknown>): HtmlTheme {
  const style = (theme?.style as string) ?? "bloomberg_dark";
  return THEMES[style] ?? THEMES.bloomberg_dark;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>");
}

function findEl(elements: SlideElement[], type: string, role?: string): SlideElement | undefined {
  return elements.find((el) => el.type === type && (!role || el.role === role));
}

function renderChart(el: SlideElement, theme: HtmlTheme): string {
  const data = el.data as { labels?: string[]; values?: number[] } | undefined;
  if (!data?.labels?.length || !data?.values?.length) return "";

  const maxVal = Math.max(...data.values, 1);
  const chartType = (el.style as Record<string, unknown>)?.chartType as string ?? "bar";

  if (chartType === "pie") {
    const total = data.values.reduce((a, b) => a + b, 0) || 1;
    let cumulative = 0;
    const slices = data.values.map((v, i) => {
      const start = (cumulative / total) * 360;
      cumulative += v;
      const end = (cumulative / total) * 360;
      const largeArc = end - start > 180 ? 1 : 0;
      const startRad = ((start - 90) * Math.PI) / 180;
      const endRad = ((end - 90) * Math.PI) / 180;
      const x1 = 100 + 80 * Math.cos(startRad);
      const y1 = 100 + 80 * Math.sin(startRad);
      const x2 = 100 + 80 * Math.cos(endRad);
      const y2 = 100 + 80 * Math.sin(endRad);
      return `<path d="M100,100 L${x1},${y1} A80,80 0 ${largeArc},1 ${x2},${y2} Z" fill="${theme.accent}" opacity="${0.5 + i * 0.15}" />`;
    });
    const legend = data.labels.map((l, i) => `<span style="display:inline-block;margin-right:12px;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${theme.accent};opacity:${0.5 + i * 0.15};margin-right:4px;"></span>${escapeHtml(l)}</span>`).join("");
    return `<div style="text-align:center;"><svg viewBox="0 0 200 200" style="max-width:200px;">${slices.join("")}</svg><div style="margin-top:8px;font-size:12px;color:${theme.textSecondary};">${legend}</div></div>`;
  }

  // Bar chart (default)
  const bars = data.labels.map((label, i) => {
    const pct = ((data.values![i] / maxVal) * 100).toFixed(0);
    return `<div style="display:flex;align-items:center;gap:8px;margin:6px 0;">
      <span style="width:80px;font-size:12px;color:${theme.textSecondary};text-align:right;flex-shrink:0;">${escapeHtml(label)}</span>
      <div style="flex:1;background:${theme.surface};border-radius:4px;overflow:hidden;height:20px;">
        <div style="width:${pct}%;height:100%;background:${theme.accent};border-radius:4px;"></div>
      </div>
      <span style="width:40px;font-size:12px;color:${theme.textSecondary};">${data.values![i]}</span>
    </div>`;
  });
  return `<div>${bars.join("")}</div>`;
}

function renderTable(el: SlideElement, theme: HtmlTheme): string {
  const data = el.data as { headers?: string[]; rows?: string[][] } | undefined;
  if (!data?.headers?.length) return "";

  const headerCells = data.headers.map((h) => `<th style="padding:8px 12px;text-align:left;border-bottom:2px solid ${theme.accent};font-size:13px;color:${theme.accent};">${escapeHtml(h)}</th>`).join("");
  const bodyRows = (data.rows ?? []).map((row) => {
    const cells = row.map((c) => `<td style="padding:8px 12px;border-bottom:1px solid ${theme.surface};font-size:13px;color:${theme.textPrimary};">${escapeHtml(c)}</td>`).join("");
    return `<tr>${cells}</tr>`;
  }).join("");

  return `<table style="width:100%;border-collapse:collapse;"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
}

function renderElement(el: SlideElement, theme: HtmlTheme): string {
  switch (el.type) {
    case "text": {
      if (el.role === "title") {
        return `<h1 style="font-size:28px;font-weight:700;color:${theme.accent};margin:0 0 12px 0;">${escapeHtml(el.content ?? "")}</h1>`;
      }
      if (el.role === "subtitle") {
        return `<p style="font-size:16px;color:${theme.textSecondary};margin:0 0 24px 0;">${escapeHtml(el.content ?? "")}</p>`;
      }
      if (el.role === "metric") {
        return `<div style="font-size:56px;font-weight:800;color:${theme.accent};margin:16px 0;">${escapeHtml(el.content ?? "")}</div>`;
      }
      if (el.role === "bullet") {
        const items = (el.content ?? "").split("\n").filter(Boolean);
        const lis = items.map((item) => `<li style="margin:6px 0;line-height:1.5;">${escapeHtml(item)}</li>`).join("");
        return `<ul style="padding-left:20px;color:${theme.textPrimary};margin:0;">${lis}</ul>`;
      }
      return `<p style="font-size:15px;color:${theme.textPrimary};line-height:1.6;margin:0 0 8px 0;">${escapeHtml(el.content ?? "")}</p>`;
    }
    case "chart":
      return renderChart(el, theme);
    case "table":
      return renderTable(el, theme);
    case "image":
      return `<div style="background:${theme.surface};border-radius:8px;padding:40px;text-align:center;color:${theme.textSecondary};font-size:13px;">[Image: ${escapeHtml(el.content ?? "visual")}]</div>`;
    default:
      return el.content ? `<p style="color:${theme.textPrimary};">${escapeHtml(el.content)}</p>` : "";
  }
}

function renderSlide(slide: SlideData, theme: HtmlTheme, index: number): string {
  const title = findEl(slide.elements, "text", "title");
  const subtitle = findEl(slide.elements, "text", "subtitle");

  // Group elements by rough position (top half vs bottom half)
  const mainElements = slide.elements.filter(
    (el) => el.role !== "title" && el.role !== "subtitle" && el.role !== "footnote"
  );
  const footnote = findEl(slide.elements, "text", "footnote");

  let content = "";

  // Header section
  if (title?.content || subtitle?.content) {
    content += `<div style="margin-bottom:24px;">`;
    if (title?.content) {
      content += `<h1 style="font-size:28px;font-weight:700;color:${theme.accent};margin:0 0 8px 0;">${escapeHtml(title.content)}</h1>`;
    }
    if (subtitle?.content) {
      content += `<p style="font-size:16px;color:${theme.textSecondary};margin:0;">${escapeHtml(subtitle.content)}</p>`;
    }
    content += `</div>`;
  }

  // Main content
  if (mainElements.length > 0) {
    const rendered = mainElements.map((el) => renderElement(el, theme)).join("");
    content += `<div>${rendered}</div>`;
  }

  // Footnote
  if (footnote?.content) {
    content += `<div style="margin-top:auto;padding-top:16px;border-top:1px solid ${theme.surface};font-size:12px;color:${theme.textSecondary};">${escapeHtml(footnote.content)}</div>`;
  }

  return `<section class="slide" id="slide-${index + 1}">
  <div class="slide-number">${index + 1}</div>
  <div class="slide-content">${content}</div>
</section>`;
}

export async function renderHtml(
  deckPath: string,
  outputPath: string
): Promise<{ filePath: string; slideCount: number }> {
  const resolvedDeckPath = path.resolve(deckPath);
  const deckRaw = fs.readFileSync(resolvedDeckPath, "utf-8");
  const deck: DeckData = JSON.parse(deckRaw);

  const theme = resolveTheme(deck.theme as Record<string, unknown> | undefined);
  const slides = deck.slides.map((s, i) => renderSlide(s, theme, i)).join("\n\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(deck.title ?? "Presentation")}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: ${theme.background};
    color: ${theme.textPrimary};
  }
  .presentation {
    max-width: 960px;
    margin: 0 auto;
    padding: 20px;
  }
  .slide {
    position: relative;
    background: ${theme.surface};
    border-radius: 12px;
    padding: 40px 48px;
    margin-bottom: 24px;
    min-height: 480px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 12px rgba(0,0,0,0.15);
    page-break-after: always;
  }
  .slide-number {
    position: absolute;
    bottom: 16px;
    right: 20px;
    font-size: 12px;
    color: ${theme.textSecondary};
    opacity: 0.6;
  }
  .slide-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .title-page {
    text-align: center;
    justify-content: center;
    align-items: center;
  }
  .title-page .slide-content {
    justify-content: center;
    align-items: center;
  }
  @media print {
    .slide { box-shadow: none; border: 1px solid #ddd; }
    body { background: white; }
  }
  @media (max-width: 768px) {
    .slide { padding: 24px; min-height: auto; }
    .slide h1 { font-size: 22px !important; }
  }
</style>
</head>
<body>
<div class="presentation">
${slides}
</div>
</body>
</html>`;

  const resolvedOutput = path.resolve(outputPath);
  const outputDir = path.dirname(resolvedOutput);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(resolvedOutput, html, "utf-8");

  return {
    filePath: resolvedOutput,
    slideCount: deck.slides.length,
  };
}
