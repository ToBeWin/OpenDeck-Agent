import { describe, it, expect } from "vitest";
import { buildOpenAIMessages, buildAnthropicMessages, buildGeminiContents } from "../providers/vision-utils";

describe("buildOpenAIMessages", () => {
  it("returns simple messages without images", () => {
    const msgs = buildOpenAIMessages("Hello", "System prompt");
    expect(msgs).toHaveLength(2);
    expect(msgs[0].role).toBe("system");
    expect(msgs[1].content).toBe("Hello");
  });

  it("returns content array format with images", () => {
    const msgs = buildOpenAIMessages("Describe", undefined, [
      { data: "abc123", mimeType: "image/png" },
    ]);
    expect(msgs).toHaveLength(1);
    expect(Array.isArray(msgs[0].content)).toBe(true);
    const content = msgs[0].content as Array<Record<string, unknown>>;
    expect(content[0].type).toBe("text");
    expect(content[1].type).toBe("image_url");
  });

  it("includes system prompt with images", () => {
    const msgs = buildOpenAIMessages("Hi", "Be helpful", [
      { data: "imgdata", mimeType: "image/jpeg" },
    ]);
    expect(msgs).toHaveLength(2);
    expect(msgs[0].role).toBe("system");
    expect(msgs[0].content).toBe("Be helpful");
  });
});

describe("buildAnthropicMessages", () => {
  it("returns simple messages without images", () => {
    const { messages, system } = buildAnthropicMessages("Hello", "System prompt");
    expect(system).toBe("System prompt");
    expect(messages).toHaveLength(1);
    expect(messages[0].content).toBe("Hello");
  });

  it("returns content blocks with images", () => {
    const { messages } = buildAnthropicMessages("Look", undefined, [
      { data: "imgdata", mimeType: "image/png" },
    ]);
    const content = messages[0].content as Array<Record<string, unknown>>;
    expect(Array.isArray(content)).toBe(true);
    expect(content[1].type).toBe("image");
  });
});

describe("buildGeminiContents", () => {
  it("returns simple contents without images", () => {
    const { contents, systemInstruction } = buildGeminiContents("Hello", "System");
    expect(systemInstruction).toBeDefined();
    expect(contents).toHaveLength(1);
    expect(contents[0].parts[0].text).toBe("Hello");
  });

  it("returns inline_data parts with images", () => {
    const { contents } = buildGeminiContents("Look", undefined, [
      { data: "img", mimeType: "image/webp" },
    ]);
    expect(contents[0].parts).toHaveLength(2);
    expect(contents[0].parts[1].inline_data).toBeDefined();
  });
});
