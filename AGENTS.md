# AGENTS.md

# OpenDeck Agent — Codex / Coding Agent Instruction File

## 0. Project Identity

OpenDeck Agent is an open-source, local-first, cross-platform desktop AI Presentation Agent.

It is NOT a generic document editor.
It is NOT a cloud SaaS presentation tool.
It is NOT a PowerPoint replacement.

It is a professional desktop agent that helps users turn natural language, documents, research materials, and visual requirements into:

- editable PPTX files
- HTML presentation pages
- PDF exports
- high-quality slide previews
- structured, revisable presentation projects

The long-term goal is to become a benchmark open-source PPT Agent.

The product should feel like:

> A local AI presentation strategist, copywriter, visual planner, slide designer, and PPT production assistant.

The user should be able to express intent naturally, and the system should translate that intent into structured actions, plans, slides, assets, revisions, and exports.

---

## 1. Core Product Principles

### 1.1 Local-first desktop application

The product must be designed as a desktop application first.

Primary platform target:

- macOS
- Windows
- Linux

Primary framework:

- Tauri 2.0
- React
- TypeScript
- Rust
- Node sidecar for rendering
- Optional Python sidecar for advanced future capabilities only

The default behavior should keep user data local.

No cloud backend is required for the core product.

Online APIs may be used only when the user configures them, such as:

- online LLM APIs
- image generation APIs
- web search APIs

---

### 1.2 PPT only

Do not expand the product into unrelated functionality.

Do not build:

- full document editor
- whiteboard
- mind map tool
- video editor
- generic AI chat app
- mobile app
- web SaaS platform
- team collaboration system
- cloud workspace

Focus only on:

- PPT generation
- PPT planning
- PPT editing through natural language
- PPT style transformation
- PPT asset generation
- PPT export
- PPT quality evaluation

---

### 1.3 Editable PPTX is the primary output

Editable PPTX is the core competitive advantage.

In Editable Mode:

- titles must be real editable text boxes
- body text must be real editable text boxes
- images must be independent image objects
- shapes must be real PowerPoint shapes where possible
- tables should be real editable tables where possible
- charts should be real editable charts where possible
- full-slide screenshots must NOT be used as the default editable PPTX strategy

Generated PPTX files should work reasonably well in:

- Microsoft PowerPoint
- WPS
- Keynote import
- LibreOffice Impress
- Google Slides import, where possible

High-fidelity image-based slides may exist only in a separate Cinematic Mode.

---

### 1.4 Slide DSL is the source of truth

The LLM must never directly generate PPTX files.

The system must follow this pipeline:

```text
User intent
→ Requirement JSON
→ Deck Plan
→ Slide DSL
→ Template Engine
→ Layout Engine
→ Renderer
→ PPTX / HTML / PDF
```

All generation, revision, rendering, and export flows should operate on the Slide DSL.

The Slide DSL is the canonical representation of the deck.

---

### 1.5 Natural language commands must become structured actions

User instructions must be converted into structured internal actions.

Example user command:

```text
第 5 页太啰嗦，压缩成 3 个核心点，保持咨询风格。
```

Internal action:

```json
{
  "action": "modify_slide",
  "target": {
    "slide_id": "slide_05"
  },
  "operation": {
    "type": "compress_content",
    "target_bullet_count": 3
  },
  "constraints": {
    "preserve_main_message": true,
    "preserve_visual_style": true,
    "preserve_citations": true
  }
}
```

Do not implement free-form destructive regeneration when a local structured update is sufficient.

---

### 1.6 Visual quality is essential

The project must not generate dry text-only decks.

The system must support:

- text model providers
- image model providers
- retrieval providers
- visual planning
- asset generation
- image selection
- chart generation
- diagram generation
- icon usage
- visual intensity control

The system should decide when to use:

- hero image
- supporting image
- chart
- table
- timeline
- process diagram
- comparison matrix
- icon system
- text-only page
- large quote page
- full visual page

Visual richness must be intentional, not random.

---

### 1.7 Model-provider neutral architecture

The product must support multiple model providers.

Text model providers should include:

- Ollama
- OpenAI-compatible API
- Anthropic
- Gemini
- DeepSeek
- Qwen
- OpenRouter
- LM Studio
- vLLM-compatible endpoints

Image model providers should be designed for:

