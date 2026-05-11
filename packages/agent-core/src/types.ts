export type UserIntent =
  | "generate_deck"
  | "modify_deck"
  | "modify_slide"
  | "change_style"
  | "change_audience"
  | "compress_deck"
  | "expand_deck"
  | "add_slide"
  | "delete_slide"
  | "rewrite_content"
  | "generate_speaker_notes"
  | "generate_visual_assets"
  | "replace_image"
  | "export_file"
  | "ask_question";

export interface ParsedIntent {
  intent: UserIntent;
  confidence: number;
  parameters: Record<string, unknown>;
  rawMessage: string;
}

export interface DeckPlan {
  title: string;
  purpose: string;
  audience: string;
  language: "zh" | "en" | "bilingual";
  slideCount: number;
  slides: SlidePlanItem[];
  theme: string;
}

export interface SlidePlanItem {
  index: number;
  type: string;
  layout: string;
  communicationGoal: string;
  mainMessage: string;
  keyPoints: string[];
  visualSuggestion?: string;
}
