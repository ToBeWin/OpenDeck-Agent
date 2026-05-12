import { invoke } from "@tauri-apps/api/core";

export interface RenderStats {
  slide_count: number;
  editable_text_count: number;
  image_count: number;
  chart_count: number;
  table_count: number;
}

export interface RenderResult {
  file_path: string;
  warnings: string[];
  stats: RenderStats;
}

export interface GenerateOptions {
  [key: string]: unknown;
  provider?: string;
  purpose?: string;
  audience?: string;
  language?: string;
  slideCount?: number;
  theme?: string;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export interface ProviderStatus {
  available: boolean;
  reason?: string;
}

export interface ProviderList {
  providers: string[];
}

export async function generateTestPptx(): Promise<RenderResult> {
  return invoke<RenderResult>("generate_test_pptx");
}

export async function generateDeck(
  prompt: string,
  options?: GenerateOptions
): Promise<{ deck: unknown }> {
  return invoke("generate_deck", { prompt, options });
}

export async function modifyDeck(
  deckJson: unknown,
  command: string
): Promise<{ deck: unknown }> {
  return invoke("modify_deck", { deckJson, command });
}

export async function exportPptx(deckJson: unknown): Promise<RenderResult> {
  return invoke("export_pptx", { deckJson });
}

export async function exportPdf(deckJson: unknown): Promise<RenderResult> {
  return invoke("export_pdf", { deckJson });
}

export async function exportHtml(deckJson: unknown): Promise<RenderResult> {
  return invoke("export_html", { deckJson });
}

export async function checkProvider(name: string): Promise<ProviderStatus> {
  return invoke("check_provider", { name });
}

export async function listProviders(): Promise<ProviderList> {
  return invoke("list_providers");
}

// ── Project Persistence ──

export async function saveProject(
  deck: unknown,
  name?: string
): Promise<string> {
  return invoke("save_project", { deckJson: deck, name: name ?? null });
}

export async function loadProject(path: string): Promise<unknown> {
  return invoke("load_project", { path });
}

export async function listProjects(): Promise<
  Array<{ path: string; name: string }>
> {
  return invoke("list_projects");
}

export async function deleteProject(path: string): Promise<void> {
  return invoke("delete_project", { path });
}
