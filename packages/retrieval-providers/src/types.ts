export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface SearchRequest {
  query: string;
  maxResults?: number;
}

export interface ParseUrlRequest {
  url: string;
  maxChars?: number;
}

export interface ParsedDocument {
  title: string;
  content: string;
  url: string;
}

export interface RetrievalProvider {
  id: string;
  name: string;
  search(req: SearchRequest): Promise<SearchResult[]>;
  parseUrl?(req: ParseUrlRequest): Promise<ParsedDocument>;
  supportsWebSearch?: boolean;
  supportsUrlParsing?: boolean;
}
