import type { LayoutRect, LayoutConfig } from "./types";

export function createGrid(config: LayoutConfig): {
  columns: number;
  rows: number;
  cellSize: { w: number; h: number };
  getCell(col: number, row: number): LayoutRect;
} {
  const columns = 12;
  const contentW = config.canvas.w - config.margin * 2;
  const contentH = config.canvas.h - config.margin * 2;
  const cellW = (contentW - config.gutter * (columns - 1)) / columns;
  const rows = Math.floor((contentH + config.gutter) / (cellW + config.gutter));
  const cellH = (contentH - config.gutter * (rows - 1)) / rows;

  return {
    columns,
    rows,
    cellSize: { w: cellW, h: cellH },
    getCell(col: number, row: number): LayoutRect {
      return {
        x: config.margin + col * (cellW + config.gutter),
        y: config.margin + row * (cellH + config.gutter),
        w: cellW,
        h: cellH,
      };
    },
  };
}

export function snapToGrid(rect: LayoutRect, gridSize: number): LayoutRect {
  if (gridSize <= 0) return { ...rect };
  return {
    x: Math.round(rect.x / gridSize) * gridSize,
    y: Math.round(rect.y / gridSize) * gridSize,
    w: Math.round(rect.w / gridSize) * gridSize,
    h: Math.round(rect.h / gridSize) * gridSize,
  };
}
