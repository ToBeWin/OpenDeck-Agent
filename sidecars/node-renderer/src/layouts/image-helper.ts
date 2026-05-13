import PptxGenJS from "pptxgenjs";
import type { ThemeTokens } from "../theme";
import type { SlideData, SlideElement } from "../renderer";

export interface ElementPosition {
  x: number; y: number; w: number; h: number;
}

export function getElementPos(el: SlideElement, defaultX: number, defaultY: number, defaultW: number, defaultH: number): ElementPosition {
  if (el.position && typeof el.position.x === "number") {
    return {
      x: el.position.x,
      y: el.position.y,
      w: el.position.w ?? defaultW,
      h: el.position.h ?? defaultH,
    };
  }
  return { x: defaultX, y: defaultY, w: defaultW, h: defaultH };
}

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
  defaultX: number,
  defaultY: number,
  defaultW: number,
  defaultH: number,
  theme: ThemeTokens
): number {
  const imageEl = slideData.elements.find((el) => el.type === "image");
  if (!imageEl?.source) return 0;

  const pos = getElementPos(imageEl, defaultX, defaultY, defaultW, defaultH);

  try {
    slide.addImage({ path: imageEl.source, x: pos.x, y: pos.y, w: pos.w, h: pos.h, rounding: true });
    return 1;
  } catch {
    slide.addShape(pres.ShapeType.roundRect, {
      x: pos.x, y: pos.y, w: pos.w, h: pos.h,
      fill: { color: theme.colors.surface },
      line: { color: theme.colors.border, width: 1, dashType: "dash" },
      rectRadius: 0.1,
    });
    return 0;
  }
}
