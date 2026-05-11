// ─── Union / Enum types ───────────────────────────────────────────────

export type DeckPurpose =
  | "business_report"
  | "startup_pitch"
  | "product_launch"
  | "education_courseware"
  | "industry_analysis"
  | "project_intro"
  | "technical_talk"
  | "training"
  | "sales_deck"
  | "government_report"
  | "custom";

export type SlideType =
  | "cover"
  | "agenda"
  | "section_divider"
  | "insight"
  | "problem"
  | "solution"
  | "comparison"
  | "timeline"
  | "process"
  | "data_chart"
  | "case_study"
  | "quote"
  | "summary"
  | "closing"
  | "appendix";

export type LayoutType =
  | "hero_title"
  | "title_content"
  | "two_column"
  | "three_column"
  | "big_number"
  | "comparison_matrix"
  | "timeline_horizontal"
  | "timeline_vertical"
  | "process_flow"
  | "image_left_text_right"
  | "image_right_text_left"
  | "full_bleed_image"
  | "chart_focus"
  | "quote_focus"
  | "grid_cards"
  | "consulting_summary";

export type VisualIntensity = "low" | "medium" | "high";

export type VisualAssetKind =
  | "hero_image"
  | "supporting_image"
  | "icon_set"
  | "diagram"
  | "chart"
  | "table"
  | "timeline_graphic"
  | "process_graphic"
  | "quote_visual"
  | "none";

// ─── Value objects ────────────────────────────────────────────────────

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  unit: "px" | "pt" | "in";
}

export interface TextStyle {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  align?: "left" | "center" | "right";
}

export interface ImageStyle {
  opacity?: number;
  borderRadius?: number;
}

export interface TableStyle {
  headerBgColor?: string;
  borderColor?: string;
}

export interface ChartStyle {
  colors?: string[];
}

export interface SemanticInfo {
  purpose: string;
  importance: "high" | "medium" | "low";
  canCompress: boolean;
  canRewrite: boolean;
}

// ─── Slide Elements ───────────────────────────────────────────────────

export interface TextElement {
  id: string;
  type: "text";
  role:
    | "title"
    | "subtitle"
    | "headline"
    | "body"
    | "caption"
    | "label"
    | "metric"
    | "footnote";
  content: string;
  editable: true;
  semantic?: SemanticInfo;
  position?: Box;
  style?: TextStyle;
}

export interface ImageElement {
  id: string;
  type: "image";
  role:
    | "hero"
    | "background"
    | "illustration"
    | "avatar"
    | "logo"
    | "supporting";
  source: string;
  sourceType: "local" | "generated" | "web" | "embedded";
  editable: boolean;
  replaceable?: boolean;
  locked?: boolean;
  generationPrompt?: string;
  assetId?: string;
  citationId?: string;
  position?: Box;
  style?: ImageStyle;
}

export interface ShapeElement {
  id: string;
  type: "shape";
  shapeType: string;
  position?: Box;
  style?: Record<string, unknown>;
}

export interface TableElement {
  id: string;
  type: "table";
  role: "comparison" | "data" | "summary" | "pricing" | "roadmap";
  headers: string[];
  rows: string[][];
  editable: true;
  highlight?: {
    row?: number;
    column?: number;
    cell?: [number, number];
  };
  position?: Box;
  style?: TableStyle;
}

export interface ChartData {
  categories?: string[];
  series?: { name: string; values: number[] }[];
  labels?: string[];
  values?: number[];
}

export interface ChartElement {
  id: string;
  type: "chart";
  chartType: "bar" | "line" | "pie" | "area" | "scatter" | "combo";
  role: "evidence" | "trend" | "comparison" | "breakdown";
  data: ChartData;
  editable: boolean;
  position?: Box;
  style?: ChartStyle;
}

export interface IconElement {
  id: string;
  type: "icon";
  iconType: string;
  position?: Box;
}

