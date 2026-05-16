import { apiFetch } from "./api.services.js";

/**
 * Fetch the current Bundesliga (1. Liga) standings via Playmaker → Winger.
 *
 * @returns {Promise<{ teams: Array<{
 *   teamId: string,
 *   name: string,
 *   rank: number|null,
 *   matchesPlayed: number|null,
 *   goalDifference: number|null,
 *   seasonPoints: number|null,
 *   logoUrl: string|null
 * }> }>}
 *
 * @example
 *   const { teams } = await getBundesligaTable();
 */
export function getBundesligaTable() {
  return apiFetch("/api/v1/table");
}
