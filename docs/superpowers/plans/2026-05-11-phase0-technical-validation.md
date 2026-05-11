# Phase 0: Technical Validation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the initial OpenDeck Agent technical validation — a Tauri desktop app that generates an editable 8-slide PPTX via a Node sidecar.

**Architecture:** Tauri 2.0 desktop app with React frontend, Rust backend commands, and a Node.js sidecar process that uses PptxGenJS to render Slide DSL into editable PPTX files. Communication between Rust and Node sidecar uses JSON-RPC over stdio.

**Tech Stack:** Tauri 2.0, React 18, TypeScript, Rust, Node.js, PptxGenJS, pnpm workspaces

---

## File Structure

```
OpenDeck-Agent/
├── apps/
│   └── desktop-tauri/
│       ├── src-tauri/
│       │   ├── Cargo.toml
│       │   ├── tauri.conf.json
│       │   ├── src/
│       │   │   ├── main.rs
│       │   │   ├── lib.rs
│       │   │   └── commands/
│       │   │       └── renderer.rs        # Tauri command: launch sidecar, generate PPTX
│       │   └── capabilities/
│       │       └── default.json
│       ├── src/
│       │   ├── App.tsx                     # Main React app with Generate button
│       │   ├── App.css
│       │   ├── main.tsx
│       │   ├── components/
│       │   │   └── GeneratePanel.tsx       # Generate button + result display
│       │   └── lib/
│       │       └── tauri.ts               # Tauri invoke wrappers
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsconfig.node.json
│       ├── vite.config.ts
│       └── tailwind.config.js
├── sidecars/
│   └── node-renderer/
│       ├── package.json
│       ├── tsconfig.json
│       ├── src/
│       │   ├── index.ts                    # JSON-RPC server over stdio
│       │   ├── renderer.ts                 # PptxGenJS rendering logic
│       │   └── layouts/
│       │       ├── index.ts                # Layout registry
│       │       ├── cover.ts
│       │       ├── agenda.ts
│       │       ├── insight.ts
│       │       ├── two-column.ts
│       │       ├── comparison-matrix.ts
│       │       ├── timeline.ts
│       │       ├── chart-focus.ts
│       │       └── closing.ts
│       └── tsconfig.json
├── packages/
│   ├── slide-dsl/                          # Placeholder
│   │   └── package.json
│   ├── templates/                          # Placeholder
│   │   └── package.json
│   ├── layout-engine/                      # Placeholder
│   │   └── package.json
│   ├── render-pptx/                        # Placeholder
│   │   └── package.json
│   ├── agent-core/                         # Placeholder
│   │   └── package.json
│   ├── model-providers/                    # Placeholder
│   │   └── package.json
│   ├── image-providers/                    # Placeholder
│   │   └── package.json
│   ├── visual-planner/                     # Placeholder
│   │   └── package.json
│   ├── asset-manager/                      # Placeholder
│   │   └── package.json
│   └── quality/                            # Placeholder
│       └── package.json
├── examples/
│   └── decks/
│       └── sample-deck.json                # 8-slide sample deck
├── docs/
│   └── SIDEcar_PROTOCOL.md                 # Sidecar protocol documentation
├── AGENTS.md
├── README.md
├── package.json                            # pnpm workspace root
└── pnpm-workspace.yaml
```

---

## Chunk 1: Monorepo Scaffolding & Sample Data

### Task 1: Initialize pnpm workspace

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "opendeck-agent",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter @opendeck/desktop-tauri dev",
    "build": "pnpm --filter @opendeck/desktop-tauri build",
    "render:test": "pnpm --filter @opendeck/node-renderer start"
  }
}
```

- [ ] **Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "sidecars/*"
```

- [ ] **Step 3: Commit**

```bash
git init && git add -A && git commit -m "chore: initialize pnpm workspace"
```

---

### Task 2: Create sample deck JSON

**Files:**
- Create: `examples/decks/sample-deck.json`

- [ ] **Step 1: Write sample-deck.json with 8 slides**

Create a complete deck JSON with these 8 slide types: cover, agenda, insight, two_column, comparison_matrix, timeline, chart_focus, closing. Each slide must have `id`, `index`, `type`, `layout`, `communicationGoal`, `mainMessage`, `elements[]` with proper text/image/table/chart elements. All text elements must have `editable: true`. Use Chinese content for a "2025 AI 行业趋势分析" presentation.

