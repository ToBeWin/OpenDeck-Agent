import type { RetrievalProvider, SearchResult, ParseUrlRequest, ParsedDocument } from "../types";

export interface WebSearchProviderOptions {
  /** Search API base URL. If not set, uses built-in web search via fetch. */
  apiEndpoint?: string;
  apiKey?: string;
  /** Default max results per search */
  maxResults?: number;
}

/**
 * Web search provider.
 *
 * Supports two modes:
 * 1. **Built-in**: Uses `fetch` to scrape search engine result pages (no API key needed).
 * 2. **API**: Uses a configurable search API endpoint.
 *
 * Also provides URL content fetching via `parseUrl`.
 */
export function createWebSearchProvider(
  options: WebSearchProviderOptions = {}
): RetrievalProvider {
  const apiEndpoint = options.apiEndpoint;
  const apiKey = options.apiKey ?? "";
  const maxResults = options.maxResults ?? 5;

  async function builtinSearch(query: string, count: number): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    try {
      // Use DuckDuckGo's lite/search endpoint (no API key needed for basic usage)
      const url = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(url, {
        headers: { "User-Agent": "OpenDeck-Agent/1.0" },
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));
      if (!response.ok) return results;

      const html = await response.text();

      // Minimal HTML scraping for DuckDuckGo lite results
      const linkRegex = /<a[^>]+href="([^"]*)"[^>]*>([^<]*)<\/a>/gi;
      const snippetRegex = /<td class="result-snippet">([^<]*)<\/td>/i;

      let linkMatch;
      const snippets = html.match(/<td class="result-snippet">([^<]*)<\/td>/gi) ?? [];
      const links: Array<{ url: string; title: string }> = [];

      while ((linkMatch = linkRegex.exec(html)) !== null && links.length < count * 2) {
        const url = linkMatch[1];
        const title = linkMatch[2].trim();
        if (url && title && !url.startsWith("/")) {
          links.push({ url, title });
        }
      }

      for (let i = 0; i < Math.min(count, links.length, snippets.length); i++) {
        const snippet = snippets[i]?.replace(/<[^>]+>/g, "").trim() ?? "";
        results.push({
          title: links[i].title,
          url: links[i].url,
          snippet,
        });
      }
    } catch {
      // Search failed silently
    }
    return results;
  }

  async function apiSearch(query: string, count: number): Promise<SearchResult[]> {
    if (!apiEndpoint) return [];
    try {
      const url = `${apiEndpoint}?q=${encodeURIComponent(query)}&count=${count}`;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(url, { headers, signal: controller.signal }).finally(() => clearTimeout(timeout));
      if (!response.ok) return [];

      const data = (await response.json()) as {
        results?: Array<{ title?: string; url?: string; snippet?: string }>;
      };
      return (data.results ?? []).slice(0, count).map((r) => ({
        title: r.title ?? "",
        url: r.url ?? "",
        snippet: r.snippet ?? "",
      }));
    } catch {
      return [];
    }
  }

  return {
    id: "web-search",
    name: "Web Search",
    supportsWebSearch: true,
    supportsUrlParsing: true,

    async search(req: { query: string; maxResults?: number }): Promise<SearchResult[]> {
      const count = req.maxResults ?? maxResults;
      if (apiEndpoint) {
        const results = await apiSearch(req.query, count);
        if (results.length > 0) return results;
      }
      return builtinSearch(req.query, count);
    },

    async parseUrl(req: ParseUrlRequest): Promise<ParsedDocument> {
      const maxChars = req.maxChars ?? 5000;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(req.url, {
          headers: { "User-Agent": "OpenDeck-Agent/1.0" },
          signal: controller.signal,
        }).finally(() => clearTimeout(timeout));
        if (!response.ok) {
          return { title: req.url, content: "", url: req.url };
        }

        const html = await response.text();

        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : req.url;

        // Extract text content (strip HTML tags)
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        let text = bodyMatch ? bodyMatch[1] : html;
        text = text
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        if (text.length > maxChars) {
          text = text.slice(0, maxChars) + "...";
        }

        return { title, content: text, url: req.url };
      } catch {
        return { title: req.url, content: "", url: req.url };
      }
    },
  };
}
