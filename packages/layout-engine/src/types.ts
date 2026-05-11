export interface LayoutRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LayoutElement {
  id: string;
  type: "text" | "image" | "chart" | "table" | "shape" | "icon";
  role?: string;
  rect: LayoutRect;
}

export interface LayoutRule {
  name: string;
  apply(elements: LayoutElement[], canvas: LayoutRect): LayoutElement[];
}

export interface LayoutConfig {
  canvas: LayoutRect;      // default 16:9 slide: {x:0,y:0,w:13.333,h:7.5}
  margin: number;          // default 0.5 inches
  gutter: number;          // default 0.25 inches
  baselineGrid: number;    // default 0.125 inches
}
