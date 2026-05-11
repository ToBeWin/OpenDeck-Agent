import { z } from "zod";

// ─── Union / Enum schemas ─────────────────────────────────────────────

export const deckPurposeSchema = z.enum([
  "business_report",
  "startup_pitch",
  "product_launch",
  "education_courseware",
  "industry_analysis",
  "project_intro",
  "technical_talk",
  "training",
  "sales_deck",
  "government_report",
  "custom",
]);

export const slideTypeSchema = z.enum([
  "cover",
  "agenda",
  "section_divider",
  "insight",
  "problem",
  "solution",
  "comparison",
  "timeline",
  "process",
  "data_chart",
  "case_study",
  "quote",
  "summary",
  "closing",
  "appendix",
]);

export const layoutTypeSchema = z.enum([
  "hero_title",
  "title_content",
  "two_column",
  "three_column",
  "big_number",
  "comparison_matrix",
  "timeline_horizontal",
  "timeline_vertical",
  "process_flow",
  "image_left_text_right",
  "image_right_text_left",
  "full_bleed_image",
  "chart_focus",
  "quote_focus",
  "grid_cards",
  "consulting_summary",
]);

export const visualIntensitySchema = z.enum(["low", "medium", "high"]);

export const visualAssetKindSchema = z.enum([
  "hero_image",
  "supporting_image",
  "icon_set",
  "diagram",
  "chart",
  "table",
  "timeline_graphic",
  "process_graphic",
  "quote_visual",
  "none",
]);

// ─── Value object schemas ─────────────────────────────────────────────

export const boxSchema = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  unit: z.enum(["px", "pt", "in"]),
});

export const textStyleSchema = z.object({
  fontSize: z.number().optional(),
  fontFamily: z.string().optional(),
  fontWeight: z.string().optional(),
  color: z.string().optional(),
  align: z.enum(["left", "center", "right"]).optional(),
});

export const imageStyleSchema = z.object({
  opacity: z.number().optional(),
  borderRadius: z.number().optional(),
});

export const tableStyleSchema = z.object({
  headerBgColor: z.string().optional(),
  borderColor: z.string().optional(),
});

export const chartStyleSchema = z.object({
  colors: z.array(z.string()).optional(),
});

export const semanticInfoSchema = z.object({
  purpose: z.string(),
  importance: z.enum(["high", "medium", "low"]),
  canCompress: z.boolean(),
  canRewrite: z.boolean(),
});

// ─── Slide Element schemas ────────────────────────────────────────────

export const textElementSchema = z.object({
  id: z.string(),
  type: z.literal("text"),
  role: z.enum([
    "title",
    "subtitle",
    "headline",
    "body",
    "caption",
    "label",
    "metric",
    "footnote",
  ]),
  content: z.string(),
  editable: z.literal(true),
  semantic: semanticInfoSchema.optional(),
  position: boxSchema.optional(),
  style: textStyleSchema.optional(),
});

export const imageElementSchema = z.object({
  id: z.string(),
  type: z.literal("image"),
  role: z.enum([
    "hero",
    "background",
    "illustration",
    "avatar",
    "logo",
    "supporting",
  ]),
  source: z.string(),
  sourceType: z.enum(["local", "generated", "web", "embedded"]),
  editable: z.boolean(),
  replaceable: z.boolean().optional(),
  locked: z.boolean().optional(),
  generationPrompt: z.string().optional(),
  assetId: z.string().optional(),
  citationId: z.string().optional(),
  position: boxSchema.optional(),
  style: imageStyleSchema.optional(),
});

export const shapeElementSchema = z.object({
  id: z.string(),
  type: z.literal("shape"),
  shapeType: z.string(),
  position: boxSchema.optional(),
  style: z.record(z.unknown()).optional(),
});

export const tableElementSchema = z.object({
  id: z.string(),
  type: z.literal("table"),
  role: z.enum(["comparison", "data", "summary", "pricing", "roadmap"]),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
  editable: z.literal(true),
  highlight: z
    .object({
      row: z.number().optional(),
      column: z.number().optional(),
      cell: z.tuple([z.number(), z.number()]).optional(),
    })
    .optional(),
  position: boxSchema.optional(),
  style: tableStyleSchema.optional(),
});

export const chartDataSchema = z.object({
  categories: z.array(z.string()).optional(),
  series: z
    .array(z.object({ name: z.string(), values: z.array(z.number()) }))
    .optional(),
  labels: z.array(z.string()).optional(),
  values: z.array(z.number()).optional(),
});

export const chartElementSchema = z.object({
  id: z.string(),
  type: z.literal("chart"),
  chartType: z.enum(["bar", "line", "pie", "area", "scatter", "combo"]),
  role: z.enum(["evidence", "trend", "comparison", "breakdown"]),
  data: chartDataSchema,
  editable: z.boolean(),
  position: boxSchema.optional(),
  style: chartStyleSchema.optional(),
});

export const iconElementSchema = z.object({
  id: z.string(),
  type: z.literal("icon"),
  iconType: z.string(),
  position: boxSchema.optional(),
});

export const groupElementSchema = z.object({
  id: z.string(),
  type: z.literal("group"),
  children: z.array(z.any()),
});