- OpenAI image generation
- Gemini image generation, if available through configured provider
- Stability / Stable Diffusion APIs
- Replicate
- ComfyUI
- local Flux / SDXL pipelines
- other extensible image services

Do not hardcode a single provider into core logic.

---

## 2. Recommended Technical Stack

### 2.1 Desktop app

Use:

- Tauri 2.0
- React
- TypeScript
- Tailwind CSS
- shadcn/ui or similarly clean component system
- Zustand or Jotai for state
- Zod for schema validation

The app should have:

- Deck Outline
- Slide Preview
- Inspector Panel
- Agent Command Bar
- Model Settings
- Export Panel
- Project Library
- Asset Library

---

### 2.2 Rust core

Rust should handle:

- local file access
- project store
- asset cache
- sidecar lifecycle
- export coordination
- app permissions
- secure API key storage where possible
- OS integration
- opening exported files
- managing local paths
- cross-platform process handling

Rust should NOT contain business-specific slide intelligence unless necessary.

---

### 2.3 TypeScript core packages

Most product intelligence should live in TypeScript packages:

- Slide DSL
- Agent workflows
- prompt builders
- provider adapters
- template system
- layout engine
- visual planner
- quality checker
- revision engine
- HTML preview renderer
- PPTX renderer interface

These packages must be framework-independent where possible.

---

### 2.4 Node renderer sidecar

A Node sidecar should be used for:

- PPTX generation through PptxGenJS
- PDF export through HTML/Playwright if needed
- advanced rendering tasks
- asset processing where JS ecosystem is suitable

The sidecar should be replaceable.

Do not tightly couple all product logic to the sidecar.

The sidecar should expose a stable JSON-RPC style interface.

---

### 2.5 Optional Python sidecar

Python is NOT a required dependency.

Python may be added later as an optional advanced tool sidecar for:

- OCR
- advanced PDF parsing
- complex Excel / CSV analysis
- advanced local RAG
- scientific data processing
- specialized chart analysis
- document intelligence

The core product must work without Python.

---

## 3. High-Level Architecture

```text
OpenDeck Agent
│
├── apps/
│   └── desktop-tauri/
│       ├── React UI
│       ├── Tauri commands
│       └── Rust local core
│
├── packages/
│   ├── slide-dsl/
│   ├── agent-core/
│   ├── model-providers/
│   ├── image-providers/
│   ├── retrieval-providers/
│   ├── visual-planner/
│   ├── asset-manager/
│   ├── layout-engine/
│   ├── templates/
│   ├── render-pptx/
│   ├── render-html/
│   ├── render-pdf/
│   ├── document-parser/
│   ├── quality/
│   └── project-store/
│
├── sidecars/
│   ├── node-renderer/
│   └── python-tools/              # optional future sidecar
│
├── examples/
│   ├── decks/
│   ├── documents/
│   ├── assets/
│   └── outputs/
│
├── docs/
│   ├── PRODUCT_PRINCIPLES.md
│   ├── ARCHITECTURE.md
│   ├── SLIDE_DSL_SPEC.md
│   ├── AGENT_WORKFLOW.md
│   ├── PROVIDER_SYSTEM.md
│   ├── VISUAL_SYSTEM.md
│   ├── TEMPLATE_GUIDE.md
│   ├── RENDERER_RULES.md
│   ├── QUALITY_SCORE_GUIDE.md
│   └── MVP_ROADMAP.md
│
├── AGENTS.md
├── README.md
└── package.json
```

---

## 4. Main User Experience

The desktop app should follow a professional three-panel structure.

```text
┌─────────────────────────────────────────────────────────────┐
│ Top Bar: Project / Model / Theme / Export PPTX PDF HTML     │
├───────────────┬────────────────────────┬────────────────────┤
│ Deck Outline  │ Slide Preview          │ Inspector           │
│               │                        │                    │
│ - Sections    │ - HTML preview         │ - Slide structure   │
│ - Slides      │ - Current slide        │ - Content fields    │
│ - Versions    │ - Quality indicators   │ - Style fields      │
│ - Scores      │                        │ - Citations         │
│               │                        │ - Speaker notes     │
├───────────────┴────────────────────────┴────────────────────┤
│ Agent Command Bar                                            │
│ “把第 4 页改成三栏对比，减少文字，保持咨询风格。”            │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Core Workflow

### 5.1 Generate new deck

```text
User input / uploaded material / optional web research
        ↓
