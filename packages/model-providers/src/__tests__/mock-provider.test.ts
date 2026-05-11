import { describe, it, expect } from "vitest";
import { z } from "zod";
import { createMockProvider } from "../providers/mock";
import { registerProvider, getProvider, listProviders } from "../registry";
import { getStructuredOutput } from "../structured-output";

describe("MockProvider", () => {
  it("returns configured response", async () => {
    const provider = createMockProvider({ response: '{"hello":"world"}' });
    const result = await provider.complete({ prompt: "test" });
    expect(result.content).toBe('{"hello":"world"}');
    expect(result.finishReason).toBe("stop");
  });

  it("cycles through configured responses", async () => {
    const provider = createMockProvider({
      responses: ["first", "second", "third"],
    });
    const r1 = await provider.complete({ prompt: "a" });
    const r2 = await provider.complete({ prompt: "b" });
    const r3 = await provider.complete({ prompt: "c" });
    expect(r1.content).toBe("first");
    expect(r2.content).toBe("second");
    expect(r3.content).toBe("third");
  });

  it("structuredOutput validates against a schema", async () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const provider = createMockProvider({
      response: '{"name":"Alice","age":30}',
    });

    const result = await provider.structuredOutput!({
      prompt: "Give me a person",
      schema,
    });

    expect(result).toEqual({ name: "Alice", age: 30 });
  });

  it("structuredOutput extracts JSON from markdown code blocks", async () => {
    const schema = z.object({ value: z.number() });
    const provider = createMockProvider({
      response: 'Here is the data:\n```json\n{"value":42}\n```\nDone.',
    });

    const result = await provider.structuredOutput!({
      prompt: "Give me a value",
      schema,
    });

    expect(result).toEqual({ value: 42 });
  });
});

describe("Provider Registry", () => {
  it("register/get/list works", () => {
    const provider = createMockProvider({ response: "test" });
    registerProvider(provider);

    const found = getProvider("mock");
    expect(found).toBeDefined();
    expect(found!.id).toBe("mock");

    const all = listProviders();
    expect(all.length).toBeGreaterThanOrEqual(1);
    expect(all.some((p) => p.id === "mock")).toBe(true);
  });
});

describe("getStructuredOutput", () => {
  it("retries on invalid JSON and eventually succeeds", async () => {
    let callCount = 0;
    const provider = {
      id: "retry-test",
      name: "Retry Test",
      type: "local" as const,
      async complete() {
        callCount++;
        if (callCount === 1) {
          return {
            content: "this is not json at all",
            usage: { inputTokens: 5, outputTokens: 5 },
            finishReason: "stop",
          };
        }
        return {
          content: '{"valid": true}',
          usage: { inputTokens: 5, outputTokens: 5 },
          finishReason: "stop",
        };
      },
    };

    const schema = z.object({ valid: z.boolean() });
    const result = await getStructuredOutput(provider, {
      prompt: "test prompt",
      schema,
      maxRetries: 3,
    });

    expect(result).toEqual({ valid: true });
    expect(callCount).toBe(2);
  });

  it("throws after exhausting retries", async () => {
    const provider = {
      id: "fail-test",
      name: "Fail Test",
      type: "local" as const,
      async complete() {
        return {
          content: "not json ever",
          usage: { inputTokens: 5, outputTokens: 5 },
          finishReason: "stop",
        };
      },
    };

    const schema = z.object({ valid: z.boolean() });
    await expect(
      getStructuredOutput(provider, {
        prompt: "test prompt",
        schema,
        maxRetries: 2,
      })
    ).rejects.toThrow();
  });

  it("validates schema and retries on schema mismatch", async () => {
    let callCount = 0;
    const provider = {
      id: "schema-retry",
      name: "Schema Retry",
      type: "local" as const,
      async complete() {
        callCount++;
        if (callCount === 1) {
          return {
            content: '{"name": 123}',
            usage: { inputTokens: 5, outputTokens: 5 },
            finishReason: "stop",
          };
        }
        return {
          content: '{"name": "Alice"}',
          usage: { inputTokens: 5, outputTokens: 5 },
          finishReason: "stop",
        };
      },
    };

    const schema = z.object({ name: z.string() });
    const result = await getStructuredOutput(provider, {
      prompt: "Give me a name",
      schema,
      maxRetries: 3,
    });

    expect(result).toEqual({ name: "Alice" });
    expect(callCount).toBe(2);
  });
});