- [ ] **Step 2: Validate JSON is well-formed**

```bash
node -e "JSON.parse(require('fs').readFileSync('examples/decks/sample-deck.json','utf8')); console.log('Valid JSON')"
```

- [ ] **Step 3: Commit**

```bash
git add examples/ && git commit -m "feat: add sample 8-slide deck JSON"
```

---

### Task 3: Create placeholder package folders

**Files:**
- Create: `packages/{slide-dsl,templates,layout-engine,render-pptx,agent-core,model-providers,image-providers,visual-planner,asset-manager,quality}/package.json`

- [ ] **Step 1: Create each placeholder package.json**

For each of the 10 packages, create a minimal package.json:

```json
{
  "name": "@opendeck/<package-name>",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts",
  "scripts": {}
}
```

Package names: `slide-dsl`, `templates`, `layout-engine`, `render-pptx`, `agent-core`, `model-providers`, `image-providers`, `visual-planner`, `asset-manager`, `quality`

- [ ] **Step 2: Commit**

```bash
git add packages/ && git commit -m "chore: create placeholder package structure"
```

---

## Chunk 2: Node Renderer Sidecar

### Task 4: Create Node renderer sidecar project

**Files:**
- Create: `sidecars/node-renderer/package.json`
- Create: `sidecars/node-renderer/tsconfig.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@opendeck/node-renderer",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx src/index.ts"
  },
  "dependencies": {
    "pptxgenjs": "^3.12.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "tsx": "^4.7.0",
    "@types/node": "^20.0.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"]
}
```

---

### Task 5: Implement JSON-RPC stdio server

**Files:**
- Create: `sidecars/node-renderer/src/index.ts`

- [ ] **Step 1: Write the JSON-RPC stdio server**

The server reads newline-delimited JSON from stdin, dispatches to handlers, and writes JSON responses to stdout. Must handle:
- `render.pptx` method — takes `deckPath`, `outputPath`, `mode`
- `ping` method — returns `{ pong: true }`
- Error responses with `id`, `error: { code, message }`
- Graceful shutdown on EOF

- [ ] **Step 2: Commit**

```bash
git add sidecars/node-renderer/ && git commit -m "feat: add node-renderer sidecar with JSON-RPC server"
```

---

### Task 6: Implement PPTX renderer with PptxGenJS

**Files:**
- Create: `sidecars/node-renderer/src/renderer.ts`
- Create: `sidecars/node-renderer/src/layouts/index.ts`
- Create: `sidecars/node-renderer/src/layouts/cover.ts`
- Create: `sidecars/node-renderer/src/layouts/agenda.ts`
- Create: `sidecars/node-renderer/src/layouts/insight.ts`
- Create: `sidecars/node-renderer/src/layouts/two-column.ts`
- Create: `sidecars/node-renderer/src/layouts/comparison-matrix.ts`
- Create: `sidecars/node-renderer/src/layouts/timeline.ts`
- Create: `sidecars/node-renderer/src/layouts/chart-focus.ts`
- Create: `sidecars/node-renderer/src/layouts/closing.ts`

- [ ] **Step 1: Create layout registry (layouts/index.ts)**

Export a `renderSlide(pres: PptxGen, slide: SlideData, theme: ThemeSpec)` function that dispatches to the correct layout handler based on `slide.layout`.

- [ ] **Step 2: Implement cover layout**

Cover slide: large title centered, subtitle below, optional background image. Use PptxGenJS `addText()` with real editable text objects.

- [ ] **Step 3: Implement agenda layout**

Agenda slide: title + numbered list of sections. Real editable text boxes.

- [ ] **Step 4: Implement insight layout**

Insight slide: large metric number + supporting text. Editable text objects.

- [ ] **Step 5: Implement two-column layout**

Two-column: title + left/right content areas. Editable text objects.

- [ ] **Step 6: Implement comparison-matrix layout**

Comparison matrix: title + table with headers and rows. Use PptxGenJS `addTable()` for editable tables.

- [ ] **Step 7: Implement timeline layout**

Timeline: title + horizontal/vertical timeline with labeled points. Use shapes + text objects.

- [ ] **Step 8: Implement chart-focus layout**

Chart focus: title + chart. Use PptxGenJS `addChart()` for editable charts (bar chart with sample data).