Intent Engine
        ↓
Requirement Resolver
        ↓
Content Analyzer
        ↓
Research Agent
        ↓
Deck Planner
        ↓
Slide Architect
        ↓
Visual Planner
        ↓
Asset Planner / Asset Generator
        ↓
Slide DSL
        ↓
Template Engine
        ↓
Layout Engine
        ↓
HTML Preview
        ↓
Quality Critic
        ↓
User Revision Loop
        ↓
PPTX / PDF / HTML Export
```

---

### 5.2 Modify existing deck

```text
User command
        ↓
Revision Intent Parser
        ↓
RevisionAction JSON
        ↓
Locate deck / slide / element target
        ↓
Patch Slide DSL
        ↓
Re-layout affected slide(s)
        ↓
Re-evaluate quality
        ↓
Save new version
        ↓
Update preview
```

---

### 5.3 Export deck

```text
Slide DSL
        ↓
Template tokens
        ↓
Layout coordinates
        ↓
Renderer
        ├── Editable PPTX
        ├── HTML presentation
        └── PDF
```

---

## 6. Slide DSL Specification

The Slide DSL is the central contract.

Implement in `packages/slide-dsl`.

Use:

- TypeScript
- Zod
- strict validation
- sample JSON decks
- unit tests

---

### 6.1 Deck

```ts
export interface Deck {
  id: string;
  title: string;
  language: "zh" | "en" | "bilingual";
  aspectRatio: "16:9" | "4:3" | "custom";
  purpose: DeckPurpose;
  audience: AudienceProfile;
  theme: ThemeSpec;
  slides: Slide[];
  sources?: Source[];
  assets?: AssetRecord[];
  speakerNotes?: boolean;
  metadata: DeckMetadata;
}
```

---

### 6.2 DeckPurpose

```ts
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
```

---

### 6.3 Slide

```ts
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
```

---

### 6.4 SlideType

```ts
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
```

---

### 6.5 LayoutType

```ts
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
```

---

### 6.6 SlideElement

```ts
export type SlideElement =
  | TextElement
  | ImageElement
  | ShapeElement
  | TableElement
  | ChartElement
  | IconElement
  | GroupElement;
```

---

### 6.7 TextElement

```ts
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
  semantic?: {
    purpose: string;
    importance: "high" | "medium" | "low";
    canCompress: boolean;
    canRewrite: boolean;
  };
  position?: Box;
  style?: TextStyle;
}
```

---

### 6.8 ImageElement

```ts
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
  generationStyle?: string;
  assetId?: string;
  citationId?: string;
  position?: Box;
  style?: ImageStyle;
}
```

---

### 6.9 TableElement

```ts
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
```

---

### 6.10 ChartElement

```ts
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
```

---

### 6.11 Box

```ts
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  unit: "px" | "pt" | "in";
}
```

---

## 7. Provider System

Implement provider systems in:

- `packages/model-providers`
- `packages/image-providers`
- `packages/retrieval-providers`

---

### 7.1 TextModelProvider

```ts
export interface TextModelProvider {
  id: string;
  name: string;
  type: "local" | "cloud";
  complete(req: TextCompletionRequest): Promise<TextCompletionResult>;
  structuredOutput?<T>(req: StructuredRequest<T>): Promise<T>;
  supportsTools?: boolean;
  supportsVision?: boolean;
  supportsStreaming?: boolean;
}
```

Supported text providers:

- Ollama
- OpenAI-compatible
- Anthropic
- Gemini
- DeepSeek
- Qwen
- OpenRouter
- LM Studio
- vLLM-compatible endpoint

Start with:

1. Ollama
2. OpenAI-compatible API

Add others through the same adapter interface.

---

### 7.2 ImageModelProvider

```ts
export interface ImageModelProvider {
  id: string;
  name: string;
  type: "local" | "cloud";
  generateImage(req: ImageGenerationRequest): Promise<ImageGenerationResult>;
  editImage?(req: ImageEditRequest): Promise<ImageGenerationResult>;
  supportsReferenceImages?: boolean;
  supportsInpainting?: boolean;
  supportsStyleReference?: boolean;
}
```

Planned image providers:

- OpenAI-compatible image API
- Stability / SD API
- Replicate
- ComfyUI
- local Flux / SDXL services
- future Gemini image APIs if available

Do not assume one fixed image provider.

---

### 7.3 RetrievalProvider

```ts
export interface RetrievalProvider {
  id: string;
  name: string;
  searchWeb?(req: SearchRequest): Promise<SearchResult[]>;
  parseDocument?(req: ParseDocumentRequest): Promise<ParsedDocument>;
  retrieveLocal?(req: LocalRetrieveRequest): Promise<RetrievedChunk[]>;
}
```

Retrieval must support:

- uploaded documents
- local files
- web search
- citations
- source metadata

---

## 8. Visual System

Implement visual intelligence in:

- `packages/visual-planner`
- `packages/asset-manager`
- `packages/image-providers`

---

### 8.1 Visual intensity

```ts
export type VisualIntensity = "low" | "medium" | "high";
```

Visual intensity should control:

- how many slides receive images
- whether cover pages use hero visuals
- how often charts, diagrams, and icons are preferred
- how dense the slide layout should be
- how cinematic or conservative the output should feel

Use cases:

```text
low:
  executive report, consulting, government report

