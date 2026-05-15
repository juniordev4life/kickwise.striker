import { apiFetch } from "./api.services.js";

/**
 * Return all 18 currently active Bundesliga teams.
 *
 * @returns {Promise<{ teams: Array<{teamId: string, name: string, logoUrl: string|null, rank: number|null}> }>}
 *
 * @example
 *   const { teams } = await getAllTeams();
 */
export function getAllTeams() {
  return apiFetch("/api/v1/teams");
}
