# Phase 1: Slide DSL + Templates Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Slide DSL schema package (Zod-based) and three theme templates — the data foundation for all downstream rendering and agent logic.

**Architecture:** `packages/slide-dsl` defines TypeScript interfaces + Zod validation schemas for Deck, Slide, SlideElement, ThemeSpec, and related types. `packages/templates` defines three concrete theme specifications (Apple Keynote, Bloomberg Dark, McKinsey Consulting) as token objects. Both packages are framework-independent, importable by renderer, agent, and UI packages.

**Tech Stack:** TypeScript, Zod, Vitest

---

## File Structure

```
packages/slide-dsl/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts                    # Re-exports everything
│   ├── types.ts                    # TypeScript interfaces
│   ├── schemas.ts                  # Zod schemas
│   ├── validator.ts                # validateDeck() helper
│   └── __tests__/
│       ├── schemas.test.ts         # Schema validation tests
│       └── validator.test.ts       # Validator function tests

packages/templates/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts                    # Re-exports
│   ├── types.ts                    # ThemeSpec, ColorTokens, TypographyTokens etc.
│   ├── registry.ts                 # Theme registry (getTheme, listThemes)
│   ├── themes/
│   │   ├── apple-keynote.ts
│   │   ├── bloomberg-dark.ts
│   │   └── mckinsey-consulting.ts
│   └── __tests__/
│       └── themes.test.ts          # Theme validation tests
```

---

## Chunk 1: Slide DSL Package

### Task 1: Set up slide-dsl package

**Files:**
- Modify: `packages/slide-dsl/package.json`
- Create: `packages/slide-dsl/tsconfig.json`
- Create: `packages/slide-dsl/vitest.config.ts`

- [ ] **Step 1: Update package.json**

```json
{
  "name": "@opendeck/slide-dsl",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Create vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
```

---

### Task 2: Define TypeScript interfaces (types.ts)

**Files:**
- Create: `packages/slide-dsl/src/types.ts`

- [ ] **Step 1: Write all type definitions**

Define these interfaces/types matching AGENTS.md Section 6:

- `DeckPurpose` — union of 11 string literals
- `SlideType` — union of 15 string literals (cover, agenda, section_divider, insight, problem, solution, comparison, timeline, process, data_chart, case_study, quote, summary, closing, appendix)
- `LayoutType` — union of 16 string literals
- `VisualIntensity` — "low" | "medium" | "high"
- `VisualAssetKind` — 10 string literals
- `Box` — { x, y, w, h, unit }
- `TextStyle` — { fontSize?, fontFamily?, fontWeight?, color?, align? }
- `ImageStyle` — { opacity?, borderRadius? }
- `TableStyle` — { headerBgColor?, borderColor? }
- `ChartStyle` — { colors? }
- `TextElement` — { id, type: "text", role, content, editable: true, semantic?, position?, style? }
- `ImageElement` — { id, type: "image", role, source, sourceType, editable, ... }
- `ShapeElement` — { id, type: "shape", shapeType, position?, style? }
- `TableElement` — { id, type: "table", role, headers, rows, editable: true, highlight?, position?, style? }
- `ChartElement` — { id, type: "chart", chartType, role, data, editable, position?, style? }
- `IconElement` — { id, type: "icon", iconType, position? }
- `GroupElement` — { id, type: "group", children: SlideElement[] }
- `SlideElement` — union of all element types
- `Citation` — { id, source, url?, quote? }
- `SlideVisualPlan` — from AGENTS.md Section 8.3
- `SlideQuality` — { score, issues }
- `RevisionRecord` — { timestamp, action, summary }
- `Slide` — { id, index, type, layout, communicationGoal, mainMessage, elements, speakerNote?, citations?, visualPlan?, quality?, revisionHistory? }
- `ThemeSpec` — from AGENTS.md Section 9.1
- `ColorTokens`, `TypographyTokens`, `SpacingTokens`, `ShapeTokens`, `ChartTokens`, `ImageTokens`
- `AssetRecord` — from AGENTS.md Section 8.4
- `Source` — { id, type, title, url?, chunks? }
- `DeckMetadata` — { createdAt, version, author? }
- `Deck` — from AGENTS.md Section 6.1

Export all types.

---

### Task 3: Write Zod schemas (schemas.ts)

**Files:**
- Create: `packages/slide-dsl/src/schemas.ts`

- [ ] **Step 1: Write Zod schemas mirroring all types**

Create Zod schemas for every interface in types.ts. Use `z.infer<typeof Schema>` to derive types where possible, but also export standalone interfaces for documentation clarity.

Key schemas:
- `boxSchema`
- `textStyleSchema`, `imageStyleSchema`, `tableStyleSchema`, `chartStyleSchema`
- `textElementSchema`, `imageElementSchema`, `shapeElementSchema`, `tableElementSchema`, `chartElementSchema`, `iconElementSchema`, `groupElementSchema`
- `slideElementSchema` (discriminated union on `type`)
- `citationSchema`
- `slideVisualPlanSchema`
- `slideQualitySchema`
- `revisionRecordSchema`
- `slideSchema`
- `colorTokensSchema`, `typographyTokensSchema`, `spacingTokensSchema`, `shapeTokensSchema`, `chartTokensSchema`, `imageTokensSchema`
- `themeSpecSchema`
- `assetRecordSchema`
- `sourceSchema`
- `deckMetadataSchema`
- `deckSchema`

