import type { TextModelProvider } from "./types";

const providers: Map<string, TextModelProvider> = new Map();

export function registerProvider(provider: TextModelProvider): void {
  providers.set(provider.id, provider);
}

export function getProvider(id: string): TextModelProvider | undefined {
  return providers.get(id);
}

export function listProviders(): TextModelProvider[] {
  return Array.from(providers.values());
}
