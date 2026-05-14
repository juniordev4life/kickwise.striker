/**
 * Resolve the API base URL. In dev mode this is empty so requests go through
 * the Vite proxy. In production builds it can be overridden via VITE_API_URL.
 *
 * @returns {string} the API base URL (no trailing slash)
 *
 * @example
 *   import { getApiBaseUrl } from "$config/api.config.js";
 *   fetch(`${getApiBaseUrl()}/api/v1/auth/me`);
 */
export function getApiBaseUrl() {
  const url = import.meta.env.VITE_API_URL ?? "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}
