import { apiFetch } from "./api.services.js";

/**
 * Fetch a filtered + sorted list of Bundesliga players.
 *
 * @param {object} [filters]
 * @param {string} [filters.position] one of "GK" | "DEF" | "MID" | "FWD"
 * @param {string} [filters.teamId] filter to a specific Bundesliga club
 * @param {number} [filters.minMarketValue]
 * @param {number} [filters.maxMarketValue]
 * @param {number} [filters.minAveragePoints]
 * @param {"marketValue"|"averagePoints"|"totalPoints"|"name"} [filters.sortBy]
 * @param {"asc"|"desc"} [filters.sortDir]
 * @param {number} [filters.limit]
 * @returns {Promise<{ total: number, returned: number, players: object[] }>}
 *
 * @example
 *   const { players } = await listPlayers({ position: "FWD", sortBy: "averagePoints" });
 */
export function listPlayers(filters = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return apiFetch(`/api/v1/players${qs ? `?${qs}` : ""}`);
}
