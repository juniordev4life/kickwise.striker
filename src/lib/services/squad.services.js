import { apiFetch } from "./api.services.js";

/**
 * @param {string} leagueId Kickbase league id
 * @returns {Promise<{ leagueId: string, players: object[] }>}
 *
 * @example
 *   const squad = await getMySquad("L123");
 */
export function getMySquad(leagueId) {
  return apiFetch(`/api/v1/squad/${encodeURIComponent(leagueId)}`);
}
