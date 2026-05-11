import type { ImageModelProvider } from "./types";

const providers = new Map<string, ImageModelProvider>();

export function registerImageProvider(provider: ImageModelProvider): void {
  providers.set(provider.name, provider);
}

export function getImageProvider(name: string): ImageModelProvider | undefined {
  return providers.get(name);
}

export function listImageProviders(): string[] {
  return Array.from(providers.keys());
}

export function getDefaultImageProvider(): ImageModelProvider | undefined {
  const first = providers.values().next();
  return first.done ? undefined : first.value;
}
