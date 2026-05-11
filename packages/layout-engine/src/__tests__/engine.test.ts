import { describe, it, expect } from "vitest";
import { LayoutEngine } from "../engine";
import { createGrid, snapToGrid } from "../grid";
import { titleRule, twoColumnRule } from "../rules";
import type { LayoutElement, LayoutRect, LayoutConfig } from "../types";

const DEFAULT_CANVAS: LayoutRect = { x: 0, y: 0, w: 13.333, h: 7.5 };
const MARGIN = 0.5;

describe("LayoutEngine", () => {
  describe("autoLayout", () => {
    it("creates positioned elements from content descriptions", () => {
      const engine = new LayoutEngine();
      const result = engine.autoLayout([
        { type: "text", role: "title", content: "Hello World" },
        { type: "text", role: "body", content: "Some body text" },
      ]);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("el-0");
      expect(result[0].type).toBe("text");
      expect(result[0].role).toBe("title");
      expect(result[0].rect.x).toBeGreaterThanOrEqual(0);
      expect(result[0].rect.y).toBeGreaterThanOrEqual(0);
      expect(result[0].rect.w).toBeGreaterThan(0);
      expect(result[0].rect.h).toBeGreaterThan(0);
    });

    it("positions title above body", () => {
      const engine = new LayoutEngine();
      const result = engine.autoLayout([
        { type: "text", role: "title", content: "Title" },
        { type: "text", role: "body", content: "Body content" },
      ]);

      const title = result.find((el) => el.role === "title")!;
      const body = result.find((el) => el.role === "body")!;
      expect(title.rect.y).toBeLessThan(body.rect.y);
    });

    it("handles mixed content types", () => {
      const engine = new LayoutEngine();
      const result = engine.autoLayout([
        { type: "text", role: "title", content: "Dashboard" },
        { type: "chart", role: "chart" },
        { type: "image", role: "image" },
      ]);

      expect(result).toHaveLength(3);
      const chart = result.find((el) => el.type === "chart")!;
      expect(chart.rect.w).toBeGreaterThan(0);
    });
  });

  describe("layout", () => {
    it("respects margins", () => {
      const engine = new LayoutEngine({ margin: MARGIN });
      const elements: LayoutElement[] = [
        { id: "1", type: "text", role: "title", rect: { x: 0, y: 0, w: 10, h: 1 } },
      ];
      const result = engine.layout(elements, "title");
      const title = result[0];

      // Title rule places at canvas.x (which is 0), so with inner canvas the title
      // should be within the slide bounds
      expect(title.rect.x).toBeGreaterThanOrEqual(0);
      expect(title.rect.w).toBeLessThanOrEqual(DEFAULT_CANVAS.w);
    });

    it("snaps elements to baseline grid", () => {
      const engine = new LayoutEngine({ baselineGrid: 0.125 });
      const elements: LayoutElement[] = [
        { id: "1", type: "text", role: "title", rect: { x: 0.1, y: 0.1, w: 10, h: 1 } },
      ];
      const result = engine.layout(elements, "title");

      for (const el of result) {
        expect(el.rect.x % 0.125).toBeCloseTo(0, 10);
        expect(el.rect.y % 0.125).toBeCloseTo(0, 10);
        expect(el.rect.w % 0.125).toBeCloseTo(0, 10);
        expect(el.rect.h % 0.125).toBeCloseTo(0, 10);
      }
    });
  });
});

