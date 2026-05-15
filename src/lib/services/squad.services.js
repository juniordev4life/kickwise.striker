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

/**
 * Fetch the engine-optimized starting XI + captain for the user's squad in
 * a given league, optionally for a specific matchday and formation.
 *
 * @param {string} leagueId
 * @param {object} [opts]
 * @param {string} [opts.formation] e.g. "4-4-2"
 * @param {number} [opts.matchday]
 * @param {string} [opts.seasonId]
 * @returns {Promise<object>}
 *
 * @example
 *   const lineup = await getOptimizedLineup("L123", { formation: "4-5-1" });
 */
export function getOptimizedLineup(leagueId, opts = {}) {
  const params = new URLSearchParams();
  if (opts.formation) params.set("formation", opts.formation);
  if (opts.matchday) params.set("matchday", String(opts.matchday));
  if (opts.seasonId) params.set("seasonId", opts.seasonId);
  const qs = params.toString();
  const path = `/api/v1/squad/${encodeURIComponent(leagueId)}/lineup${qs ? `?${qs}` : ""}`;
  return apiFetch(path);
}

/**
 * Fetch top captain candidates from the user's squad for a given matchday.
 *
 * @param {string} leagueId
 * @param {object} [opts]
 * @param {number} [opts.matchday]
 * @returns {Promise<{ seasonId: string, matchday: number, candidates: object[] }>}
 */
export function getCaptainCandidates(leagueId, opts = {}) {
  const params = new URLSearchParams();
  if (opts.matchday) params.set("matchday", String(opts.matchday));
  if (opts.seasonId) params.set("seasonId", opts.seasonId);
  const qs = params.toString();
  const path = `/api/v1/squad/${encodeURIComponent(leagueId)}/captain-candidates${qs ? `?${qs}` : ""}`;
  return apiFetch(path);
}
