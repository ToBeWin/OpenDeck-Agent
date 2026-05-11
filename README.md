# OpenDeck Agent — Open-Source Local-First AI Presentation Agent

Desktop AI agent that turns natural language into professional, editable presentations.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | Tauri 2.0 |
| Frontend | React + TypeScript |
| Core backend | Rust |
| Renderer sidecar | Node.js + PptxGenJS |
| Build orchestration | pnpm workspaces |

## Project Structure

```
OpenDeck-Agent/
├── apps/                  # Tauri desktop application
├── packages/
│   ├── agent-core/        # Central orchestration and intent routing
│   ├── slide-dsl/         # Slide DSL schema, validation, and serialization
│   ├── templates/         # Presentation template definitions and metadata
│   ├── layout-engine/     # Spatial layout computation for slide elements
│   ├── render-pptx/       # PPTX rendering logic (drives the sidecar)
│   ├── visual-planner/    # Slide sequence planning and content strategy
│   ├── asset-manager/     # Image, font, and media asset resolution
│   ├── image-providers/   # Pluggable image source adapters (local, Unsplash, etc.)
│   ├── model-providers/   # LLM provider abstraction layer
│   └── quality/           # Output quality checks and scoring
├── sidecars/
│   └── node-renderer/     # Node.js sidecar — JSON-RPC renderer producing PPTX
├── examples/
│   └── decks/             # Example Slide DSL JSON files and outputs
└── docs/                  # Protocol specs, architecture docs, guides
```

## Getting Started

### Prerequisites

- **Node.js** 20 or later
- **pnpm** 9 or later
- **Rust toolchain** (rustup — includes `cargo`, `rustc`, and the Tauri-required targets)

Verify your environment:

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

This starts the Tauri desktop app with hot-reload for the React frontend and the Node renderer sidecar.

### Production Build

```bash
pnpm build
```

Produces platform-specific installers under `apps/*/target/release/bundle/`.

## Architecture Overview

The generation pipeline transforms user intent into a finished presentation through five stages:

```
User Intent
    │
    ▼
Slide DSL        — Structured JSON describing slides, content, and metadata
    │
    ▼
Template Engine  — Selects and fills a presentation template
    │
    ▼
Layout Engine    — Computes element positions, sizes, and typography
    │
    ▼
Renderer         — Produces output in the target format
    │
    ▼
PPTX / HTML / PDF
```

Each stage is an independent package with a well-defined interface, making the pipeline testable and extensible at every boundary.

## Sidecar Protocol

The **Node renderer sidecar** is a separate process that the Tauri shell spawns on demand. Communication uses a JSON-RPC-like protocol over **stdio** (newline-delimited JSON).

- Request: `{ "id": string, "method": string, "params": object }`
- Response: `{ "id": string, "result": object }` or `{ "id": string, "error": { "code": number, "message": string } }`

Key methods include `ping` (health check) and `render.pptx` (deck rendering).

For the full protocol specification, request/response schemas, error codes, and example exchanges, see **[docs/SIDECAR_PROTOCOL.md](docs/SIDECAR_PROTOCOL.md)**.

## Packages

| Package | Purpose |
|---------|---------|
| `agent-core` | Central orchestration — routes user intent, manages conversation state, and coordinates the pipeline |
| `slide-dsl` | Defines the Slide DSL JSON schema, provides validation, parsing, and serialization |
| `templates` | Presentation template catalog — slide masters, color schemes, and layout presets |
| `layout-engine` | Computes spatial layout for text boxes, images, charts, and tables on each slide |
| `render-pptx` | Drives the Node sidecar to emit editable `.pptx` files from laid-out slide data |
| `visual-planner` | Plans slide sequences, determines content flow, and balances visual density |
| `asset-manager` | Resolves and caches images, icons, fonts, and other media assets |
| `image-providers` | Pluggable adapters for image sources (local files, Unsplash, DALL-E, etc.) |
| `model-providers` | Abstraction layer over LLM providers (OpenAI, Anthropic, local models, etc.) |
| `quality` | Post-render quality checks — readability scoring, layout consistency, and accessibility |

## Phase 0 Status

The project is currently in **Phase 0: Technical Validation**.

Goal: prove that the full pipeline — from structured Slide DSL JSON through template filling, layout computation, and sidecar rendering — can produce a fully **editable** `.pptx` file with correct text, images, charts, and tables.

Non-goals for this phase: natural language input, multi-slide planning, or polished UI.

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/my-change`).
3. Make your changes and commit with clear messages.
4. Push to your fork and open a Pull Request.

Please ensure your code passes `pnpm lint` and `pnpm test` before submitting.

## License

MIT
