# Sidecar Protocol

## Overview

The Node renderer sidecar communicates with the Tauri host process using a **JSON-RPC-like protocol** over **stdio**. Messages are newline-delimited JSON objects — one JSON object per line.

The host writes requests to the sidecar's **stdin** and reads responses from the sidecar's **stdout**. Diagnostic logs may be written to **stderr** and are not part of the protocol.

## Request Format

```json
{
  "id": "req-001",
  "method": "render.pptx",
  "params": { "deckPath": "/tmp/deck.json", "outputPath": "/tmp/out.pptx", "mode": "editable" }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique request identifier — the response echoes it back |
| `method` | string | yes | Method name to invoke |
| `params` | object | no | Method-specific parameters |

## Response Format

### Success

```json
{
  "id": "req-001",
  "result": { "filePath": "/tmp/out.pptx", "warnings": [], "stats": { "slideCount": 5, "editableTextCount": 24, "imageCount": 3, "chartCount": 1, "tableCount": 2 } }
}
```

### Error

```json
{
  "id": "req-001",
  "error": { "code": 3000, "message": "Failed to render slide 3: missing layout bounds" }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Echoed from the request |
| `result` | object | Present on success — method-specific payload |
| `error` | object | Present on failure — contains `code` and `message` |

## Methods

### `ping`

Health check. Returns a simple acknowledgment.

**Params:** none

**Result:**

```json
{ "pong": true }
```

---

### `render.pptx`

Renders a Slide DSL JSON file into a `.pptx` presentation.

**Params:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `deckPath` | string | yes | Absolute path to the Slide DSL JSON file |
| `outputPath` | string | yes | Absolute path for the output `.pptx` file |
| `mode` | string | no | `"editable"` (default) or `"cinematic"` |

- `editable` — all text remains individually selectable and editable in PowerPoint.
- `cinematic` — optimized for visual fidelity; some elements may be flattened.

**Result:**

| Field | Type | Description |
|-------|------|-------------|
| `filePath` | string | Absolute path to the generated `.pptx` |
| `warnings` | string[] | Non-fatal issues encountered during rendering |
| `stats` | object | Render statistics (see below) |

## Stats Object

Returned inside the `render.pptx` result:

```json
{
  "slideCount": 5,
  "editableTextCount": 24,
  "imageCount": 3,
  "chartCount": 1,
  "tableCount": 2
}
```

| Field | Type | Description |
|-------|------|-------------|
| `slideCount` | number | Total slides generated |
| `editableTextCount` | number | Number of individually editable text elements |
| `imageCount` | number | Images embedded in the presentation |
| `chartCount` | number | Charts rendered |
| `tableCount` | number | Tables rendered |

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 1000 | Parse error | The request JSON was malformed or not valid JSON |
| 2000 | Method not found | The requested method does not exist |
| 3000 | Render error | An error occurred during rendering (missing data, layout failure, etc.) |
| 4000 | File not found | A referenced file path does not exist on disk |

## Example Exchanges

### Ping

**Request:**

```
{"id":"ping-1","method":"ping"}
```

**Response:**

```
{"id":"ping-1","result":{"pong":true}}
```

### Render PPTX

**Request:**

```
{"id":"render-1","method":"render.pptx","params":{"deckPath":"/tmp/my-deck.json","outputPath":"/tmp/my-deck.pptx","mode":"editable"}}
```

**Response:**

```
{"id":"render-1","result":{"filePath":"/tmp/my-deck.pptx","warnings":["Slide 4: image 'hero.png' scaled up 2.1x — consider a higher resolution source"],"stats":{"slideCount":6,"editableTextCount":31,"imageCount":4,"chartCount":1,"tableCount":2}}}
```

### Error — File Not Found

**Request:**

```
{"id":"render-2","method":"render.pptx","params":{"deckPath":"/tmp/missing.json","outputPath":"/tmp/out.pptx"}}
```

**Response:**

```
{"id":"render-2","error":{"code":4000,"message":"File not found: /tmp/missing.json"}}
```

## Lifecycle

1. **Start** — The Tauri host spawns the sidecar process on first render request (or on application launch, depending on configuration).
2. **Ready** — The sidecar initializes and begins reading from stdin. A `ping` request can verify readiness.
3. **Active** — The sidecar stays alive and handles multiple requests sequentially over the lifetime of the process.
4. **Shutdown** — When the host closes stdin (EOF) or the process receives a termination signal, the sidecar finishes any in-flight request and exits cleanly.
