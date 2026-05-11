import { spawn } from "node:child_process";
import type { RenderRequest, RenderResult, RenderClientConfig } from "./types";

const DEFAULT_TIMEOUT = 30_000;

export class RenderClient {
  private sidecarPath: string;
  private timeout: number;

  constructor(config?: RenderClientConfig) {
    this.sidecarPath =
      config?.sidecarPath ?? require.resolve("@opendeck/node-renderer/src/index.ts");
    this.timeout = config?.timeout ?? DEFAULT_TIMEOUT;
  }

  async render(request: RenderRequest): Promise<RenderResult> {
    const payload = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "renderDeck",
      params: { deck: request.deck, outputPath: request.outputPath },
    });

    return new Promise<RenderResult>((resolve, reject) => {
      const child = spawn("node", [this.sidecarPath], {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      const timer = setTimeout(() => {
        child.kill("SIGTERM");
        reject(new Error("Render timed out"));
      }, this.timeout);

      child.stdout.on("data", (chunk: Buffer) => {
        stdout += chunk.toString();
      });

      child.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      child.on("close", (code) => {
        clearTimeout(timer);
        if (code !== 0 && !stdout) {
          reject(new Error(`Renderer exited with code ${code}: ${stderr}`));
          return;
        }
        try {
          const response = JSON.parse(stdout);
          if (response.error) {
            resolve({ success: false, error: response.error.message });
          } else {
            resolve({
              success: true,
              outputPath: response.result?.outputPath,
              stats: response.result?.stats,
            });
          }
        } catch {
          reject(new Error(`Failed to parse renderer output: ${stdout}`));
        }
      });

      child.stdin.write(payload + "\n");
      child.stdin.end();
    });
  }
}
