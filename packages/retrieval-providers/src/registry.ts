import type { RetrievalProvider } from "./types";

const providers: Map<string, RetrievalProvider> = new Map();

export function registerRetrievalProvider(provider: RetrievalProvider): void {
  providers.set(provider.id, provider);
}

export function getRetrievalProvider(id: string): RetrievalProvider | undefined {
  return providers.get(id);
}

export function listRetrievalProviders(): RetrievalProvider[] {
  return Array.from(providers.values());
}
