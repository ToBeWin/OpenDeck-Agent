import PptxGenJS from "pptxgenjs";
import type { SlideData } from "../renderer";
import type { ThemeTokens } from "../theme";
import type { SlideRenderStats } from ".";

export function renderFullBleedImage(
  pres: PptxGenJS,
  slide: SlideData,
  _slideIndex: number,
  theme: ThemeTokens
): SlideRenderStats {
  const pptxSlide = pres.addSlide();
  pptxSlide.background = { fill: theme.colors.background };

  let imageCount = 0;
  let editableTextCount = 0;

  const heroImage = slide.elements.find(
    (el) => el.type === "image" && (el.role === "hero" || el.role === "background")
  );
  if (heroImage?.source && heroImage.source !== "placeholder" && heroImage.source !== "https://placehold.co/1200x675") {
    try {
      pptxSlide.addImage({ path: heroImage.source, x: 0, y: 0, w: 13.33, h: 7.5 });
      imageCount++;
    } catch {
      // Image file not found
    }
  }

  // Semi-transparent overlay using dark color
  pptxSlide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 7.5,
    fill: { type: "solid", color: "000000" },
    line: { width: 0 },
  });

  const title = slide.elements.find(
    (el) => el.type === "text" && (el.role === "title" || el.role === "headline")
  );
  if (title) {
    pptxSlide.addText(title.content || "", {
      x: 1.0, y: 2.0, w: 11.33, h: 1.5,
      fontSize: 36,
      bold: true,
      color: "FFFFFF",
      align: "center",
      fontFace: theme.typography.titleFont,
    });
    editableTextCount++;
  }

  const subtitle = slide.elements.find(
    (el) => el.type === "text" && (el.role === "subtitle" || el.role === "body")
  );
  if (subtitle) {
    pptxSlide.addText(subtitle.content || "", {
      x: 1.5, y: 3.8, w: 10.33, h: 1.2,
      fontSize: theme.typography.bodySize,
      color: "DDDDDD",
      align: "center",
      fontFace: theme.typography.bodyFont,
    });
    editableTextCount++;
  }

  return { editableTextCount, imageCount, chartCount: 0, tableCount: 0 };
}
