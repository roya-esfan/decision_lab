const transientStatuses = new Set([502, 503, 504]);

/** Retry only short-lived transport/server failures. Callers must use the same
 * idempotency key when retrying a write. */
export async function fetchWithTransientRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(input, init);
      if (!transientStatuses.has(response.status) || attempt === 2) return response;
    } catch (error) {
      if (attempt === 2) throw error;
    }

    await new Promise((resolve) => window.setTimeout(resolve, attempt === 0 ? 400 : 1000));
  }

  throw new Error("The connection could not be restored.");
}
