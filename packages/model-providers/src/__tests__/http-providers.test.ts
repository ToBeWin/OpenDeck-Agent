import { describe, it, expect, vi, afterEach } from "vitest";
import { createOpenAICompatProvider } from "../providers/openai-compat";
import { createAnthropicProvider } from "../providers/anthropic";

const originalFetch = globalThis.fetch;

function mockFetch(responseBody: unknown, status = 200) {
  const mock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(responseBody),
    json: async () => responseBody,
  });
  globalThis.fetch = mock;
  return mock;
}

describe("OpenAI provider HTTP", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("sends correct request body", async () => {
    const mock = mockFetch({
      choices: [{ message: { content: "Hello" }, finish_reason: "stop" }],
      usage: { prompt_tokens: 10, completion_tokens: 5 },
    });

    const provider = createOpenAICompatProvider({
      apiKey: "sk-test",
      baseUrl: "https://api.openai.com/v1",
      model: "gpt-4o-mini",
    });

    const result = await provider.complete({
      prompt: "Say hello",
      systemPrompt: "Be polite",
      maxTokens: 100,
      temperature: 0.5,
    });

    expect(result.content).toBe("Hello");
    expect(result.usage?.inputTokens).toBe(10);
    expect(result.finishReason).toBe("stop");

    // Verify request body
    const callArgs = mock.mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.model).toBe("gpt-4o-mini");
    expect(body.messages[0].role).toBe("system");
    expect(body.messages[0].content).toBe("Be polite");
    expect(body.messages[1].content).toBe("Say hello");
    expect(body.max_tokens).toBe(100);
    expect(body.temperature).toBe(0.5);
  });

  it("handles API errors", async () => {
    mockFetch({ error: { message: "Invalid API key" } }, 401);

    const provider = createOpenAICompatProvider({
      apiKey: "sk-bad",
      baseUrl: "https://api.openai.com/v1",
    });

    await expect(
      provider.complete({ prompt: "test" })
    ).rejects.toThrow();
  });

  it("sends images in request when provided", async () => {
    const mock = mockFetch({
      choices: [{ message: { content: "A cat" }, finish_reason: "stop" }],
    });

    const provider = createOpenAICompatProvider({
      apiKey: "sk-test",
      baseUrl: "https://api.openai.com/v1",
    });

    await provider.complete({
      prompt: "What's in this image?",
      images: [{ data: "base64imgdata", mimeType: "image/png" }],
    });

    const callArgs = mock.mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(Array.isArray(body.messages[0].content)).toBe(true);
    expect(body.messages[0].content[0].type).toBe("text");
    expect(body.messages[0].content[1].type).toBe("image_url");
  });
});

describe("Anthropic provider HTTP", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("sends Anthropic-specific headers", async () => {
    const mock = mockFetch({
      content: [{ type: "text", text: "Hello from Claude" }],
      stop_reason: "end_turn",
    });

    const provider = createAnthropicProvider({
      apiKey: "sk-ant-test",
      baseUrl: "https://api.anthropic.com/v1",
      model: "claude-3-5-sonnet-20241022",
    });

    const result = await provider.complete({ prompt: "Hi", maxTokens: 100 });
    expect(result.content).toBe("Hello from Claude");

    const callArgs = mock.mock.calls[0];
    expect(callArgs[1].headers["x-api-key"]).toBe("sk-ant-test");
    expect(callArgs[1].headers["anthropic-version"]).toBe("2023-06-01");
  });
});