export interface GroupElement {
  id: string;
  type: "group";
  children: SlideElement[];
}

export type SlideElement =
  | TextElement
  | ImageElement
  | ShapeElement
  | TableElement
  | ChartElement
  | IconElement
  | GroupElement;

// ─── Slide-level types ────────────────────────────────────────────────

export interface Citation {
  id: string;
  source: string;
  url?: string;
  quote?: string;
}

export interface SlideVisualPlan {
  slideId: string;
  visualAssetKind: VisualAssetKind;
  sourcePreference:
    | "user_upload"
    | "web_search"
    | "ai_generated"
    | "builtin"
    | "structured_data";
  placement:
    | "background_full_bleed"
    | "left_panel"
    | "right_panel"
    | "top_banner"
    | "inline_card"
    | "centerpiece"
    | "none";
  stylePrompt?: string;
  generationPrompt?: string;
  priority: "high" | "medium" | "low";
  avoid?: string[];
}

export interface SlideQuality {
  score: number;
  issues: string[];
}

export interface RevisionRecord {
  timestamp: string;
  action: string;
  summary: string;
}

export interface Slide {
  id: string;
  index: number;
  type: SlideType;
  layout: LayoutType;
  communicationGoal: string;
  mainMessage: string;
  elements: SlideElement[];
  speakerNote?: string;
  citations?: Citation[];
  visualPlan?: SlideVisualPlan;
  quality?: SlideQuality;
  revisionHistory?: RevisionRecord[];
}

// ─── Theme types ──────────────────────────────────────────────────────

export interface ColorTokens {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textInverse: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  chartColors: string[];
}

export interface TypographyTokens {
  titleFont: string;
  bodyFont: string;
  monoFont: string;
  titleSize: number;
  subtitleSize: number;
  bodySize: number;
  captionSize: number;
  titleWeight: string;
  bodyWeight: string;
  lineHeight: number;
}

export interface SpacingTokens {
  slidePaddingX: number;
  slidePaddingY: number;
  elementGap: number;
  sectionGap: number;
}

export interface ShapeTokens {
  cornerRadius: number;
  lineWidth: number;
  lineColor: string;
}

export interface ChartTokens {
  axisColor: string;
  gridColor: string;
  labelColor: string;
  fontFamily: string;
}

export interface ImageTokens {
  borderRadius: number;
  overlayOpacity: number;
  overlayColor: string;
}

export interface ThemeSpec {
  id: string;
  name: string;
  style:
    | "apple_keynote"
    | "bloomberg_dark"
    | "mckinsey_consulting"
    | "startup_pitch"
    | "education_clean"
    | "government_formal"
    | "tech_cinematic";
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  shapes: ShapeTokens;
  chart: ChartTokens;
  image: ImageTokens;
  density: "low" | "medium" | "high";
  defaultVisualIntensity: VisualIntensity;
}

// ─── Asset & Source ───────────────────────────────────────────────────

export interface AssetRecord {
  id: string;
  type: "image" | "icon" | "chart" | "diagram";
  sourceType: "user_upload" | "web_search" | "ai_generated" | "builtin";
  filePath: string;
  originalUrl?: string;
  prompt?: string;
  providerId?: string;
  citations?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Source {
  id: string;
  type: string;
  title: string;
  url?: string;
}

// ─── Deck ─────────────────────────────────────────────────────────────

export interface DeckMetadata {
  createdAt: string;
  version: string;
  author?: string;
}

export interface Deck {
  id: string;
  title: string;
  language: "zh" | "en" | "bilingual";
  aspectRatio: "16:9" | "4:3" | "custom";
  purpose: DeckPurpose;
  audience?: { name: string; level: string };
  theme: ThemeSpec;
  slides: Slide[];
  sources?: Source[];
  assets?: AssetRecord[];
  speakerNotes?: boolean;
  metadata: DeckMetadata;
}
