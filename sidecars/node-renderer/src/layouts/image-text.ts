import PptxGenJS from "pptxgenjs";
import { SlideData } from "../renderer";
import { type ThemeTokens } from "../theme";
import { SlideRenderStats } from "./index";

export function renderImageText(
  pres: PptxGenJS,
  slide: SlideData,
  _slideIndex: number,
  theme: ThemeTokens
): SlideRenderStats {
  const pptxSlide = pres.addSlide();
  let editableTextCount = 0;
  let imageCount = 0;

  pptxSlide.background = { fill: theme.colors.background };

  const titleEl = slide.elements.find(
    (el) => el.type === "text" && (el.role === "title" || el.role === "headline")
  );
  const bodyEl = slide.elements.find(
    (el) => el.type === "text" && el.role === "body"
  );
  const subtitleEl = slide.elements.find(
    (el) => el.type === "text" && el.role === "subtitle"
  );
  const imageEl = slide.elements.find((el) => el.type === "image");

  // Determine layout direction from the slide layout name
  const imageOnRight =
    slide.layout === "image_right_text_left" ||
    slide.layout === "image_left_text_right";

  // For image_left_text_right: image on left, text on right
  // For image_right_text_left: text on left, image on right
  // Default (image_left_text_right): image on left
  const imageOnLeft = slide.layout !== "image_right_text_left";

  // Title spans full width
  if (titleEl) {
    pptxSlide.addText(titleEl.content || "", {
      x: 0.8,
      y: 0.4,
      w: 11.7,
      h: 1.0,
      fontSize: theme.typography.titleSize - 12,
      bold: true,
      color: theme.colors.textPrimary,
      align: "left",
      fontFace: theme.typography.titleFont,
    });
    editableTextCount++;
  }

  // Divider
  pptxSlide.addShape(pres.ShapeType.rect, {
    x: 0.8,
    y: 1.5,
    w: 11.7,
    h: 0.03,
    fill: { color: theme.colors.border },
  });

  const imageX = imageOnLeft ? 0.8 : 7.0;
  const textX = imageOnLeft ? 7.2 : 0.8;
  const panelWidth = 5.8;

  // Image panel
  if (imageEl && imageEl.source) {
    try {
      pptxSlide.addImage({
        x: imageX,
        y: 1.8,
        w: panelWidth,
        h: 4.8,
        path: imageEl.source,
        rounding: true,
      });
      imageCount++;
    } catch {
      // If image fails to load, show placeholder
      renderImagePlaceholder(pres, pptxSlide, theme, imageX, panelWidth);
    }
  } else {
    renderImagePlaceholder(pres, pptxSlide, theme, imageX, panelWidth);
  }

  // Text panel
  if (subtitleEl) {
    pptxSlide.addText(subtitleEl.content || "", {
      x: textX,
      y: 2.0,
      w: panelWidth,
      h: 0.6,
      fontSize: theme.typography.bodySize,
      bold: true,
      color: theme.colors.primary,
      align: "left",
      fontFace: theme.typography.bodyFont,
    });
    editableTextCount++;
  }

  if (bodyEl) {
    pptxSlide.addText(bodyEl.content || "", {
      x: textX,
      y: subtitleEl ? 2.8 : 2.0,
      w: panelWidth,
      h: 3.8,
      fontSize: theme.typography.bodySize - 1,
      color: theme.colors.textPrimary,
      align: "left",
      fontFace: theme.typography.bodyFont,
      valign: "top",
      lineSpacing: 26,
    });
    editableTextCount++;
  }

  if (slide.speakerNote) pptxSlide.addNotes(slide.speakerNote);

  return { editableTextCount, imageCount, chartCount: 0, tableCount: 0 };
}

function renderImagePlaceholder(
  pres: PptxGenJS,
  pptxSlide: PptxGenJS.Slide,
  theme: ThemeTokens,
  x: number,
  w: number
): void {
  pptxSlide.addShape(pres.ShapeType.roundRect, {
    x,
    y: 1.8,
    w,
    h: 4.8,
    fill: { color: theme.colors.surface },
    line: { color: theme.colors.border, width: 1, dashType: "dash" },
    rectRadius: 0.1,
  });

  // Camera/image icon placeholder
  pptxSlide.addShape(pres.ShapeType.rect, {
    x: x + w / 2 - 0.4,
    y: 3.7,
    w: 0.8,
    h: 0.6,
    fill: { color: theme.colors.border },
    rectRadius: 0.05,
  });
  pptxSlide.addShape(pres.ShapeType.ellipse, {
    x: x + w / 2 - 0.15,
    y: 3.85,
    w: 0.3,
    h: 0.3,
    fill: { color: theme.colors.surface },
  });

  pptxSlide.addText("Image", {
    x,
    y: 4.5,
    w,
    h: 0.5,
    fontSize: theme.typography.captionSize,
    color: theme.colors.textSecondary,
    align: "center",
    fontFace: theme.typography.bodyFont,
    valign: "top",
  });
}