medium:
  business presentation, product intro, training

high:
  content creator deck, product launch, keynote, marketing deck
```

---

### 8.2 VisualAssetKind

```ts
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
```

The system must not generate images blindly.

It must decide what visual form best supports the communication goal of each slide.

---

### 8.3 SlideVisualPlan

```ts
export interface SlideVisualPlan {
  slideId: string;
  visualAssetKind: VisualAssetKind;
  sourcePreference: "user_upload" | "web_search" | "ai_generated" | "builtin" | "structured_data";
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
```

---

### 8.4 AssetRecord

```ts
export interface AssetRecord {
  id: string;
  type: "image" | "icon" | "chart" | "diagram";
  sourceType: "user_upload" | "web_search" | "ai_generated" | "builtin";
  filePath: string;
  originalUrl?: string;
  prompt?: string;
  providerId?: string;
  citations?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
}
```

---

### 8.5 Asset workflow

```text
Slide Designer
        ↓
Visual Planner
        ↓
Asset Decision
        ├── use uploaded asset
        ├── search web asset
        ├── generate AI image
        ├── create chart
        └── use built-in icon/shape
        ↓
Asset Manager
        ↓
Layout Engine
        ↓
Renderer
```

---

## 9. Template System

Implement in `packages/templates`.

Templates are not just colors.

A template must define:

- color tokens
- typography tokens
- spacing tokens
- shape tokens
- chart style
- image style
- density
- supported layouts
- slide-type preferences
- visual intensity defaults

---

### 9.1 ThemeSpec

```ts
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
```

---

### 9.2 Initial themes

Implement three themes first:

1. Apple Keynote
2. Bloomberg Dark
3. McKinsey Consulting

Later:

4. Startup Pitch
5. Education Clean
6. Government Formal
7. Tech Cinematic

---

### 9.3 Apple Keynote theme

Use for:

- product launch
- startup intro
- AI tools
- keynote-style presentations

Design traits:

- large titles
- generous whitespace
- low density
- large visual hero sections
- minimal color palette
- elegant sans-serif typography
- one big idea per slide

---

### 9.4 Bloomberg Dark theme

Use for:

- industry analysis
- market reports
- financial analysis
- AI trend reports
- data-driven decks

Design traits:

- dark background
- high contrast
- metric cards
- chart-forward layout
- compact but controlled information density
- premium financial technology style

---

### 9.5 McKinsey Consulting theme

Use for:

- executive reports
- strategy presentations
- business cases
- competitor analysis
- internal proposals

Design traits:

- conclusion-first titles
- structured content blocks
- matrix layouts
- comparison tables
- process diagrams
- high information density but strict alignment

---

## 10. Layout Engine

Implement in `packages/layout-engine`.

The Layout Engine is responsible for turning semantic slide structures into positioned elements.

It must handle:

- slide size
- text measurement
- overflow prevention
- font-size adjustment
- layout selection
- image placement
- chart placement
- table sizing
- spacing
- alignment
- theme tokens
- visual hierarchy

---

### 10.1 LayoutDefinition

```ts
export interface LayoutDefinition {
  id: LayoutType;
  supportedSlideTypes: SlideType[];
  maxTextLength: number;
  minFontSize: number;
  regions: LayoutRegion[];
  overflowStrategy: OverflowStrategy;
  visualHierarchy: VisualHierarchyRule[];
}
```

---

### 10.2 OverflowStrategy

```ts
export type OverflowStrategy =
  | "shrink_font"
  | "compress_text"
  | "split_slide"
  | "change_layout"
  | "move_to_speaker_notes"
  | "ask_user";
```

Overflow handling order:

1. wrap text
2. slightly reduce font size
3. compress content
4. change layout
5. split slide
6. move details to speaker notes
7. ask user only when necessary

---

## 11. PPTX Renderer

Implement in:

- `packages/render-pptx`
- `sidecars/node-renderer`

Use PptxGenJS for the first implementation.

---

### 11.1 Renderer rules

In Editable Mode:

- never render the full slide as one screenshot
- text must be editable text objects
- images must be separate image objects
- shapes must be editable PowerPoint shapes where possible
- simple tables must be editable tables
- simple charts should be editable charts where possible
- speaker notes should be included if requested
- citations should be included as footnotes or reference slides if requested

---

### 11.2 Render interface

```ts
export interface RenderOptions {
  mode: "editable" | "cinematic";
  outputPath: string;
  includeSpeakerNotes: boolean;
  includeCitations: boolean;
  compatibility: "powerpoint" | "wps" | "keynote" | "libreoffice";
}

export interface RenderResult {
  filePath: string;
  warnings: RenderWarning[];
  stats: {
    slideCount: number;
    editableTextCount: number;
    imageCount: number;
    chartCount: number;
    tableCount: number;
  };
}
```

---

### 11.3 Initial supported slide layouts

The first renderer should support:

- cover
- agenda
- section divider
- insight
- two column
- three column
- comparison matrix
- timeline
- chart focus
- closing

---

## 12. Agent Core

Implement in `packages/agent-core`.

Agent Core should be modular.

Do not implement one huge prompt that does everything.

---

### 12.1 Agent roles

Implement these logical agents as workflow modules:

1. Intent Agent
2. Requirement Resolver
3. Research Agent
4. Content Analyzer
5. Storyline Agent
6. Slide Architect
7. Visual Planner Agent
8. Copywriter Agent
9. Asset Planner
10. Critic Agent
11. Revision Agent

These may be implemented as functions, classes, or workflows.

They do not need to be separate runtime processes.

---

### 12.2 Intent Agent

Input:

- user message
- current project state
- selected files
- settings

Output:

- structured intent JSON

Supported intent types:

```ts
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
```

---

### 12.3 RevisionAction

```ts
export type RevisionAction =
  | ModifySlideAction
  | ChangeThemeAction
  | RetargetDeckAction
  | AddSlideAction
  | DeleteSlideAction
  | RewriteContentAction
  | CompressContentAction
  | GenerateSpeakerNotesAction
  | GenerateVisualAssetsAction
  | ReplaceImageAction
  | ExportFileAction;
```

All revisions must produce a new version.

Support rollback.

---

## 13. Quality System

Implement in `packages/quality`.

The Quality Critic must evaluate:

- content
- logic
- visual design
- editability
- consistency
- compatibility
- citations
- asset quality
- slide density
- overflow risk

---

### 13.1 DeckQualityScore

```ts
export interface DeckQualityScore {
  overall: number;
  content: number;
  logic: number;
  visual: number;
  editability: number;
  consistency: number;
  compatibility: number;
  citation: number;
  assetQuality: number;
  issues: QualityIssue[];
}
```

---

### 13.2 Quality checks

Content checks:

- clear deck purpose
- clear audience
- strong titles
- no excessive repetition
- no generic filler
- every slide has a main message
- content matches deck purpose

Visual checks:

- no overcrowded slides
- no excessive decoration
- consistent theme
- aligned layout
- appropriate visual asset usage
- image quality sufficient
- chart/table readable

Editability checks:

- no full-slide screenshot in Editable Mode
- editable text count above threshold
- images are independent
- tables are editable where required
- charts are editable where possible

Compatibility checks:

- file can be generated
- slide dimensions correct
- font fallback defined
- no unsafe paths
- exported assets exist

---

### 13.3 Auto-fix behavior

When quality issues are found, attempt auto-fix:

- too much text → compress
- weak title → rewrite as insight title
- missing visual → invoke Visual Planner
- wrong visual density → adjust layout
- crowded slide → change layout or split slide
- missing citations → add reference slide or footnote
- poor theme consistency → reapply theme tokens

Do not silently destroy user content.

Always preserve main messages unless explicitly instructed.

---

## 14. Document and Research System

Implement in `packages/document-parser` and `packages/retrieval-providers`.

Initial support:

- TXT
- Markdown
- DOCX
- PDF, basic text extraction
- HTML / URL extraction, if provider configured

Future support:

- advanced PDF
- OCR
- Excel / CSV
- local knowledge base
- vector search
- private folder indexing

Research must track sources and citations.

---

## 15. Project Store

Implement in `packages/project-store`.

A project should include:

- deck JSON
- source files
- assets
- generated images
- model settings used
- revision history
- export history
- quality scores
- user preferences
- citations

Use SQLite or local JSON files initially.

Prefer stable local project folders.

---

## 16. Security and Privacy

Default mode:

- local files stay local
- no data leaves the machine unless user configures online provider
- API keys are stored securely where possible
- provider requests should be explicit and traceable
- generated assets should be cached locally

The app should make it clear when cloud APIs are used.

---

## 17. Development Phases

### Phase 0 — Technical validation

Goal:

```text
Tauri App
→ Rust command
→ Node sidecar
→ PptxGenJS
→ editable PPTX
```

Tasks:

1. Create Tauri 2.0 + React + TypeScript app.
2. Add one button: "Generate Test PPTX".
3. Rust starts Node renderer sidecar.
4. Sidecar reads sample-deck.json.
5. Sidecar generates an 8-slide editable PPTX.
6. Return result stats to UI.
7. UI shows file path and open button.
8. Validate output in PowerPoint/WPS manually.

Acceptance:

- PPTX opens successfully.
- Text is editable.
- Images are separate objects.
- No full-slide screenshots.
- 16:9 layout works.
- Chinese text does not break.
- Basic visual quality is acceptable.

---

### Phase 1 — Slide DSL and templates

Tasks:

1. Implement `packages/slide-dsl`.
2. Implement Zod schemas.
3. Add sample deck JSON.
4. Implement three themes:
   - Apple Keynote
   - Bloomberg Dark
   - McKinsey Consulting
5. Implement theme tokens.
6. Add validation tests.

Acceptance:

- sample deck validates.
- invalid deck fails validation.
- themes can be applied to renderer.
- no renderer logic is embedded in DSL package.

---

### Phase 2 — PPTX Renderer

Tasks:

1. Implement `packages/render-pptx`.
2. Support initial slide layouts.
3. Support text, image, shape, table, chart basics.
4. Integrate with sidecar.
5. Add render stats.
6. Add warnings.

Acceptance:

- sample deck exports to PPTX.
- all text is editable.
- theme tokens affect output.
- no full-slide screenshot in Editable Mode.

---

### Phase 3 — Desktop UI

Tasks:

1. Deck Outline
2. Slide Preview
3. Inspector
4. Agent Command Bar
5. Model Settings
6. Export Panel
7. Project open/save

Acceptance:

- user can load a sample deck.
- user can preview slides.
- user can export PPTX.
- user can inspect slide structure.

---

### Phase 4 — Model providers

Tasks:

1. Implement provider registry.
2. Implement Ollama provider.
3. Implement OpenAI-compatible provider.
4. Implement structured output request wrapper.
5. Implement JSON repair / validation retry.
6. Add model settings UI.

Acceptance:

- user can configure Ollama.
- user can configure OpenAI-compatible endpoint.
- model output validates against schemas.
- invalid output triggers retry/repair.

---

### Phase 5 — Agent generation

Tasks:

1. Intent Agent
2. Requirement Resolver
3. Deck Planner
4. Slide Architect
5. Copywriter Agent
6. Visual Planner Agent
7. Slide DSL generator

Acceptance:

- user can type a topic.
- system creates a deck plan.
- system creates Slide DSL.
- system previews deck.
- system exports PPTX.

---

### Phase 6 — Revision system

Tasks:

1. Implement RevisionAction schema.
2. Implement revision parser.
3. Implement deck patcher.
4. Implement version history.
5. Implement rollback.
6. Support basic commands:
   - rewrite slide
   - compress slide
   - change theme
   - add slide
   - delete slide
   - generate speaker notes
   - replace image

Acceptance:

- revisions update only affected areas when possible.
- previous version can be restored.
- deck remains valid after revision.
- preview updates after revision.

---

### Phase 7 — Visual asset system

Tasks:

1. Implement Asset Manager.
2. Implement ImageModelProvider interface.
3. Implement one image API provider.
4. Implement Visual Prompt Builder.
5. Generate cover image.
6. Generate supporting images.
7. Cache assets locally.
8. Insert generated image as independent PPTX image object.

Acceptance:

- user can enable image generation.
- cover page can receive AI-generated hero image.
- generated image is cached.
- PPTX export includes image as separate object.
- user can regenerate or replace image.

---

### Phase 8 — Document input and retrieval

Tasks:

1. Markdown parser
2. TXT parser
3. DOCX parser
4. basic PDF text parser
5. source chunking
6. citation manager
7. content analyzer

Acceptance:

- user can upload a document.
- system summarizes and plans deck from document.
- citations are preserved where possible.
- deck output references source material.

---

### Phase 9 — Quality Critic

Tasks:

1. Implement deck quality scoring.
2. Implement slide quality scoring.
3. Detect text overflow risk.
4. Detect excessive text.
5. Detect weak slide titles.
6. Detect missing visuals.
7. Detect editability issues.
8. Add auto-fix suggestions.

Acceptance:

- deck receives quality score.
- issues appear in UI.
- system can auto-fix common issues.
- quality report is saved in project.

---

## 18. Coding Standards

### 18.1 TypeScript

Use:

- strict TypeScript
- Zod schemas
- explicit interfaces
- no `any` unless justified
- meaningful function names
- small modules
- testable pure functions where possible

---

### 18.2 Rust

Use:

- clear Tauri command boundaries
- robust error handling
- typed command inputs/outputs
- no unsafe code unless necessary
- cross-platform paths
- structured logging

---

### 18.3 Sidecar communication

Use JSON-RPC-like messages.

Example request:

```json
{
  "id": "task_001",
  "method": "render.pptx",
  "params": {
    "deckPath": "/path/to/deck.json",
    "outputPath": "/path/to/output.pptx",
    "mode": "editable"
  }
}
```

Example response:

```json
{
  "id": "task_001",
  "result": {
    "filePath": "/path/to/output.pptx",
    "warnings": [],
    "stats": {
      "slideCount": 8,
      "editableTextCount": 52,
      "imageCount": 4,
      "chartCount": 1,
      "tableCount": 1
    }
  }
}
```

---

### 18.4 Error handling

Errors must be structured.

```ts
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  recoverable: boolean;
}
```

Do not swallow errors silently.

---

### 18.5 Tests

Add tests for:

- schema validation
- revision actions
- layout selection
- provider mock
- renderer output creation
- project store
- quality checks

At minimum:

- unit tests for core packages
- integration test for renderer sidecar
- sample export test

---

## 19. Do Not Do

Do not:

- build a cloud backend
- make Python mandatory
- depend on PowerPoint being installed
- render Editable Mode as full-slide screenshots
- let LLM directly create PPTX files
- hardcode one model provider
- hardcode one image provider
- mix UI code with core generation logic
- make all slides use AI images blindly
- regenerate the whole deck for every minor edit
- create a full PowerPoint clone
- overbuild drag-and-drop editing in the first version

---

## 20. First Codex Task

Start with the following task.

```text
Create the initial OpenDeck Agent technical validation project.

