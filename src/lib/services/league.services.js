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

/**
 * Per-matchday points history for every member of the league, including
 * a computed league-average series. The `kickbaseHonorsDay` flag is true
 * when the backend confirmed Kickbase actually returned distinct snapshots
 * per matchday — when false, the chart should render a "data wird ab
 * kommendem Spieltag aufgezeichnet" fallback.
 *
 * @param {string} leagueId
 * @param {{ from?: number, to?: number }} [opts]
 * @returns {Promise<{
 *   leagueId: string,
 *   matchdays: number[],
 *   leagueAverage: Array<number | null>,
 *   users: Array<{
 *     userId: string,
 *     name: string,
 *     totalPoints: number,
 *     points: Array<number | null>
 *   }>,
 *   kickbaseHonorsDay: boolean
 * }>}
 *
 * @example
 *   const history = await getLeaguePointsHistory("L123");
 *   const me = history.users.find(u => u.userId === myId);
 */
export function getLeaguePointsHistory(leagueId, opts = {}) {
  const params = new URLSearchParams();
  if (opts.from) params.set("from", String(opts.from));
  if (opts.to) params.set("to", String(opts.to));
  const qs = params.toString();
  const url = `/api/v1/league/${encodeURIComponent(leagueId)}/points-history${qs ? `?${qs}` : ""}`;
  return apiFetch(url);
}
