import type { Deck, Slide } from "@opendeck/slide-dsl";

export interface QualityIssue {
  severity: "error" | "warning" | "info";
  category: "content" | "visual" | "editability" | "consistency" | "compatibility" | "overflow";
  slideId?: string;
  message: string;
  autoFixable: boolean;
}

export interface SlideQualityScore {
  slideId: string;
  overall: number;
  content: number;
  visual: number;
  editability: number;
  issues: QualityIssue[];
}

export interface DeckQualityScore {
  overall: number;
  content: number;
  logic: number;
  visual: number;
  editability: number;
  consistency: number;
  compatibility: number;
  slides: SlideQualityScore[];
  issues: QualityIssue[];
  summary: string;
}
