export interface DocumentSection {
  id: string;
  title: string;
  level: number;          // heading level (1-6)
  content: string;        // raw text content
  children: DocumentSection[];
  metadata: {
    startIndex: number;
    endIndex: number;
    wordCount: number;
  };
}

export interface ParsedDocument {
  title: string;
  sections: DocumentSection[];
  metadata: {
    format: "markdown" | "text";
    totalWords: number;
    totalSections: number;
    headings: Array<{ level: number; text: string }>;
  };
}

export interface SlideOutline {
  title: string;
  content: string[];
  level: number;
  sourceSection?: string;
}
