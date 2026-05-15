import { apiFetch } from "./api.services.js";

/**
 * Fetch the detail view of a single match (score, half-time score, goal
 * timeline, location, league info).
 *
 * @param {string} matchId
 * @returns {Promise<{ match: object }>}
 *
 * @example
 *   const { match } = await getMatchById("72513");
 */
export function getMatchById(matchId) {
  return apiFetch(`/api/v1/matches/${encodeURIComponent(matchId)}`);
}
