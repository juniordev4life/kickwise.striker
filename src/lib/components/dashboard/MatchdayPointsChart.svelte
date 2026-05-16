<!--
  Line chart: per-matchday points for the current user vs league average
  (and optionally the league leader as a dashed comparison line). Pure SVG,
  no chart library — keeps the bundle tight and lets us style with brand
  tokens.

  Handles gracefully:
  - null points (gaps in a user's history) — line breaks at those segments
  - kickbaseHonorsDay=false — renders a fallback empty state explaining
    that history wasn't recorded yet
  - very short ranges (matchday 1 only) — shows points but won't draw a line
  - mobile-first sizing — SVG uses viewBox so it scales fluidly

  @example
    <MatchdayPointsChart
      matchdays={[1,2,3,4]}
      leagueAverage={[80, 92, 105, 88]}
      users={[...]}
      myUserId="U123"
      leaderUserId="U456"
      kickbaseHonorsDay
    />
-->
<script>
let {
  matchdays = [],
  leagueAverage = [],
  users = [],
  myUserId = null,
  leaderUserId = null,
  kickbaseHonorsDay = true
} = $props();

const VIEW_W = 720;
const VIEW_H = 260;
const PAD_LEFT = 38;
const PAD_RIGHT = 12;
const PAD_TOP = 24;
const PAD_BOTTOM = 28;
const PLOT_W = VIEW_W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = VIEW_H - PAD_TOP - PAD_BOTTOM;

const myUser = $derived(users.find((u) => u.userId === myUserId) ?? null);
const leaderUser = $derived(
  leaderUserId
    ? users.find((u) => u.userId === leaderUserId) ?? null
    : users.find((u) => u.userId !== myUserId) ?? null
);

/**
 * Pull together every numeric value in the chart so we can compute a
 * shared Y-axis range that covers user, league avg, and leader lines.
 */
const allValues = $derived.by(() => {
  const out = [];
  for (const v of leagueAverage) if (typeof v === "number") out.push(v);
  if (myUser) for (const v of myUser.points) if (typeof v === "number") out.push(v);
  if (leaderUser) for (const v of leaderUser.points) if (typeof v === "number") out.push(v);
  return out;
});

const yMax = $derived.by(() => {
  if (!allValues.length) return 100;
  const max = Math.max(...allValues);
  // Round up to a nice tick (multiples of 50)
  return Math.max(50, Math.ceil(max / 50) * 50);
});

const yMin = 0; // Points can't go below zero

/**
 * Convert a matchday-index → x pixel, value → y pixel.
 */
function xAt(idx) {
  if (matchdays.length <= 1) return PAD_LEFT + PLOT_W / 2;
  return PAD_LEFT + (idx / (matchdays.length - 1)) * PLOT_W;
}
function yAt(value) {
  if (typeof value !== "number") return null;
  const ratio = (value - yMin) / (yMax - yMin || 1);
  return PAD_TOP + PLOT_H - ratio * PLOT_H;
}

/**
 * Build an SVG path string that breaks at null points (so a missing
 * matchday doesn't draw a misleading straight line across the gap).
 *
 * @param {Array<number | null>} series
 * @returns {string}
 */
function pathFor(series) {
  if (!series?.length) return "";
  let d = "";
  let started = false;
  for (let i = 0; i < series.length; i++) {
    const y = yAt(series[i]);
    if (y === null) {
      started = false;
      continue;
    }
    const x = xAt(i);
    d += started ? ` L ${x.toFixed(1)} ${y.toFixed(1)}` : `M ${x.toFixed(1)} ${y.toFixed(1)}`;
    started = true;
  }
  return d;
}

const myPath = $derived(myUser ? pathFor(myUser.points) : "");
const avgPath = $derived(pathFor(leagueAverage));
const leaderPath = $derived(
  leaderUser && leaderUser.userId !== myUserId ? pathFor(leaderUser.points) : ""
);

/**
 * Area fill path for the user line — adds a fade gradient under the
 * primary series so it reads as the focused/featured data.
 */
const myAreaPath = $derived.by(() => {
  if (!myUser?.points?.length) return "";
  const segments = [];
  let current = [];
  for (let i = 0; i < myUser.points.length; i++) {
    const y = yAt(myUser.points[i]);
    if (y === null) {
      if (current.length) segments.push(current);
      current = [];
      continue;
    }
    current.push({ x: xAt(i), y });
  }
  if (current.length) segments.push(current);
  return segments
    .map((seg) => {
      const first = seg[0];
      const last = seg[seg.length - 1];
      let d = `M ${first.x.toFixed(1)} ${(PAD_TOP + PLOT_H).toFixed(1)} L ${first.x.toFixed(1)} ${first.y.toFixed(1)}`;
      for (let i = 1; i < seg.length; i++) {
        d += ` L ${seg[i].x.toFixed(1)} ${seg[i].y.toFixed(1)}`;
      }
      d += ` L ${last.x.toFixed(1)} ${(PAD_TOP + PLOT_H).toFixed(1)} Z`;
      return d;
    })
    .join(" ");
});

const yTicks = $derived(() => {
  const tickCount = 4;
  const step = yMax / tickCount;
  return Array.from({ length: tickCount + 1 }, (_, i) => Math.round(yMax - i * step));
});

const xTickIndices = $derived.by(() => {
  if (matchdays.length <= 8) return matchdays.map((_, i) => i);
  // Sparsely label X for longer ranges — every Nth matchday + first/last
  const step = Math.ceil(matchdays.length / 6);
  const out = [];
  for (let i = 0; i < matchdays.length; i += step) out.push(i);
  if (out[out.length - 1] !== matchdays.length - 1) out.push(matchdays.length - 1);
  return out;
});

/**
 * @param {number | null | undefined} v
 * @returns {string}
 */
function fmtInt(v) {
  if (typeof v !== "number" || !Number.isFinite(v)) return "—";
  return new Intl.NumberFormat("de-DE").format(Math.round(v));
}
</script>

{#if !kickbaseHonorsDay || matchdays.length === 0}
  <div class="flex flex-col items-center gap-2 rounded-2xl bg-panel/40 p-8 text-center">
    <svg
      viewBox="0 0 24 24"
      class="h-8 w-8 text-muted"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12h4l3-9 4 18 3-9h4" />
    </svg>
    <p class="max-w-sm text-sm font-medium text-ink">
      Historie wird ab dem kommenden Spieltag aufgezeichnet
    </p>
    <p class="max-w-sm text-xs text-muted">
      {kickbaseHonorsDay
        ? "Noch keine Spieltage abgeschlossen."
        : "Kickbase liefert aktuell keine historischen Snapshots. Ab dem nächsten abgeschlossenen Spieltag werden die Daten in Kickwise eingesammelt."}
    </p>
  </div>
{:else}
  <div class="space-y-3">
    <!-- Legend -->
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]">
      <span class="inline-flex items-center gap-1.5">
        <span class="block h-1 w-5 rounded-full bg-accent"></span>
        <span class="font-semibold text-ink">{myUser?.name ?? "Du"}</span>
      </span>
      <span class="inline-flex items-center gap-1.5">
        <span class="block h-1 w-5 rounded-full bg-muted/60"></span>
        <span class="text-muted">Liga-Durchschnitt</span>
      </span>
      {#if leaderPath}
        <span class="inline-flex items-center gap-1.5">
          <span
            class="block h-0.5 w-5 rounded-full"
            style="background:repeating-linear-gradient(to right, rgb(var(--gold)) 0 4px, transparent 4px 7px)"
          ></span>
          <span class="text-muted">{leaderUser?.name ?? "Liga-Spitze"}</span>
        </span>
      {/if}
    </div>

    <svg
      viewBox="0 0 {VIEW_W} {VIEW_H}"
      class="h-auto w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Punkte pro Spieltag im Verlauf"
    >
      <defs>
        <linearGradient id="kw-chart-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgb(var(--accent))" stop-opacity="0.35" />
          <stop offset="100%" stop-color="rgb(var(--accent))" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- Gridlines + Y labels -->
      {#each yTicks() as v, i (i)}
        {@const y = PAD_TOP + (i / 4) * PLOT_H}
        <line
          x1={PAD_LEFT}
          x2={VIEW_W - PAD_RIGHT}
          y1={y}
          y2={y}
          stroke="rgb(var(--edge))"
          stroke-width="1"
          stroke-dasharray="2 4"
        />
        <text
          x={PAD_LEFT - 6}
          y={y + 3}
          fill="rgb(var(--muted))"
          font-size="9"
          font-family="Inter"
          text-anchor="end">{v}</text
        >
      {/each}

      <!-- User area fill -->
      {#if myAreaPath}
        <path d={myAreaPath} fill="url(#kw-chart-area)" />
      {/if}

      <!-- League average line (muted) -->
      {#if avgPath}
        <path
          d={avgPath}
          fill="none"
          stroke="rgb(var(--muted))"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          opacity="0.7"
        />
      {/if}

      <!-- Leader (gold dashed) -->
      {#if leaderPath}
        <path
          d={leaderPath}
          fill="none"
          stroke="rgb(var(--gold))"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-dasharray="4 4"
          opacity="0.85"
        />
      {/if}

      <!-- User line (primary, on top) -->
      {#if myPath}
        <path
          d={myPath}
          fill="none"
          stroke="rgb(var(--accent))"
          stroke-width="2.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <!-- Dot at each user point -->
        {#each myUser.points as p, i (i)}
          {@const y = yAt(p)}
          {#if y !== null}
            <circle
              cx={xAt(i)}
              cy={y}
              r="3"
              fill="white"
              stroke="rgb(var(--accent))"
              stroke-width="2"
            />
          {/if}
        {/each}
      {/if}

      <!-- X labels -->
      {#each xTickIndices as idx (idx)}
        <text
          x={xAt(idx)}
          y={VIEW_H - 10}
          fill="rgb(var(--muted))"
          font-size="9"
          font-family="Inter"
          text-anchor="middle">MD {matchdays[idx]}</text
        >
      {/each}
    </svg>

    <!-- Numeric summary row -->
    {#if myUser}
      {@const myValid = myUser.points.filter((v) => typeof v === "number")}
      {@const myTotal = myValid.reduce((a, b) => a + b, 0)}
      {@const myAvg = myValid.length ? myTotal / myValid.length : null}
      {@const avgValid = leagueAverage.filter((v) => typeof v === "number")}
      {@const leagueAvgOverall = avgValid.length
        ? avgValid.reduce((a, b) => a + b, 0) / avgValid.length
        : null}
      <div class="grid grid-cols-3 gap-2 rounded-xl bg-panel/40 p-3 text-center">
        <div>
          <div class="text-[10px] uppercase tracking-wider text-muted">Dein Ø</div>
          <div class="font-display text-base font-bold text-ink">{fmtInt(myAvg)}</div>
        </div>
        <div class="border-x border-edge">
          <div class="text-[10px] uppercase tracking-wider text-muted">Liga Ø</div>
          <div class="font-display text-base font-bold text-ink">{fmtInt(leagueAvgOverall)}</div>
        </div>
        <div>
          <div class="text-[10px] uppercase tracking-wider text-muted">Spieltage</div>
          <div class="font-display text-base font-bold text-ink">
            {myValid.length}<span class="text-muted">/{matchdays.length}</span>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}
