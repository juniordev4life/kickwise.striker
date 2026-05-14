import { apiFetch } from "./api.services.js";

/**
 * @returns {Promise<{ season: string, matchday: number, matches: object[] }>}
 *
 * @example
 *   const md = await getCurrentMatchday();
 */
export function getCurrentMatchday() {
  return apiFetch("/api/v1/matchday/current");
}

/**
 * @param {number} matchday spielende Spieltagsnummer
 * @returns {Promise<{ season: string, matchday: number, matches: object[] }>}
 *
 * @example
 *   const md30 = await getMatchday(30);
 */
export function getMatchday(matchday) {
  return apiFetch(`/api/v1/matchday/${matchday}`);
}
