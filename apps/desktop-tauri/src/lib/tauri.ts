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

export async function generateTestPptx(): Promise<RenderResult> {
  return invoke<RenderResult>("generate_test_pptx");
}