Tech stack:
- Tauri 2.0
- React
- TypeScript
- Rust
- Node renderer sidecar
- PptxGenJS

Goal:
1. Create a Tauri desktop app.
2. Add a button named "Generate Test PPTX".
3. On click, call a Rust command.
4. Rust command launches Node renderer sidecar.
5. Node sidecar reads examples/decks/sample-deck.json.
6. Node sidecar generates an editable 8-slide 16:9 PPTX with PptxGenJS.
7. Slides must include:
   - cover
   - agenda
   - insight
   - two column
   - comparison matrix
   - timeline
   - chart focus
   - closing
8. All text must be real editable text objects.
9. Images must be independent image objects.
10. No full-slide screenshots.
11. Sidecar returns file path, warnings, and stats.
12. UI displays result and an "Open File" button.
13. Create placeholder package folders:
   - packages/slide-dsl
   - packages/templates
   - packages/layout-engine
   - packages/render-pptx
   - packages/agent-core
   - packages/model-providers
   - packages/image-providers
   - packages/visual-planner
   - packages/asset-manager
   - packages/quality
14. Add README.md explaining architecture and how to run the project.
15. Add this AGENTS.md at repository root.
```

Acceptance criteria:

```text
pnpm install works.
pnpm dev starts the Tauri app.
Clicking "Generate Test PPTX" creates a PPTX file.
The PPTX opens in PowerPoint or WPS.
Text can be edited in PowerPoint/WPS.
No slide is a full-page screenshot.
The sidecar protocol is documented.
The project structure is ready for future modules.
```

---

## 21. Second Codex Task

After Phase 0 succeeds, implement the Slide DSL package.

```text
Implement packages/slide-dsl.

