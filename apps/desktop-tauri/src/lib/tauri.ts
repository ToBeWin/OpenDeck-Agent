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
  provider?: string;
  purpose?: string;
  audience?: string;
  language?: string;
  slideCount?: number;
  theme?: string;
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

export async function checkProvider(name: string): Promise<ProviderStatus> {
  return invoke("check_provider", { name });
}

export async function listProviders(): Promise<ProviderList> {
  return invoke("list_providers");
}
