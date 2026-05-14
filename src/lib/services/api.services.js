import { getApiBaseUrl } from "$config/api.config.js";

/**
 * Error thrown when an API call returns a non-2xx response.
 *
 * @example
 *   throw new ApiError(401, "Unauthorized", ["UNAUTHORIZED"]);
 */
export class ApiError extends Error {
  /**
   * @param {number} status HTTP status code
   * @param {string} message human-readable message from the API envelope
   * @param {string[]} errors machine-readable error codes from the envelope
   */
  constructor(status, message, errors = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Low-level fetch wrapper that includes the JWT cookie automatically and parses
 * the Kickwise response envelope. Throws an `ApiError` on non-2xx responses.
 *
 * @template T
 * @param {string} path API path beginning with `/api/v1/...`
 * @param {object} [options]
 * @param {string} [options.method="GET"]
 * @param {object} [options.body]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<T>} the `data` field of the response envelope
 *
 * @example
 *   const { matches } = await apiFetch("/api/v1/matchday/current");
 */
export async function apiFetch(path, { method = "GET", body, signal } = {}) {
  const url = `${getApiBaseUrl()}${path}`;
  const response = await fetch(url, {
    method,
    headers: {
      "content-type": "application/json",
      accept: "application/json"
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
    signal
  });

  const text = await response.text();
  let parsed = {};
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch (_e) {
    throw new ApiError(response.status, `Invalid JSON response from ${path}`, []);
  }

  if (!response.ok) {
    throw new ApiError(response.status, parsed.message ?? response.statusText, parsed.errors ?? []);
  }
  return parsed.data;
}
