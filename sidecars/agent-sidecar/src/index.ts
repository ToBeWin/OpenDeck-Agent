import * as readline from "readline";
import {
  handleGenerate,
  handleModify,
  handleCheckProvider,
  handleListProviders,
  handleGenerateImage,
} from "./handlers";

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

async function handleGenerateRpc(
  id: string,
  params: Record<string, unknown>
): Promise<void> {
  try {
    const result = await handleGenerate(params);
    writeResponse(successResponse(id, result));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    writeResponse(errorResponse(id, -32000, message));
  }
}

async function handleModifyRpc(
  id: string,
  params: Record<string, unknown>
): Promise<void> {
  try {
    const result = await handleModify(params);
    writeResponse(successResponse(id, result));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    writeResponse(errorResponse(id, -32000, message));
  }
}

async function handleCheckProviderRpc(
  id: string,
  params: Record<string, unknown>
): Promise<void> {
  try {
    const result = await handleCheckProvider(params);
    writeResponse(successResponse(id, result));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    writeResponse(errorResponse(id, -32000, message));
  }
}

async function handleListProvidersRpc(id: string): Promise<void> {
  try {
    const result = await handleListProviders();
    writeResponse(successResponse(id, result));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    writeResponse(errorResponse(id, -32000, message));
  }
}

async function handleGenerateImageRpc(
  id: string,
  params: Record<string, unknown>
): Promise<void> {
  try {
    const result = await handleGenerateImage(params);
    writeResponse(successResponse(id, result));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    writeResponse(errorResponse(id, -32000, message));
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
    case "agent.generate":
      await handleGenerateRpc(id, params || {});
      break;
    case "agent.modify":
      await handleModifyRpc(id, params || {});
      break;
    case "agent.checkProvider":
      await handleCheckProviderRpc(id, params || {});
      break;
    case "agent.listProviders":
      await handleListProvidersRpc(id);
      break;
    case "agent.generateImage":
      await handleGenerateImageRpc(id, params || {});
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
