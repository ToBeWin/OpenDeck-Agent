# OpenDeck Agent — Open-Source Local-First AI Presentation Agent

Desktop AI agent that turns natural language, documents, and research materials into professional, editable presentations.

> **Goal:** Become the benchmark open-source PPT Agent — a local AI presentation strategist, copywriter, visual planner, slide designer, and production assistant.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | Tauri 2.0 |
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Core backend | Rust |
| Renderer sidecar | Node.js + PptxGenJS |
| Schema validation | Zod |
| Testing | Vitest |
| Build orchestration | pnpm workspaces |

## Project Structure

```
OpenDeck-Agent/
├── apps/
│   └── desktop-tauri/         # Tauri 2.0 desktop app (React + Rust)
│       ├── src/               # React UI — GeneratePanel, theme, layout
│       └── src-tauri/         # Rust core — sidecar lifecycle, file I/O
├── packages/
│   ├── slide-dsl/             # ✅ Slide DSL schema (Zod), types, validator
│   ├── templates/             # ✅ 3 themes: Apple Keynote, Bloomberg Dark, McKinsey
│   ├── agent-core/            # ✅ Agent pipeline: intent → plan → slide DSL
│   ├── model-providers/       # ✅ LLM providers: Ollama, OpenAI-compat, mock
│   ├── image-providers/       # ✅ Image generation: OpenAI DALL-E, mock
│   ├── visual-planner/        # ✅ Visual element suggestions per slide
│   ├── asset-manager/         # ✅ Asset caching, registration, querying
│   ├── layout-engine/         # ✅ Grid-based layout with 5 rule types
│   ├── render-pptx/           # ✅ Sidecar client for PPTX rendering
│   ├── revision/              # ✅ Revision actions, parser, undo/redo history
│   ├── document-parsers/      # ✅ Markdown & plain text → slide outlines
│   └── quality/               # ✅ Quality scoring: content, visual, editability
├── sidecars/
│   └── node-renderer/         # ✅ JSON-RPC sidecar — 16+ layouts, theme-aware
├── examples/
│   └── decks/                 # ✅ Sample 8-slide deck (Chinese AI industry analysis)
├── docs/                      # Protocol specs, architecture docs, plans
└── AGENTS.md                  # Full product specification
```

## Getting Started

### Prerequisites

- **Node.js** 20 or later
- **pnpm** 9 or later
- **Rust toolchain** (rustup — includes `cargo`, `rustc`, and the Tauri-required targets)

```bash
node --version    # >= 20
pnpm --version    # >= 9
rustc --version   # any recent stable
```

### Install

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Starts the Tauri desktop app with hot-reload for the React frontend.

### Build Sidecar

```bash
pnpm --filter @opendeck/node-renderer build
```

### Test Sidecar Manually

```bash
# Ping
echo '{"id":"1","method":"ping","params":{}}' | node sidecars/node-renderer/dist/index.js

# Render PPTX
echo '{"id":"2","method":"render.pptx","params":{"deckPath":"examples/decks/sample-deck.json","outputPath":"/tmp/output.pptx","mode":"editable"}}' | node sidecars/node-renderer/dist/index.js
```

### Run Tests

```bash
pnpm test                                 # Run all package tests (155 tests)
pnpm --filter @opendeck/slide-dsl test    # Schema validation tests
pnpm --filter @opendeck/templates test    # Theme tests
pnpm --filter @opendeck/agent-core test   # Agent pipeline tests
pnpm --filter @opendeck/revision test     # Revision system tests
```

## Architecture

```
User Intent
    → Structured Requirement
    → Deck Plan
    → Slide DSL (validated JSON)
    → Template Engine (theme tokens)
    → Layout Engine (positioned elements)
    → Renderer (PptxGenJS → editable PPTX)
    → Quality Critic
    → Revision Loop
```

Each stage is an independent package with a well-defined interface.

## Sidecar Protocol

The Node renderer sidecar communicates via **JSON-RPC over stdio** (newline-delimited JSON).

| Method | Description |
|--------|-------------|
| `ping` | Health check → `{ pong: true }` |
| `render.pptx` | Render deck JSON → editable PPTX |

See **[docs/SIDECAR_PROTOCOL.md](docs/SIDECAR_PROTOCOL.md)** for full protocol specification.

## Slide DSL

The Slide DSL is the canonical representation of a presentation deck. It is:

- Defined in `packages/slide-dsl` using TypeScript + Zod
- Validated before rendering
- The single source of truth for all generation, revision, and export flows

Supported slide types: cover, agenda, insight, comparison, timeline, data_chart, closing, and more.

Supported elements: text, image, table, chart, shape, icon, group.

## Themes

Three themes are implemented in `packages/templates`:

| Theme | Style | Use Case |
|-------|-------|----------|
| **Apple Keynote** | Light, large titles, generous whitespace | Product launches, startup pitches |
| **Bloomberg Dark** | Dark, high contrast, chart-forward | Industry analysis, financial reports |
| **McKinsey Consulting** | Structured, conclusion-first, high density | Executive reports, strategy decks |

## Development Phases

| Phase | Name | Status |
|-------|------|--------|
| 0 | Technical Validation | ✅ Done |
| 1 | Slide DSL + Templates | ✅ Done |
| 2 | PPTX Renderer Enhancement | ✅ Done (16+ layouts) |
| 3 | Desktop UI | ✅ Done (3-panel layout) |
| 4 | Model Providers | ✅ Done (Ollama, OpenAI, mock) |
| 5 | Agent Generation | ✅ Done (pipeline, planner, architect) |
| 6 | Revision System | ✅ Done (actions, parser, undo/redo) |
| 7 | Visual Asset System | ✅ Done (assets, image providers) |
| 8 | Document Input | ✅ Done (Markdown, text parsers) |
| 9 | Quality Critic | ✅ Done (scoring, 155 tests) |

See **[AGENTS.md](AGENTS.md)** for the full product specification and phase definitions.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-change`)
3. Make your changes with clear commit messages
4. Push to your fork and open a Pull Request

## License

MIT