Requirements:
1. Use TypeScript and Zod.
2. Define Deck, Slide, SlideElement, ThemeSpec, AssetRecord, RevisionAction.
3. Support text, image, table, chart, shape, icon, group elements.
4. Every element must have id, type, role, editable, position, and style fields where applicable.
5. Add sample-deck.json that validates.
6. Add validator function validateDeck(deck).
7. Add tests for valid and invalid decks.
8. Do not import renderer code.
9. Do not import UI code.
```

---

## 22. Third Codex Task

Implement the first renderer package.

```text
Implement packages/render-pptx and integrate it into sidecars/node-renderer.

Requirements:
1. Input validated Deck JSON.
2. Output editable PPTX.
3. Use PptxGenJS.
4. Support the initial 8 layouts.
5. Apply ThemeSpec tokens.
6. Return RenderResult with stats and warnings.
7. No full-slide screenshots in Editable Mode.
8. Add demo export command.
9. Add basic tests.
```

---

## 23. Fourth Codex Task

Implement provider registry.

```text
Implement packages/model-providers.

Requirements:
1. Define TextModelProvider interface.
2. Implement OpenAI-compatible provider.
3. Implement Ollama provider.
4. Add structuredOutput helper using Zod schema validation.
5. Add retry/repair mechanism for invalid JSON.
6. Add mock provider for tests.
7. Add tests.
```

---

## 24. Fifth Codex Task

Implement visual planner and asset system.

```text
Implement packages/visual-planner and packages/asset-manager.