Use `z.enum()` for union types. Use `z.discriminatedUnion()` for element types.

---

### Task 4: Write validator (validator.ts)

**Files:**
- Create: `packages/slide-dsl/src/validator.ts`

- [ ] **Step 1: Implement validateDeck function**

```typescript
import { deckSchema } from "./schemas";
import type { Deck } from "./types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  deck?: Deck;
}

export function validateDeck(data: unknown): ValidationResult {
  const result = deckSchema.safeParse(data);
  if (result.success) {
    return { valid: true, errors: [], deck: result.data };
  }
  return {
    valid: false,
    errors: result.error.issues.map(
      (i) => `${i.path.join(".")}: ${i.message}`
    ),
  };
}
```

---

### Task 5: Write index.ts (re-exports)

**Files:**
- Modify: `packages/slide-dsl/src/index.ts`

- [ ] **Step 1: Re-export everything**

```typescript
export * from "./types";
export * from "./schemas";
export * from "./validator";
```

---

### Task 6: Write schema tests

**Files:**
- Create: `packages/slide-dsl/src/__tests__/schemas.test.ts`

- [ ] **Step 1: Test valid deck passes**

Test that a minimal valid deck object passes `deckSchema.parse()`.

- [ ] **Step 2: Test valid slide with text elements**

Test a slide with 2 text elements (title + body) validates.

- [ ] **Step 3: Test valid slide with table element**

Test a slide with a table element validates.

- [ ] **Step 4: Test valid slide with chart element**

Test a slide with a chart element validates.

- [ ] **Step 5: Test invalid deck fails**

Test that missing required fields produce ZodError.

- [ ] **Step 6: Test invalid element type fails**

Test that an element with unknown `type` is rejected.

- [ ] **Step 7: Test discriminator works**

Test that `slideElementSchema` correctly discriminates on `type` field.

---

### Task 7: Write validator tests

**Files:**
- Create: `packages/slide-dsl/src/__tests__/validator.test.ts`

- [ ] **Step 1: Test validateDeck with valid input**

Returns `{ valid: true, errors: [], deck }`.

- [ ] **Step 2: Test validateDeck with invalid input**

Returns `{ valid: false, errors: [...] }` with descriptive error messages.

- [ ] **Step 3: Test validateDeck with sample-deck.json**

Read `examples/decks/sample-deck.json` and validate against schema. Should pass (or list specific issues to fix in the sample).

---

### Task 8: Install and run tests

- [ ] **Step 1: Install dependencies**

```bash
cd /Users/bingo/workspace/opc/OpenDeck-Agent && pnpm install
```

- [ ] **Step 2: Run tests**

```bash
pnpm --filter @opendeck/slide-dsl test
```

Expected: All tests pass.

- [ ] **Step 3: Fix any failures in sample-deck.json**

If sample-deck.json doesn't validate, fix the JSON to match the schema.

- [ ] **Step 4: Commit**

```bash
git add packages/slide-dsl/ examples/ && git commit -m "feat: implement Slide DSL with Zod schemas and validation tests"
```

---

## Chunk 2: Templates Package

### Task 9: Set up templates package

**Files:**
- Modify: `packages/templates/package.json`
- Create: `packages/templates/tsconfig.json`
- Create: `packages/templates/vitest.config.ts`

- [ ] **Step 1: Update package.json**

```json
{
  "name": "@opendeck/templates",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@opendeck/slide-dsl": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vitest": "^2.0.0"
  }
}
```

---

### Task 10: Define theme token types (types.ts)

**Files:**
- Create: `packages/templates/src/types.ts`

- [ ] **Step 1: Define theme token types**

```typescript
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
```

---

### Task 11: Create Apple Keynote theme

**Files:**
- Create: `packages/templates/src/themes/apple-keynote.ts`

- [ ] **Step 1: Define Apple Keynote theme tokens**

Design traits from AGENTS.md: large titles, generous whitespace, low density, large hero sections, minimal color palette, elegant sans-serif, one big idea per slide.