- [ ] **Step 9: Implement closing layout**

Closing slide: large "Thank You" or closing message, centered.

- [ ] **Step 10: Create renderer.ts**

Main renderer function:
1. Read deck JSON from file
2. Create new PptxGen presentation (16:9)
3. For each slide, call layout registry
4. Save to output path
5. Return `RenderResult` with stats and warnings

- [ ] **Step 11: Wire renderer into JSON-RPC server**

Connect the `render.pptx` handler to the renderer function.

- [ ] **Step 12: Build and test manually**

```bash
cd sidecars/node-renderer && pnpm install && pnpm build
echo '{"id":"test1","method":"ping","params":{}}' | node dist/index.js
```

Expected: `{"id":"test1","result":{"pong":true}}`

- [ ] **Step 13: Commit**

```bash
git add sidecars/ && git commit -m "feat: implement PPTX renderer with 8 slide layouts"
```

---

## Chunk 3: Tauri Desktop App

### Task 7: Scaffold Tauri 2.0 + React + TypeScript app

**Files:**
- Create: `apps/desktop-tauri/` (via `pnpm create tauri-app`)

- [ ] **Step 1: Create Tauri app with React + TypeScript template**

```bash
cd /Users/bingo/workspace/opc/OpenDeck-Agent
pnpm create tauri-app apps/desktop-tauri --template react-ts --manager pnpm
```

- [ ] **Step 2: Verify it builds**

```bash
cd apps/desktop-tauri && pnpm install && pnpm tauri build --debug 2>&1 | head -50
```

- [ ] **Step 3: Update package.json name**

Ensure `"name": "@opendeck/desktop-tauri"` in apps/desktop-tauri/package.json.

- [ ] **Step 4: Commit**

```bash
git add apps/ && git commit -m "chore: scaffold Tauri 2.0 + React + TypeScript app"
```

---

### Task 8: Add Rust command for PPTX generation

**Files:**
- Modify: `apps/desktop-tauri/src-tauri/src/lib.rs`
- Create: `apps/desktop-tauri/src-tauri/src/commands/renderer.rs`

- [ ] **Step 1: Create renderer.rs Tauri command**

```rust
use std::process::Command;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct RenderResult {
    pub file_path: String,
    pub warnings: Vec<String>,
    pub stats: RenderStats,
}

#[derive(Serialize, Deserialize)]
pub struct RenderStats {
    pub slide_count: u32,
    pub editable_text_count: u32,
    pub image_count: u32,
    pub chart_count: u32,
    pub table_count: u32,
}

#[tauri::command]
pub fn generate_test_pptx(app: tauri::AppHandle) -> Result<RenderResult, String> {
    // Get paths
    let resource_dir = app.path().resource_dir().map_err(|e| e.to_string())?;
    let sidecar_path = resource_dir.join("sidecars").join("node-renderer");
    let deck_path = resource_dir.join("examples").join("decks").join("sample-deck.json");
    let output_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&output_dir).map_err(|e| e.to_string())?;
    let output_path = output_dir.join("output.pptx");

    // Launch sidecar
    let request = serde_json::json!({
        "id": "gen_001",
        "method": "render.pptx",
        "params": {
            "deckPath": deck_path.to_string_lossy(),
            "outputPath": output_path.to_string_lossy(),
            "mode": "editable"
        }
    });

    let mut child = Command::new("node")
        .arg(sidecar_path.join("dist").join("index.js"))
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start sidecar: {}", e))?;

    // Write request
    use std::io::Write;
    let stdin = child.stdin.as_mut().ok_or("Failed to open stdin")?;
    stdin.write_all(request.to_string().as_bytes()).map_err(|e| e.to_string())?;
    stdin.write_all(b"\n").map_err(|e| e.to_string())?;
    drop(child.stdin.take());

    // Read response
    let output = child.wait_with_output().map_err(|e| e.to_string())?;
    let stdout = String::from_utf8_lossy(&output.stdout);

    let response: serde_json::Value = serde_json::from_str(&stdout)
        .map_err(|e| format!("Invalid sidecar response: {}", e))?;

    if let Some(error) = response.get("error") {
        return Err(format!("Sidecar error: {}", error));
    }

    let result = response.get("result").ok_or("No result in response")?;
    let render_result: RenderResult = serde_json::from_value(result.clone())
        .map_err(|e| format!("Failed to parse result: {}", e))?;

    Ok(render_result)
}
```

