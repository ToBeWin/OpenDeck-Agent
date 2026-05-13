import PptxGenJS from "pptxgenjs";
import type { ThemeTokens } from "../theme";
import type { SlideData } from "../renderer";

export function renderHeroImage(
  pres: PptxGenJS,
  slide: PptxGenJS.Slide,
  slideData: SlideData,
  theme: ThemeTokens
): boolean {
  const hero = slideData.elements.find(
    (el) => el.type === "image" && (el.role === "hero" || el.role === "background")
  );
  if (!hero?.source) return false;

  try {
    slide.addImage({
      path: hero.source,
      x: 0, y: 0, w: 13.33, h: 7.5,
    });
    return true;
  } catch {
    return false;
  }
}

export function renderSlideImage(
  pres: PptxGenJS,
  slide: PptxGenJS.Slide,
  slideData: SlideData,
  x: number,
  y: number,
  w: number,
  h: number,
  theme: ThemeTokens
): number {
  const imageEl = slideData.elements.find((el) => el.type === "image");
  if (!imageEl?.source) return 0;

  try {
    slide.addImage({ path: imageEl.source, x, y, w, h, rounding: true });
    return 1;
  } catch {
    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w, h,
      fill: { color: theme.colors.surface },
      line: { color: theme.colors.border, width: 1, dashType: "dash" },
      rectRadius: 0.1,
    });
    return 0;
  }
}