Requirements:
1. Define VisualIntensity.
2. Define VisualAssetKind.
3. Define SlideVisualPlan.
4. Given Deck + Slide + Theme, decide visual asset kind.
5. Define AssetRecord.
6. Cache generated/imported assets locally.
7. Support asset replacement.
8. Add placeholder ImageModelProvider interface.
9. Add tests.
```

---

## 25. Definition of Done for Early Alpha

The project reaches early alpha when:

- Tauri app runs on macOS, Windows, and Linux development environments.
- User can generate a sample deck.
- User can export editable PPTX.
- User can preview slides.
- User can configure Ollama or OpenAI-compatible API.
- User can generate a deck from a text prompt.
- User can revise at least one slide using natural language.
- User can switch among 3 themes.
- User can generate at least one AI image asset through a configured image provider.
- Generated PPTX is editable and visually acceptable.
- Core logic is modular and documented.

---

## 26. Long-Term Vision

The final product should support:

- natural language deck generation
- document-to-PPT
- web-research-to-PPT
- AI-image-enhanced slides
- editable PPTX
- HTML presentations
- PDF export
- local-first project storage
- multi-model provider system
- local Ollama workflow
- online premium model workflow
- visual planner
- asset manager
- quality critic
- multi-round revision
- user preference memory
- template marketplace or community templates
- optional advanced Python tools

The final user experience should feel like:

> Say what you want, provide your material, choose a style, and the agent produces a professional, editable, visually rich presentation that can be revised through conversation.

---

## 27. Final Architectural Rule

Always preserve this hierarchy:

```text
User Intent
→ Structured Requirement
→ Deck Plan
→ Slide DSL
→ Visual Plan
→ Assets
→ Layout
→ Renderer
→ Export
→ Revision Loop
```

Do not bypass this hierarchy for convenience.

This hierarchy is the foundation of the product.