export const slideElementSchema = z.discriminatedUnion("type", [
  textElementSchema,
  imageElementSchema,
  shapeElementSchema,
  tableElementSchema,
  chartElementSchema,
  iconElementSchema,
  groupElementSchema,
]);

// ─── Slide-level schemas ──────────────────────────────────────────────

export const citationSchema = z.object({
  id: z.string(),
  source: z.string(),
  url: z.string().optional(),
  quote: z.string().optional(),
});

export const slideVisualPlanSchema = z.object({
  slideId: z.string(),
  visualAssetKind: visualAssetKindSchema,
  sourcePreference: z.enum([
    "user_upload",
    "web_search",
    "ai_generated",
    "builtin",
    "structured_data",
  ]),
  placement: z.enum([
    "background_full_bleed",
    "left_panel",
    "right_panel",
    "top_banner",
    "inline_card",
    "centerpiece",
    "none",
  ]),
  stylePrompt: z.string().optional(),
  generationPrompt: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]),
  avoid: z.array(z.string()).optional(),
});

export const slideQualitySchema = z.object({
  score: z.number(),
  issues: z.array(z.string()),
});

export const revisionRecordSchema = z.object({
  timestamp: z.string(),
  action: z.string(),
  summary: z.string(),
});

export const slideSchema = z.object({
  id: z.string(),
  index: z.number(),
  type: slideTypeSchema,
  layout: layoutTypeSchema,
  communicationGoal: z.string(),
  mainMessage: z.string(),
  elements: z.array(slideElementSchema),
  speakerNote: z.string().optional(),
  citations: z.array(citationSchema).optional(),
  visualPlan: slideVisualPlanSchema.optional(),
  quality: slideQualitySchema.optional(),
  revisionHistory: z.array(revisionRecordSchema).optional(),
});

// ─── Theme schemas ────────────────────────────────────────────────────

export const colorTokensSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  background: z.string(),
  surface: z.string(),
  textPrimary: z.string(),
  textSecondary: z.string(),
  textInverse: z.string(),
  border: z.string(),
  success: z.string(),
  warning: z.string(),
  error: z.string(),
  chartColors: z.array(z.string()),
});

export const typographyTokensSchema = z.object({
  titleFont: z.string(),
  bodyFont: z.string(),
  monoFont: z.string(),
  titleSize: z.number(),
  subtitleSize: z.number(),
  bodySize: z.number(),
  captionSize: z.number(),
  titleWeight: z.string(),
  bodyWeight: z.string(),
  lineHeight: z.number(),
});

export const spacingTokensSchema = z.object({
  slidePaddingX: z.number(),
  slidePaddingY: z.number(),
  elementGap: z.number(),
  sectionGap: z.number(),
});

export const shapeTokensSchema = z.object({
  cornerRadius: z.number(),
  lineWidth: z.number(),
  lineColor: z.string(),
});

export const chartTokensSchema = z.object({
  axisColor: z.string(),
  gridColor: z.string(),
  labelColor: z.string(),
  fontFamily: z.string(),
});

export const imageTokensSchema = z.object({
  borderRadius: z.number(),
  overlayOpacity: z.number(),
  overlayColor: z.string(),
});

export const themeSpecSchema = z.object({
  id: z.string(),
  name: z.string(),
  style: z.enum([
    "apple_keynote",
    "bloomberg_dark",
    "mckinsey_consulting",
    "startup_pitch",
    "education_clean",
    "government_formal",
    "tech_cinematic",
  ]),
  colors: colorTokensSchema,
  typography: typographyTokensSchema,
  spacing: spacingTokensSchema,
  shapes: shapeTokensSchema,
  chart: chartTokensSchema,
  image: imageTokensSchema,
  density: z.enum(["low", "medium", "high"]),
  defaultVisualIntensity: visualIntensitySchema,
});

// ─── Asset & Source schemas ───────────────────────────────────────────

export const assetRecordSchema = z.object({
  id: z.string(),
  type: z.enum(["image", "icon", "chart", "diagram"]),
  sourceType: z.enum(["user_upload", "web_search", "ai_generated", "builtin"]),
  filePath: z.string(),
  originalUrl: z.string().optional(),
  prompt: z.string().optional(),
  providerId: z.string().optional(),
  citations: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string(),
});

export const sourceSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  url: z.string().optional(),
});

// ─── Deck schema ──────────────────────────────────────────────────────

export const deckMetadataSchema = z.object({
  createdAt: z.string(),
  version: z.string(),
  author: z.string().optional(),
});

export const deckSchema = z.object({
  id: z.string(),
  title: z.string(),
  language: z.enum(["zh", "en", "bilingual"]),
  aspectRatio: z.enum(["16:9", "4:3", "custom"]),
  purpose: deckPurposeSchema,
  audience: z.object({ name: z.string(), level: z.string() }).optional(),
  theme: themeSpecSchema,
  slides: z.array(slideSchema),
  sources: z.array(sourceSchema).optional(),
  assets: z.array(assetRecordSchema).optional(),
  speakerNotes: z.boolean().optional(),
  metadata: deckMetadataSchema,
});
