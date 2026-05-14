import { apiFetch } from "./api.services.js";

/**
 * @returns {Promise<{ leagues: Array<{id: string, name: string}> }>}
 *
 * @example
 *   const { leagues } = await getMyLeagues();
 */
export function getMyLeagues() {
  return apiFetch("/api/v1/league/me/leagues");
}

/**
 * @param {string} leagueId Kickbase league id
 * @returns {Promise<{ leagueId: string, entries: object[] }>}
 *
 * @example
 *   const ranking = await getLeagueRanking("L123");
 */
export function getLeagueRanking(leagueId) {
  return apiFetch(`/api/v1/league/${encodeURIComponent(leagueId)}/ranking`);
}
