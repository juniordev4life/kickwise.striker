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
 * Fetch the user's current Kickbase budget for a league. Returns the
 * raw payload (Kickbase doesn't document the field names — we pluck
 * the first finite numeric field downstream).
 */
export function getMyBudget(leagueId) {
  return apiFetch(`/api/v1/squad/${encodeURIComponent(leagueId)}/budget`);
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
  if (opts.riskProfile) params.set("riskProfile", opts.riskProfile);
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

/**
 * Compose the best XI from all Bundesliga players within a budget cap.
 *
 * @param {object} opts
 * @param {number} opts.budget total marketValue cap in € (e.g. 150_000_000)
 * @param {string} [opts.formation] one of FORMATIONS or "auto"
 * @param {number} [opts.matchday]
 * @param {string} [opts.seasonId]
 * @returns {Promise<object>}
 */
export function getBudgetLineup(opts) {
  const params = new URLSearchParams();
  params.set("budget", String(opts.budget));
  if (opts.formation) params.set("formation", opts.formation);
  if (opts.matchday) params.set("matchday", String(opts.matchday));
  if (opts.seasonId) params.set("seasonId", opts.seasonId);
  if (opts.riskProfile) params.set("riskProfile", opts.riskProfile);
  return apiFetch(`/api/v1/lineup/budget?${params.toString()}`);
}

/**
 * Fetch alternative players for a single position, optionally constrained
 * by a per-player market value cap and a list of excluded players.
 *
 * @param {object} opts
 * @param {string} opts.position GK | DEF | MID | FWD
 * @param {number} [opts.maxBudget]
 * @param {string[]} [opts.excludePlayerIds]
 * @param {string} [opts.riskProfile]
 * @param {number} [opts.matchday]
 * @param {number} [opts.limit]
 */
/**
 * Push a lineup to Kickbase via Playmaker.
 *
 * @param {string} leagueId
 * @param {object} payload
 * @param {string} payload.formation
 * @param {Array<{playerId: string, position: string}>} payload.players
 * @returns {Promise<object>}
 */
export function submitLineup(leagueId, payload) {
  return apiFetch(`/api/v1/squad/${encodeURIComponent(leagueId)}/lineup`, {
    method: "POST",
    body: payload
  });
}

export function getAlternatives(opts) {
  const params = new URLSearchParams();
  params.set("position", opts.position);
  if (Number.isFinite(opts.maxBudget)) {
    params.set("maxBudget", String(Math.floor(opts.maxBudget)));
  }
  if (opts.excludePlayerIds?.length) {
    params.set("excludePlayerIds", opts.excludePlayerIds.join(","));
  }
  if (opts.riskProfile) params.set("riskProfile", opts.riskProfile);
  if (opts.matchday) params.set("matchday", String(opts.matchday));
  if (opts.limit) params.set("limit", String(opts.limit));
  return apiFetch(`/api/v1/lineup/alternatives?${params.toString()}`);
}
