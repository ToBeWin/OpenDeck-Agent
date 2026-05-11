import { createOllamaProvider, detectOllama } from "./ollama";
import { registerProvider } from "../registry";

export async function autoDetectProviders(): Promise<string[]> {
  const detected: string[] = [];

  // Try Ollama
  try {
    const ollama = await detectOllama();
    if (ollama.available && ollama.models.length > 0) {
      const provider = createOllamaProvider({ model: ollama.models[0] });
      registerProvider(provider);
      detected.push(provider.id);
    }
  } catch {}

  return detected;
}
