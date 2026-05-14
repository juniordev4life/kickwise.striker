/**
 * Format a kickoff timestamp into a short German weekday + time string,
 * e.g. "Sa 18:30".
 *
 * @param {string|Date} iso ISO timestamp or Date object
 * @returns {string} formatted short string, or empty string on invalid input
 *
 * @example
 *   formatKickoffShort("2024-08-23T18:30:00Z")  // "Fr 20:30" (Berlin time)
 */
export function formatKickoffShort(iso) {
  if (!iso) return "";
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin"
  }).format(d);
}

/**
 * Format a kickoff timestamp into a longer German format, e.g.
 * "Sa, 23. Aug 2024, 20:30".
 *
 * @param {string|Date} iso
 * @returns {string}
 *
 * @example
 *   formatKickoffLong("2024-08-23T18:30:00Z");
 */
export function formatKickoffLong(iso) {
  if (!iso) return "";
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin"
  }).format(d);
}
