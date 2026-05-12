import { describe, it, expect, vi } from "vitest";
import { createWebSearchProvider } from "../providers/web-search";
import { registerRetrievalProvider, getRetrievalProvider, listRetrievalProviders } from "../registry";

describe("WebSearchProvider", () => {
  it("creates with defaults", () => {
    const p = createWebSearchProvider();
    expect(p.id).toBe("web-search");
    expect(p.name).toBe("Web Search");
    expect(p.supportsWebSearch).toBe(true);
    expect(p.supportsUrlParsing).toBe(true);
  });

  it("parseUrl returns fallback on connection failure", async () => {
    const p = createWebSearchProvider();
    const result = await p.parseUrl!({ url: "http://localhost:1/nonexistent" });
    expect(result.url).toBe("http://localhost:1/nonexistent");
    expect(typeof result.content).toBe("string");
  }, 10000);

  it("search returns array gracefully", async () => {
    const p = createWebSearchProvider();
    const results = await p.search({ query: "x" });
    expect(Array.isArray(results)).toBe(true);
  }, 10000);

  it("uses API endpoint when configured", async () => {
    const originalFetch = globalThis.fetch;
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          { title: "Test", url: "https://example.com", snippet: "A test result" },
        ],
      }),
    });
    globalThis.fetch = mockFetch;

    const p = createWebSearchProvider({
      apiEndpoint: "https://api.example.com/search",
      apiKey: "test-key",
    });
    const results = await p.search({ query: "test", maxResults: 1 });
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe("Test");

    globalThis.fetch = originalFetch;
  });
});

describe("Retrieval Provider Registry", () => {
  it("register/get/list works", () => {
    const p = createWebSearchProvider();
    registerRetrievalProvider(p);

    const found = getRetrievalProvider("web-search");
    expect(found).toBeDefined();
    expect(found!.id).toBe("web-search");

    const all = listRetrievalProviders();
    expect(all.length).toBeGreaterThanOrEqual(1);
  });
});
