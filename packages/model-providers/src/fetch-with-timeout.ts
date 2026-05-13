export interface FetchOptions {
  url: string;
  options?: RequestInit;
  timeout?: number;
  signal?: AbortSignal;
}

export async function fetchWithTimeout({
  url,
  options = {},
  timeout = 30000,
  signal: externalSignal,
}: FetchOptions): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Combine external signal with timeout
  const combinedSignal = externalSignal
    ? combineAbortSignals(externalSignal, controller.signal)
    : controller.signal;

  try {
    const response = await fetch(url, {
      ...options,
      signal: combinedSignal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

function combineAbortSignals(...signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener("abort", () => controller.abort(signal.reason), { once: true });
  }
  return controller.signal;
}