```typescript
export const appleKeynoteTheme = {
  id: "theme_apple_keynote",
  name: "Apple Keynote",
  style: "apple_keynote",
  colors: {
    primary: "#0071E3",
    secondary: "#86868B",
    accent: "#FF9500",
    background: "#FFFFFF",
    surface: "#F5F5F7",
    textPrimary: "#1D1D1F",
    textSecondary: "#86868B",
    textInverse: "#FFFFFF",
    border: "#D2D2D7",
    success: "#34C759",
    warning: "#FF9F0A",
    error: "#FF3B30",
    chartColors: ["#0071E3", "#FF9500", "#34C759", "#FF3B30", "#AF52DE", "#5856D6"],
  },
  typography: {
    titleFont: "SF Pro Display",
    bodyFont: "SF Pro Text",
    monoFont: "SF Mono",
    titleSize: 44,
    subtitleSize: 24,
    bodySize: 18,
    captionSize: 14,
    titleWeight: "bold",
    bodyWeight: "normal",
    lineHeight: 1.4,
  },
  spacing: {
    slidePaddingX: 1.2,
    slidePaddingY: 0.8,
    elementGap: 0.4,
    sectionGap: 0.8,
  },
  shapes: {
    cornerRadius: 12,
    lineWidth: 1,
    lineColor: "#D2D2D7",
  },
  chart: {
    axisColor: "#86868B",
    gridColor: "#E5E5EA",
    labelColor: "#1D1D1F",
    fontFamily: "SF Pro Text",
  },
  image: {
    borderRadius: 12,
    overlayOpacity: 0.3,
    overlayColor: "#000000",
  },
  density: "low",
  defaultVisualIntensity: "high",
};
```

---

### Task 12: Create Bloomberg Dark theme

**Files:**
- Create: `packages/templates/src/themes/bloomberg-dark.ts`

- [ ] **Step 1: Define Bloomberg Dark theme tokens**

Design traits: dark background, high contrast, metric cards, chart-forward, compact info density, premium fintech style.

---

### Task 13: Create McKinsey Consulting theme

**Files:**
- Create: `packages/templates/src/themes/mckinsey-consulting.ts`

- [ ] **Step 1: Define McKinsey Consulting theme tokens**

Design traits: conclusion-first titles, structured content blocks, matrix layouts, comparison tables, process diagrams, high density but strict alignment.

---

### Task 14: Create theme registry

**Files:**
- Create: `packages/templates/src/registry.ts`

- [ ] **Step 1: Implement theme registry**

```typescript
import type { ThemeSpec } from "@opendeck/slide-dsl";
import { appleKeynoteTheme } from "./themes/apple-keynote";
import { bloombergDarkTheme } from "./themes/bloomberg-dark";
import { mckinseyConsultingTheme } from "./themes/mckinsey-consulting";

const themes: Record<string, ThemeSpec> = {
  apple_keynote: appleKeynoteTheme,
  bloomberg_dark: bloombergDarkTheme,
  mckinsey_consulting: mckinseyConsultingTheme,
};

export function getTheme(style: string): ThemeSpec | undefined {
  return themes[style];
}

export function listThemes(): ThemeSpec[] {
  return Object.values(themes);
}
```

---

### Task 15: Write templates index.ts

**Files:**
- Modify: `packages/templates/src/index.ts`

- [ ] **Step 1: Re-export everything**

```typescript
export * from "./types";
export * from "./registry";
export * from "./themes/apple-keynote";
export * from "./themes/bloomberg-dark";
export * from "./themes/mckinsey-consulting";
```

---

### Task 16: Write theme tests

**Files:**
- Create: `packages/templates/src/__tests__/themes.test.ts`

- [ ] **Step 1: Test all 3 themes validate against ThemeSpec schema**

Import `themeSpecSchema` from `@opendeck/slide-dsl` and validate each theme.

- [ ] **Step 2: Test getTheme returns correct theme**

- [ ] **Step 3: Test getTheme with unknown style returns undefined**

- [ ] **Step 4: Test listThemes returns 3 themes**

---

### Task 17: Install and run template tests

- [ ] **Step 1: Install**

```bash
pnpm install
```

- [ ] **Step 2: Run tests**

```bash
pnpm --filter @opendeck/templates test
```

- [ ] **Step 3: Commit**

```bash
git add packages/templates/ && git commit -m "feat: implement 3 themes (Apple Keynote, Bloomberg Dark, McKinsey Consulting)"
```

---

## Chunk 3: Integration

### Task 18: Validate sample deck against schema

- [ ] **Step 1: Run validator on sample-deck.json**

Add a test or script that loads `examples/decks/sample-deck.json` and validates it with `validateDeck()`.

- [ ] **Step 2: Fix any validation errors**

Update sample-deck.json to match the schema (add missing fields, fix types).

- [ ] **Step 3: Commit**

```bash
git add examples/ packages/slide-dsl/ && git commit -m "fix: align sample deck with Slide DSL schema"
```

---

### Task 19: Apply theme to renderer

- [ ] **Step 1: Update sidecar renderer to accept theme tokens**

Modify `sidecars/node-renderer/src/renderer.ts` to accept an optional theme parameter and pass theme tokens to layout functions.

- [ ] **Step 2: Update layout functions to use theme tokens**

Modify at least cover.ts and closing.ts to use theme colors/fonts when provided.

- [ ] **Step 3: Build and test**

```bash
cd sidecars/node-renderer && pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add sidecars/ && git commit -m "feat: renderer accepts theme tokens for styling"
```

---

## Execution Order

```
Chunk 1 (Slide DSL):
  Tasks 1-8 → sequential (schema → types → validator → tests)

Chunk 2 (Templates):
  Tasks 9-17 → can start in parallel with Chunk 1
  (depends on slide-dsl types only for ThemeSpec import)

Chunk 3 (Integration):
  Task 18-19 → after Chunks 1 & 2 complete
```