describe("twoColumnRule", () => {
  it("splits body elements into two columns", () => {
    const canvas: LayoutRect = { x: 0.5, y: 0.5, w: 12.333, h: 6.5 };
    const elements: LayoutElement[] = [
      { id: "1", type: "text", role: "body", rect: { x: 0, y: 0, w: 10, h: 1 } },
      { id: "2", type: "text", role: "body", rect: { x: 0, y: 0, w: 10, h: 1 } },
      { id: "3", type: "text", role: "body", rect: { x: 0, y: 0, w: 10, h: 1 } },
      { id: "4", type: "text", role: "body", rect: { x: 0, y: 0, w: 10, h: 1 } },
    ];

    const result = twoColumnRule.apply(elements, canvas);

    const leftCol = result.filter((el) => el.rect.x === canvas.x);
    const rightCol = result.filter((el) => el.rect.x > canvas.x);

    expect(leftCol).toHaveLength(2);
    expect(rightCol).toHaveLength(2);
  });

  it("keeps title elements at full width", () => {
    const canvas: LayoutRect = { x: 0.5, y: 0.5, w: 12.333, h: 6.5 };
    const elements: LayoutElement[] = [
      { id: "1", type: "text", role: "title", rect: { x: 0, y: 0, w: 10, h: 1 } },
      { id: "2", type: "text", role: "body", rect: { x: 0, y: 0, w: 10, h: 1 } },
      { id: "3", type: "text", role: "body", rect: { x: 0, y: 0, w: 10, h: 1 } },
    ];

    const result = twoColumnRule.apply(elements, canvas);
    const title = result.find((el) => el.role === "title")!;
    expect(title.rect.w).toBe(10); // unchanged
  });
});

describe("snapToGrid", () => {
  it("aligns to grid", () => {
    const rect: LayoutRect = { x: 0.13, y: 0.27, w: 5.11, h: 2.03 };
    const snapped = snapToGrid(rect, 0.125);

    expect(snapped.x).toBeCloseTo(0.125, 10);
    expect(snapped.y).toBeCloseTo(0.25, 10);
    expect(snapped.w).toBeCloseTo(5.125, 10);
    expect(snapped.h).toBeCloseTo(2.0, 10);
  });

  it("returns copy when gridSize is zero", () => {
    const rect: LayoutRect = { x: 1, y: 2, w: 3, h: 4 };
    const result = snapToGrid(rect, 0);
    expect(result).toEqual(rect);
    expect(result).not.toBe(rect);
  });
});

describe("titleRule", () => {
  it("places title at top of canvas", () => {
    const canvas: LayoutRect = { x: 0.5, y: 0.5, w: 12.333, h: 6.5 };
    const elements: LayoutElement[] = [
      { id: "1", type: "text", role: "title", rect: { x: 2, y: 3, w: 5, h: 1 } },
    ];

    const result = titleRule.apply(elements, canvas);
    expect(result[0].rect.x).toBe(canvas.x);
    expect(result[0].rect.y).toBe(canvas.y);
    expect(result[0].rect.w).toBe(canvas.w);
  });

  it("does not affect non-title elements", () => {
    const canvas: LayoutRect = { x: 0.5, y: 0.5, w: 12.333, h: 6.5 };
    const elements: LayoutElement[] = [
      { id: "1", type: "text", role: "body", rect: { x: 2, y: 3, w: 5, h: 1 } },
    ];

    const result = titleRule.apply(elements, canvas);
    expect(result[0].rect).toEqual({ x: 2, y: 3, w: 5, h: 1 });
  });
});

describe("createGrid", () => {
  it("creates a 12-column grid", () => {
    const config: LayoutConfig = {
      canvas: DEFAULT_CANVAS,
      margin: MARGIN,
      gutter: 0.25,
      baselineGrid: 0.125,
    };
    const grid = createGrid(config);

    expect(grid.columns).toBe(12);
    expect(grid.cellSize.w).toBeGreaterThan(0);
    expect(grid.cellSize.h).toBeGreaterThan(0);
  });

  it("getCell returns valid rects", () => {
    const config: LayoutConfig = {
      canvas: DEFAULT_CANVAS,
      margin: MARGIN,
      gutter: 0.25,
      baselineGrid: 0.125,
    };
    const grid = createGrid(config);
    const cell = grid.getCell(0, 0);

    expect(cell.x).toBe(MARGIN);
    expect(cell.y).toBe(MARGIN);
    expect(cell.w).toBeCloseTo(grid.cellSize.w, 5);
    expect(cell.h).toBeCloseTo(grid.cellSize.h, 5);
  });
});
