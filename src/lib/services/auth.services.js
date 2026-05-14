import { apiFetch } from "./api.services.js";

/**
 * Log in with the user's Kickbase credentials. On success the Playmaker sets the
 * `kickwise_token` cookie; subsequent requests are automatically authenticated.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ user: object }>}
 *
 * @example
 *   const { user } = await login({ email, password });
 */
export function login(credentials) {
  return apiFetch("/api/v1/auth/login", { method: "POST", body: credentials });
}

/**
 * Tell the API to invalidate the current session.
 *
 * @returns {Promise<object>}
 *
 * @example
 *   await logout();
 */
export function logout() {
  return apiFetch("/api/v1/auth/logout", { method: "POST" });
}

/**
 * Return the currently authenticated user.
 *
 * @returns {Promise<{ kickbaseUserId: string, leagueIds: string[], profile: object }>}
 *
 * @example
 *   const me = await getMe();
 */
export function getMe() {
  return apiFetch("/api/v1/auth/me");
}
