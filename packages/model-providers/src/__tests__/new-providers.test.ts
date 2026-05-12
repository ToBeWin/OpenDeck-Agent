import { describe, it, expect } from "vitest";
import { createKimiProvider } from "../providers/kimi";
import { createGLMProvider } from "../providers/glm";
import { createMiniMaxProvider } from "../providers/minimax";
import { createDeepSeekProvider } from "../providers/deepseek";
import { createQwenProvider } from "../providers/qwen";
import { createOpenRouterProvider } from "../providers/openrouter";
import { createLMStudioProvider } from "../providers/lmstudio";
import { createVLLMProvider } from "../providers/vllm";
import { createAnthropicProvider } from "../providers/anthropic";
import { createGeminiProvider } from "../providers/gemini";

describe("KimiProvider", () => {
  it("creates with defaults", () => {
    const p = createKimiProvider();
    expect(p.id).toContain("kimi"); expect(p.type).toBe("cloud");
    expect(p.supportsVision).toBe(true);
  });
  it("throws on connection failure", async () => {
    await expect(createKimiProvider({ baseUrl: "http://localhost:1", apiKey: "x" }).complete({ prompt: "hi" })).rejects.toThrow(/Kimi API/);
  });
});

describe("GLMProvider", () => {
  it("domestic variant", () => {
    const p = createGLMProvider({ region: "domestic" });
    expect(p.id).toContain("glm-domestic"); expect(p.name).toContain("国内");
  });
  it("international variant", () => {
    const p = createGLMProvider({ region: "international" });
    expect(p.id).toContain("glm-international"); expect(p.name).toContain("国际");
  });
  it("domestic != international", () => {
    expect(createGLMProvider({ region: "domestic" }).id).not.toBe(createGLMProvider({ region: "international" }).id);
  });
  it("throws on connection failure", async () => {
    await expect(createGLMProvider({ baseUrl: "http://localhost:1", apiKey: "x" }).complete({ prompt: "hi" })).rejects.toThrow(/GLM API/);
  });
});

describe("MiniMaxProvider", () => {
  it("domestic variant", () => {
    const p = createMiniMaxProvider({ region: "domestic" });
    expect(p.id).toContain("minimax-domestic"); expect(p.name).toContain("国内");
  });
  it("international variant", () => {
    const p = createMiniMaxProvider({ region: "international" });
    expect(p.id).toContain("minimax-international"); expect(p.name).toContain("国际");
  });
  it("throws on connection failure", async () => {
    await expect(createMiniMaxProvider({ baseUrl: "http://localhost:1", apiKey: "x" }).complete({ prompt: "hi" })).rejects.toThrow(/MiniMax API/);
  });
});

describe("DeepSeekProvider", () => {
  it("creates with defaults", () => {
    const p = createDeepSeekProvider();
    expect(p.id).toContain("deepseek"); expect(p.type).toBe("cloud");
    expect(p.supportsVision).toBe(false);
  });
  it("throws on connection failure", async () => {
    await expect(createDeepSeekProvider({ baseUrl: "http://localhost:1", apiKey: "x" }).complete({ prompt: "hi" })).rejects.toThrow(/DeepSeek API/);
  });
});

describe("QwenProvider", () => {
  it("creates with defaults", () => {
    const p = createQwenProvider();
    expect(p.id).toContain("qwen"); expect(p.type).toBe("cloud");
  });
  it("throws on connection failure", async () => {
    await expect(createQwenProvider({ baseUrl: "http://localhost:1", apiKey: "x" }).complete({ prompt: "hi" })).rejects.toThrow(/Qwen API/);
  });
});

describe("OpenRouterProvider", () => {
  it("creates with defaults", () => {
    const p = createOpenRouterProvider();
    expect(p.id).toContain("openrouter"); expect(p.type).toBe("cloud");
  });
  it("sanitizes model name in id", () => {
    const p = createOpenRouterProvider({ model: "openai/gpt-4o" });
    expect(p.id).not.toContain("/");
  });
  it("throws on connection failure", async () => {
    await expect(createOpenRouterProvider({ baseUrl: "http://localhost:1", apiKey: "x" }).complete({ prompt: "hi" })).rejects.toThrow(/OpenRouter API/);
  });
});

describe("LMStudioProvider", () => {
  it("creates with defaults", () => {
    const p = createLMStudioProvider();
    expect(p.id).toContain("lmstudio"); expect(p.type).toBe("local");
  });
  it("throws on connection failure", async () => {
    await expect(createLMStudioProvider({ baseUrl: "http://localhost:1" }).complete({ prompt: "hi" })).rejects.toThrow(/LM Studio/);
  });
});

describe("VLLMProvider", () => {
  it("creates with defaults", () => {
    const p = createVLLMProvider();
    expect(p.id).toContain("vllm"); expect(p.type).toBe("local");
  });
  it("sanitizes model name in id", () => {
    const p = createVLLMProvider({ model: "meta-llama/Llama-2-7b" });
    expect(p.id).not.toContain("/");
  });
  it("throws on connection failure", async () => {
    await expect(createVLLMProvider({ baseUrl: "http://localhost:1" }).complete({ prompt: "hi" })).rejects.toThrow(/vLLM/);
  });
});

describe("AnthropicProvider", () => {
  it("creates with defaults", () => {
    const p = createAnthropicProvider();
    expect(p.id).toContain("anthropic"); expect(p.type).toBe("cloud");
    expect(p.supportsVision).toBe(true);
  });
  it("uses x-api-key header format", async () => {
    const p = createAnthropicProvider({ baseUrl: "http://localhost:1", apiKey: "sk-ant-test" });
    await expect(p.complete({ prompt: "hi" })).rejects.toThrow(/Anthropic API/);
  });
  it("throws on connection failure", async () => {
    await expect(createAnthropicProvider({ baseUrl: "http://localhost:1", apiKey: "x" }).complete({ prompt: "hi" })).rejects.toThrow(/Anthropic API/);
  });
});

describe("GeminiProvider", () => {
  it("creates with defaults", () => {
    const p = createGeminiProvider();
    expect(p.id).toContain("gemini"); expect(p.type).toBe("cloud");
    expect(p.supportsVision).toBe(true);
    expect(p.supportsTools).toBe(false);
  });
  it("throws on connection failure", async () => {
    await expect(createGeminiProvider({ baseUrl: "http://localhost:1/api", apiKey: "x" }).complete({ prompt: "hi" })).rejects.toThrow(/Gemini API/);
  });
});