- [ ] **Step 2: Register command in lib.rs**

Add `mod commands;` and register `commands::renderer::generate_test_pptx` in the Tauri builder.

- [ ] **Step 3: Add required dependencies to Cargo.toml**

Add `serde`, `serde_json` to dependencies.

- [ ] **Step 4: Commit**

```bash
git add apps/desktop-tauri/src-tauri/ && git commit -m "feat: add Rust command for PPTX generation via sidecar"
```

---

### Task 9: Build React UI with Generate button

**Files:**
- Modify: `apps/desktop-tauri/src/App.tsx`
- Create: `apps/desktop-tauri/src/components/GeneratePanel.tsx`
- Create: `apps/desktop-tauri/src/lib/tauri.ts`
- Modify: `apps/desktop-tauri/src/App.css`

- [ ] **Step 1: Create tauri.ts invoke wrapper**

```typescript
import { invoke } from "@tauri-apps/api/core";

export interface RenderStats {
  slide_count: number;
  editable_text_count: number;
  image_count: number;
  chart_count: number;
  table_count: number;
}

export interface RenderResult {
  file_path: string;
  warnings: string[];
  stats: RenderStats;
}

export async function generateTestPptx(): Promise<RenderResult> {
  return invoke<RenderResult>("generate_test_pptx");
}
```

- [ ] **Step 2: Create GeneratePanel component**

A panel with:
- "Generate Test PPTX" button
- Loading state
- Result display: file path, stats (slide count, text count, image count, chart count, table count)
- "Open File" button (calls `shell.open` on the file path)
- Error display

- [ ] **Step 3: Update App.tsx**

Replace default Vite template with OpenDeck Agent layout: header with app name + GeneratePanel.

- [ ] **Step 4: Style with Tailwind**

Clean, minimal styling. Dark header, centered content panel.

- [ ] **Step 5: Commit**

```bash
git add apps/desktop-tauri/src/ && git commit -m "feat: add React UI with Generate Test PPTX button"
```

---

## Chunk 4: Documentation & Integration

### Task 10: Create README.md

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README**

Cover: project description, tech stack, project structure, how to install (`pnpm install`), how to run dev (`pnpm dev`), how to test sidecar manually, architecture overview, Phase 0 acceptance criteria.

- [ ] **Step 2: Commit**

```bash
git add README.md && git commit -m "docs: add README with architecture and setup instructions"
```

---

### Task 11: Document sidecar protocol

**Files:**
- Create: `docs/SIDECAR_PROTOCOL.md`

- [ ] **Step 1: Write protocol documentation**

Cover: communication model (JSON-RPC over stdio), request/response format, supported methods (`render.pptx`, `ping`), error format, example exchanges.

- [ ] **Step 2: Commit**

```bash
git add docs/ && git commit -m "docs: add sidecar protocol documentation"
```

---

### Task 12: End-to-end integration test

- [ ] **Step 1: Install all dependencies**

```bash
pnpm install
```

- [ ] **Step 2: Build sidecar**

```bash
pnpm --filter @opendeck/node-renderer build
```

- [ ] **Step 3: Start Tauri dev app**

```bash
pnpm dev
```

- [ ] **Step 4: Click "Generate Test PPTX" and verify**

- PPTX file is created
- Stats are displayed in UI
- Open file button works

- [ ] **Step 5: Manual verification**

Open the generated PPTX in PowerPoint/WPS and verify:
- All 8 slides are present
- Text is editable (not screenshots)
- Images are separate objects
- Tables are editable
- Charts are editable
- 16:9 layout works
- Chinese text renders correctly

---

## Execution Order

```
Chunk 1 (parallel):
  Task 1: pnpm workspace       ─┐
  Task 2: sample deck JSON      ├─→ independent, run in parallel
  Task 3: placeholder packages  ─┘

Chunk 2 (sequential within, parallel with Chunk 1):
  Task 4: sidecar project setup
  Task 5: JSON-RPC server
  Task 6: PPTX renderer (depends on 4, 5)

Chunk 3 (after Chunk 1):
  Task 7: scaffold Tauri app
  Task 8: Rust commands (depends on 7)
  Task 9: React UI (depends on 7)

Chunk 4 (after all):
  Task 10: README
  Task 11: sidecar protocol docs
  Task 12: integration test
```
