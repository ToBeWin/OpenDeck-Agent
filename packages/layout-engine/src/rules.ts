import type { LayoutRule, LayoutElement, LayoutRect } from "./types";

/** Title at top, full width */
export const titleRule: LayoutRule = {
  name: "title",
  apply(elements, canvas) {
    return elements.map((el) => {
      if (el.role !== "title" && el.role !== "heading") return el;
      return {
        ...el,
        rect: { x: canvas.x, y: canvas.y, w: canvas.w, h: el.rect.h },
      };
    });
  },
};

/** Body text below title */
export const bodyRule: LayoutRule = {
  name: "body",
  apply(elements, canvas) {
    const title = elements.find(
      (el) => el.role === "title" || el.role === "heading",
    );
    const titleBottom = title ? title.rect.y + title.rect.h : canvas.y;
    return elements.map((el) => {
      if (el.role !== "body") return el;
      return {
        ...el,
        rect: {
          x: canvas.x,
          y: titleBottom + 0.25,
          w: canvas.w,
          h: el.rect.h,
        },
      };
    });
  },
};

/** Split into two columns */
export const twoColumnRule: LayoutRule = {
  name: "twoColumn",
  apply(elements, canvas) {
    const gutter = 0.25;
    const colW = (canvas.w - gutter) / 2;
    const colElements = elements.filter(
      (el) => el.role !== "title" && el.role !== "heading",
    );
    const nonColElements = elements.filter(
      (el) => el.role === "title" || el.role === "heading",
    );

    let yLeft = canvas.y;
    let yRight = canvas.y;

    const result: LayoutElement[] = nonColElements.map((el) => ({ ...el }));

    colElements.forEach((el, i) => {
      const isLeft = i % 2 === 0;
      const x = isLeft ? canvas.x : canvas.x + colW + gutter;
      const y = isLeft ? yLeft : yRight;

      result.push({
        ...el,
        rect: { x, y, w: colW, h: el.rect.h },
      });

      if (isLeft) yLeft += el.rect.h + gutter;
      else yRight += el.rect.h + gutter;
    });

    return result;
  },
};

/** Image placement rules */
export const imageRule: LayoutRule = {
  name: "image",
  apply(elements, canvas) {
    return elements.map((el) => {
      if (el.type !== "image") return el;
      const maxW = canvas.w * 0.6;
      const maxH = canvas.h * 0.5;
      const w = Math.min(el.rect.w, maxW);
      const h = Math.min(el.rect.h, maxH);
      return {
        ...el,
        rect: {
          x: canvas.x + (canvas.w - w) / 2,
          y: el.rect.y,
          w,
          h,
        },
      };
    });
  },
};

/** Chart centering/sizing */
export const chartRule: LayoutRule = {
  name: "chart",
  apply(elements, canvas) {
    return elements.map((el) => {
      if (el.type !== "chart") return el;
      const maxW = canvas.w * 0.8;
      const maxH = canvas.h * 0.6;
      const w = Math.min(el.rect.w, maxW);
      const h = Math.min(el.rect.h, maxH);
      return {
        ...el,
        rect: {
          x: canvas.x + (canvas.w - w) / 2,
          y: canvas.y + (canvas.h - h) / 2,
          w,
          h,
        },
      };
    });
  },
};
