import * as readline from "readline";
import { renderPptx } from "./renderer";
import { renderPdf } from "./pdf-renderer";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface JsonRpcRequest {
  id: string;
  method: string;
  params: Record<string, unknown>;
}

interface JsonRpcSuccessResponse {
  id: string;
  result: unknown;
}

interface JsonRpcErrorResponse {
  id: string;
  error: {
    code: number;
    message: string;
  };
}

type JsonRpcResponse = JsonRpcSuccessResponse | JsonRpcErrorResponse;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function successResponse(id: string, result: unknown): JsonRpcResponse {
  return { id, result };
}

function errorResponse(id: string, code: number, message: string): JsonRpcResponse {
  return { id, error: { code, message } };
}

function writeResponse(response: JsonRpcResponse): void {
  process.stdout.write(JSON.stringify(response) + "\n");
}

// ---------------------------------------------------------------------------
// Method handlers
// ---------------------------------------------------------------------------

async function handlePing(id: string): Promise<void> {
  writeResponse(successResponse(id, { pong: true }));
}

async function handleRenderPptx(
  id: string,
  params: Record<string, unknown>
): Promise<void> {
  const deckPath = params.deckPath as string | undefined;
  const outputPath = params.outputPath as string | undefined;
  const mode = (params.mode as string) || "editable";

  if (!deckPath) {
    writeResponse(errorResponse(id, -32602, "Missing required param: deckPath"));
    return;
  }
  if (!outputPath) {
    writeResponse(errorResponse(id, -32602, "Missing required param: outputPath"));
    return;
  }

  try {
    const result = await renderPptx(deckPath, outputPath, mode);
    writeResponse(successResponse(id, result));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    writeResponse(errorResponse(id, -32000, `Render failed: ${message}`));
  }
}

async function handleRenderPdf(
  id: string,
  params: Record<string, unknown>
): Promise<void> {
  const deckPath = params.deckPath as string | undefined;
  const outputPath = params.outputPath as string | undefined;

  if (!deckPath) {
    writeResponse(errorResponse(id, -32602, "Missing required param: deckPath"));
    return;
  }
  if (!outputPath) {
    writeResponse(errorResponse(id, -32602, "Missing required param: outputPath"));
    return;
  }

  try {
    const result = await renderPdf(deckPath, outputPath);
    writeResponse(successResponse(id, result));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    writeResponse(errorResponse(id, -32000, `PDF render failed: ${message}`));
  }
}

// ---------------------------------------------------------------------------
// Request dispatcher
// ---------------------------------------------------------------------------

async function dispatch(request: JsonRpcRequest): Promise<void> {
  const { id, method, params } = request;

  switch (method) {
    case "ping":
      await handlePing(id);
      break;
    case "render.pptx":
      await handleRenderPptx(id, params || {});
      break;
    case "render.pdf":
      await handleRenderPdf(id, params || {});
      break;
    default:
      writeResponse(errorResponse(id, -32601, `Method not found: ${method}`));
  }
}

// ---------------------------------------------------------------------------
// Main — read newline-delimited JSON from stdin
// ---------------------------------------------------------------------------

function main(): void {
  const pending: Set<Promise<void>> = new Set();
  let stdinClosed = false;

  const rl = readline.createInterface({
    input: process.stdin,
    terminal: false,
  });

  rl.on("line", (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    let request: JsonRpcRequest;
    try {
      request = JSON.parse(trimmed) as JsonRpcRequest;
    } catch {
      writeResponse(errorResponse("", -32700, "Parse error: invalid JSON"));
      return;
    }

    if (!request.id || !request.method) {
      writeResponse(
        errorResponse(request.id || "", -32600, "Invalid request: missing id or method")
      );
      return;
    }

    const p = dispatch(request).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      writeResponse(errorResponse(request.id, -32603, `Internal error: ${message}`));
    }).finally(() => {
      pending.delete(p);
      if (stdinClosed && pending.size === 0) {
        process.exit(0);
      }
    });
    pending.add(p);
  });

  rl.on("close", () => {
    stdinClosed = true;
    if (pending.size === 0) {
      process.exit(0);
    }
  });
}

main();
