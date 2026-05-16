<script>
import { onMount } from "svelte";
import ErrorState from "$components/common/ErrorState.svelte";
import KickwiseLogo from "$components/common/KickwiseLogo.svelte";
import MatchCard from "$components/match/MatchCard.svelte";
import Spinner from "$components/common/Spinner.svelte";
import TeamLogo from "$components/common/TeamLogo.svelte";
import { getLeagueRanking, getMyLeagues } from "$services/league.services.js";
import { getCurrentMatchday } from "$services/matchday.services.js";
import { getCaptainCandidates } from "$services/squad.services.js";
import { authStore } from "$stores/auth.stores.svelte.js";

let season = $state("");
let matchday = $state(null);
let matches = $state([]);
let leagueId = $state(null);
let leagueName = $state(null);
let rankingEntries = $state([]);
let captainCandidates = $state([]);
let loading = $state(true);
let error = $state(null);

const userName = $derived(authStore.currentUser?.profile?.name ?? "");
const firstName = $derived(userName.split(" ")[0] ?? userName);
const userId = $derived(authStore.currentUser?.kickbaseUserId ?? authStore.currentUser?.profile?.id ?? null);

const myEntry = $derived(
  userId ? rankingEntries.find((e) => e.userId === userId) ?? null : null
);

const leagueSize = $derived(rankingEntries.length);

const avgMatchdayPoints = $derived.by(() => {
  if (!rankingEntries.length) return null;
  const values = rankingEntries
    .map((e) => Number(e.matchdayPoints ?? 0))
    .filter((v) => Number.isFinite(v));
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
});

const myMatchdayPoints = $derived(myEntry?.matchdayPoints ?? null);
const myTotalPoints = $derived(myEntry?.totalPoints ?? null);
const myRank = $derived(myEntry?.rank ?? null);
const myTeamValue = $derived(myEntry?.teamValue ?? null);
const seasonHigh = $derived(myEntry?.seasonHighPoints ?? null);

const matchdayDelta = $derived.by(() => {
  if (myMatchdayPoints === null || avgMatchdayPoints === null) return null;
  return myMatchdayPoints - avgMatchdayPoints;
});

// === Step 2 derived metrics ===

/**
 * Leader of the league (rank 1). Used for "Abstand zum 1." gap displays.
 */
const leaderEntry = $derived.by(() => {
  if (!rankingEntries.length) return null;
  return rankingEntries.find((e) => e.rank === 1) ?? rankingEntries[0];
});

const gapToLeaderTotal = $derived.by(() => {
  if (!leaderEntry || myEntry === null || myEntry === leaderEntry) return null;
  const lead = Number(leaderEntry.totalPoints ?? 0);
  const mine = Number(myEntry.totalPoints ?? 0);
  if (!Number.isFinite(lead) || !Number.isFinite(mine)) return null;
  return lead - mine;
});

const isLeader = $derived(myEntry !== null && leaderEntry !== null && myEntry === leaderEntry);

/**
 * Percentile within the league. 1 = top of the league, 100 = bottom.
 * Used to surface "Top X%" badge next to rank.
 */
const topPercent = $derived.by(() => {
  if (!myRank || !leagueSize) return null;
  return Math.max(1, Math.round((myRank / leagueSize) * 100));
});

/**
 * Delta of current matchday vs the user's own season-high. Negative = below
 * their best, positive = new high or matching, exactly 0 = matching the
 * personal best.
 */
const seasonHighDelta = $derived.by(() => {
  if (myMatchdayPoints === null || seasonHigh === null) return null;
  return myMatchdayPoints - seasonHigh;
});

const isNewSeasonHigh = $derived(
  myMatchdayPoints !== null && seasonHigh !== null && myMatchdayPoints >= seasonHigh && myMatchdayPoints > 0
);

/**
 * Sorted league members by matchdayPoints descending. Drives the "Liga-
 * Spieltag-Verteilung" bar chart so users can eyeball where they rank
 * within the league's current-MD point spread.
 */
const matchdayDistribution = $derived.by(() => {
  if (!rankingEntries.length) return [];
  return [...rankingEntries]
    .map((e) => ({
      userId: e.userId,
      name: e.name,
      points: Number(e.matchdayPoints ?? 0),
      isMe: e.userId === userId
    }))
    .sort((a, b) => b.points - a.points);
});

const matchdayDistributionMax = $derived(
  matchdayDistribution.reduce((m, e) => Math.max(m, e.points), 0) || 1
);

const myMatchdayPosition = $derived.by(() => {
  if (!matchdayDistribution.length || !userId) return null;
  const idx = matchdayDistribution.findIndex((e) => e.userId === userId);
  return idx >= 0 ? idx + 1 : null;
});

const captainPick = $derived(captainCandidates[0] ?? null);

const nextMatch = $derived.by(() => {
  if (!matches.length) return null;
  return matches.find((m) => m.status !== "finished") ?? matches[0];
});

const liveCount = $derived(
  matches.filter(
    (m) => m.status && m.status !== "finished" && m.status !== "scheduled"
  ).length
);
const finishedCount = $derived(matches.filter((m) => m.status === "finished").length);
const upcomingCount = $derived(matches.length - liveCount - finishedCount);

/**
 * @returns {string}
 */
function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Gute Nacht";
  if (h < 11) return "Guten Morgen";
  if (h < 18) return "Hi";
  return "Guten Abend";
}

/**
 * @param {number | null | undefined} v
 * @returns {string}
 */
function fmtInt(v) {
  if (v === null || v === undefined) return "—";
  return new Intl.NumberFormat("de-DE").format(Math.round(v));
}

/**
 * @param {number | null | undefined} v
 * @returns {string}
 */
function fmtEuro(v) {
  if (v === null || v === undefined) return "—";
  return `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(v / 1_000_000)}M €`;
}

/**
 * @param {number} v
 * @returns {string}
 */
function fmtGoals(v) {
  return (v ?? 0).toFixed(1);
}

/**
 * @param {string} iso
 * @returns {string}
 */
function fmtKickoff(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

async function loadDashboard() {
  loading = true;
  error = null;
  try {
    const [matchdayData, leaguesData] = await Promise.all([
      getCurrentMatchday(),
      getMyLeagues().catch(() => ({ leagues: [] }))
    ]);

    season = matchdayData.season ?? "";
    matchday = matchdayData.matchday;
    matches = matchdayData.matches ?? [];

    const league = leaguesData.leagues?.[0];
    if (league) {
      leagueId = league.id;
      leagueName = league.name ?? null;
      const [ranking, captains] = await Promise.all([
        getLeagueRanking(league.id).catch(() => ({ entries: [] })),
        getCaptainCandidates(league.id, { matchday }).catch(() => ({ candidates: [] }))
      ]);
      rankingEntries = ranking.entries ?? [];
      captainCandidates = captains.candidates ?? [];
    }
  } catch (err) {
    error = err;
  } finally {
    loading = false;
  }
}

onMount(loadDashboard);
</script>

<svelte:head>
  <title>Kickwise · Dashboard</title>
</svelte:head>

{#if loading}
  <div class="flex min-h-[60vh] items-center justify-center">
    <Spinner label="Lade Dashboard …" />
  </div>
{:else if error}
  <ErrorState
    title="Dashboard nicht geladen"
    message={error?.message}
    onRetry={loadDashboard}
  />
{:else}
  <div class="flex flex-col gap-5 md:gap-6">
    <!-- Greeting + status (full width on all sizes) -->
    <section
      class="hero-blue relative overflow-hidden rounded-3xl p-5 text-white shadow-card md:p-8"
    >
      <div class="pattern-dots pointer-events-none absolute inset-0 opacity-25"></div>

      <div class="relative flex items-start justify-between gap-4">
        <div class="min-w-0">
          <div
            class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#23C6D1]"
          >
            {#if liveCount > 0}
              <span class="live-dot inline-block h-1.5 w-1.5 rounded-full bg-[#23C6D1]"></span>
              Spieltag {matchday} · live
            {:else if finishedCount === matches.length && matches.length > 0}
              Spieltag {matchday} · beendet
            {:else}
              Spieltag {matchday} · {season}
            {/if}
          </div>
          <h1 class="mt-2 font-display text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
            {greeting()}{firstName ? `, ${firstName}` : ""}
          </h1>
          <p class="mt-1 max-w-md text-sm text-white/70">
            {#if upcomingCount > 0}
              {upcomingCount}
              {upcomingCount === 1 ? "Spiel kommt noch" : "Spiele kommen noch"} —
              Captain-Tipps stehen bereit.
            {:else if finishedCount === matches.length && matches.length > 0}
              Alle Spiele beendet. Schau dir Ergebnisse, Trends und nächste Picks an.
            {:else}
              Dein Spieltag-Cockpit: Punkte, Rang &amp; Prognosen auf einen Blick.
            {/if}
          </p>
          {#if leagueName}
            <div class="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/85">
              <svg viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M8 21h8M12 17v4M17 5h3v3a5 5 0 01-5 5h-1M7 5H4v3a5 5 0 005 5h1M7 3h10v6a5 5 0 01-10 0z" />
              </svg>
              {leagueName}
            </div>
          {/if}
        </div>

        <KickwiseLogo
          variant="badge"
          class="h-16 w-16 shrink-0 drop-shadow-[0_8px_20px_rgba(35,198,209,0.35)] sm:h-20 sm:w-20 md:h-24 md:w-24"
        />
      </div>
    </section>

    <!-- KPI grid: 2 cols mobile, 4 cols desktop -->
    <section class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      <!-- Matchday points (real, with delta vs league avg) -->
      <article class="rounded-2xl border border-edge bg-surface p-4 shadow-card md:p-5">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-medium text-muted">Spieltag-Punkte</span>
          <span
            class="flex h-6 w-6 items-center justify-center rounded-md bg-gold/15 text-gold md:h-7 md:w-7"
          >
            <svg viewBox="0 0 24 24" class="h-3 w-3 md:h-3.5 md:w-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M13 2L3 14h9l-1 8 10-12h-9z" />
            </svg>
          </span>
        </div>
        <div class="mt-2 flex items-baseline gap-1.5">
          <span class="font-display text-2xl font-bold text-ink md:text-3xl">
            {fmtInt(myMatchdayPoints)}
          </span>
          {#if matchdayDelta !== null}
            <span
              class="flex items-center text-xs font-semibold"
              class:text-secondary={matchdayDelta >= 0}
              class:text-danger={matchdayDelta < 0}
            >
              <svg viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                {#if matchdayDelta >= 0}
                  <path d="M12 19V5M5 12l7-7 7 7" />
                {:else}
                  <path d="M12 5v14M5 12l7 7 7-7" />
                {/if}
              </svg>
              {matchdayDelta >= 0 ? "+" : ""}{fmtInt(matchdayDelta)}
            </span>
          {/if}
        </div>
        <div class="mt-0.5 text-[10px] text-muted">
          {#if isNewSeasonHigh}
            <span class="font-semibold text-gold">🎉 Neues Saison-Hoch!</span>
          {:else if seasonHighDelta !== null && seasonHigh}
            {Math.abs(Math.round(seasonHighDelta))} Pkt. unter Hoch ({fmtInt(seasonHigh)})
          {:else if avgMatchdayPoints !== null}
            Liga-Ø {fmtInt(avgMatchdayPoints)}
          {:else}
            Kein Ranking verfügbar
          {/if}
        </div>
      </article>

      <!-- League rank (real) -->
      <article class="rounded-2xl border border-edge bg-surface p-4 shadow-card md:p-5">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-medium text-muted">Liga-Rang</span>
          <span
            class="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary md:h-7 md:w-7"
          >
            <svg viewBox="0 0 24 24" class="h-3 w-3 md:h-3.5 md:w-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M8 21h8M12 17v4M17 5h3v3a5 5 0 01-5 5h-1M7 5H4v3a5 5 0 005 5h1M7 3h10v6a5 5 0 01-10 0z" />
            </svg>
          </span>
        </div>
        <div class="mt-2 flex items-baseline gap-1.5">
          <span class="font-display text-2xl font-bold text-ink md:text-3xl">
            {myRank ? `#${myRank}` : "—"}
          </span>
          {#if topPercent !== null}
            <span
              class="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
              class:bg-gold={isLeader || topPercent <= 10}
              class:text-white={isLeader || topPercent <= 10}
              class:bg-secondary={!isLeader && topPercent > 10 && topPercent <= 33}
              class:bg-panel={topPercent > 33}
              class:text-muted={topPercent > 33}
            >
              {isLeader ? "👑 #1" : `Top ${topPercent}%`}
            </span>
          {/if}
        </div>
        <div class="mt-0.5 text-[10px] text-muted">
          {leagueSize ? `von ${leagueSize} Managern` : "Keine Liga gefunden"}
        </div>
      </article>

      <!-- Team value (real) -->
      <article class="rounded-2xl border border-edge bg-surface p-4 shadow-card md:p-5">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-medium text-muted">Kaderwert</span>
          <span
            class="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10 text-accent md:h-7 md:w-7"
          >
            <svg viewBox="0 0 24 24" class="h-3 w-3 md:h-3.5 md:w-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          </span>
        </div>
        <div class="mt-2 flex items-baseline gap-1">
          <span class="font-display text-2xl font-bold text-ink md:text-3xl">
            {fmtEuro(myTeamValue)}
          </span>
        </div>
        <div class="mt-0.5 text-[10px] text-muted">
          {#if isLeader}
            <span class="font-semibold text-gold">Du führst die Liga an 👑</span>
          {:else if gapToLeaderTotal !== null}
            −{fmtInt(gapToLeaderTotal)} zum 1.
            {#if myTotalPoints !== null}
              · {fmtInt(myTotalPoints)} Pkt.
            {/if}
          {:else if myTotalPoints !== null}
            {fmtInt(myTotalPoints)} Saison-Punkte
          {:else}
            —
          {/if}
        </div>
      </article>

      <!-- Captain expected (real, ×2) -->
      <article class="rounded-2xl border border-edge bg-surface p-4 shadow-card md:p-5">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-medium text-muted">Captain ×2</span>
          <span
            class="flex h-6 w-6 items-center justify-center rounded-md bg-secondary/15 text-secondary md:h-7 md:w-7"
          >
            <svg viewBox="0 0 24 24" class="h-3 w-3 md:h-3.5 md:w-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </span>
        </div>
        <div class="mt-2 flex items-baseline gap-1.5">
          <span class="font-display text-2xl font-bold text-ink md:text-3xl">
            {captainPick ? fmtInt(captainPick.expectedPoints * 2) : "—"}
          </span>
        </div>
        <div class="mt-0.5 truncate text-[10px] text-muted">
          {captainPick ? captainPick.name : "Keine Empfehlung"}
        </div>
      </article>
    </section>

    <!-- Liga-Spieltag-Verteilung: sorted bars for every league member -->
    <section class="rounded-3xl border border-edge bg-surface p-5 shadow-card md:p-6">
      <header class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div class="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Liga-Verteilung
          </div>
          <h2 class="font-display text-lg font-bold text-ink md:text-xl">
            Spieltag {matchday} · Wer hat wie viel?
          </h2>
        </div>
        {#if myMatchdayPosition !== null && matchdayDistribution.length > 1}
          <span class="chip chip-cyan">
            #{myMatchdayPosition} von {matchdayDistribution.length} am Spieltag
          </span>
        {/if}
      </header>

      {#if matchdayDistribution.length === 0}
        <p class="rounded-xl bg-panel/40 p-4 text-center text-sm text-muted">
          Keine Ligadaten verfügbar — verbinde dich mit einer Kickbase-Liga, um deine
          Trends zu sehen.
        </p>
      {:else}
        <!-- Mini-legend -->
        <div class="mb-3 flex flex-wrap items-center gap-3 text-[10px] text-muted">
          <span class="inline-flex items-center gap-1.5">
            <span class="block h-2.5 w-4 rounded bg-gradient-to-r from-accent to-secondary"></span>
            Du
          </span>
          <span class="inline-flex items-center gap-1.5">
            <span class="block h-2.5 w-4 rounded bg-edge"></span>
            Liga
          </span>
          <span class="inline-flex items-center gap-1.5">
            <span class="block h-2.5 w-4 rounded bg-gold/70"></span>
            Spieltags-Top
          </span>
        </div>

        <ol class="flex flex-col gap-1.5">
          {#each matchdayDistribution as entry, i (entry.userId)}
            {@const width = Math.max(2, (entry.points / matchdayDistributionMax) * 100)}
            {@const isTop = i === 0 && entry.points > 0}
            <li
              class="grid grid-cols-[24px_minmax(0,1fr)_56px] items-center gap-2 rounded-lg px-2 py-1 transition"
              class:bg-primary={entry.isMe}
              class:text-white={entry.isMe}
            >
              <span
                class="font-mono text-[10px] tabular-nums"
                class:text-white={entry.isMe}
                class:text-muted={!entry.isMe}
              >
                #{i + 1}
              </span>
              <div class="min-w-0">
                <div
                  class="truncate text-[11px] font-medium leading-tight"
                  class:text-white={entry.isMe}
                  class:text-ink={!entry.isMe}
                >
                  {entry.name || "Manager"}{entry.isMe ? " (Du)" : ""}
                </div>
                <div class="mt-1 h-2 overflow-hidden rounded-full"
                  class:bg-white={entry.isMe}
                  class:bg-opacity-20={entry.isMe}
                  class:bg-panel={!entry.isMe}
                  style={entry.isMe ? "background:rgba(255,255,255,0.18)" : ""}
                >
                  <div
                    class="h-full rounded-full transition-all"
                    class:bg-gradient-to-r={entry.isMe}
                    class:from-secondary={entry.isMe}
                    class:to-white={entry.isMe}
                    class:bg-gold={isTop && !entry.isMe}
                    style={!entry.isMe && !isTop ? `width: ${width}%; background: rgb(var(--muted) / 0.45)` : `width: ${width}%`}
                  ></div>
                </div>
              </div>
              <span
                class="text-right font-mono text-xs font-semibold tabular-nums"
                class:text-white={entry.isMe}
                class:text-ink={!entry.isMe}
              >
                {fmtInt(entry.points)}
              </span>
            </li>
          {/each}
        </ol>

        <p class="mt-4 rounded-xl bg-panel/40 p-3 text-center text-[11px] text-muted">
          Verlaufs-Chart über alle Spieltage folgt in Schritt 3 — dafür braucht es einen
          neuen Backend-Endpoint, der die historische Punktverteilung pro Spieltag liefert.
        </p>
      {/if}
    </section>

    <!-- Two-column on desktop: left main, right side -->
    <div class="grid gap-5 md:grid-cols-12 md:gap-6">
      <!-- Left main column -->
      <div class="flex flex-col gap-5 md:col-span-8 md:gap-6">
        <!-- Next match -->
        {#if nextMatch}
          <section class="rounded-3xl border border-edge bg-surface p-4 shadow-card md:p-6">
            <header class="mb-3 flex items-center justify-between">
              <span class="chip chip-cyan">
                {nextMatch.status === "finished" ? "Letztes Spiel" : "Nächstes Spiel"}
              </span>
              {#if nextMatch.kickoff_at}
                <span class="text-[11px] text-muted">{fmtKickoff(nextMatch.kickoff_at)}</span>
              {/if}
            </header>

            <a href="/matches/{nextMatch.match_id}" class="block">
              <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <div class="flex flex-col items-center gap-1.5">
                  <TeamLogo
                    src={nextMatch.home_logo_url}
                    alt={nextMatch.home_team_short ?? nextMatch.home_team_name}
                  />
                  <span class="text-center text-[11px] font-semibold text-ink md:text-sm">
                    {nextMatch.home_team_short ?? nextMatch.home_team_name}
                  </span>
                </div>

                <div class="text-center">
                  {#if nextMatch.status === "finished"}
                    <div class="font-display text-3xl font-bold text-ink md:text-5xl">
                      {nextMatch.home_score}<span class="text-muted"> : </span>{nextMatch.away_score}
                    </div>
                    <div class="mt-1 text-[10px] uppercase tracking-wider text-muted">Endstand</div>
                  {:else if nextMatch.prediction}
                    <div class="font-display text-2xl font-bold text-ink md:text-4xl">
                      {fmtGoals(nextMatch.prediction.expectedHomeGoals)}
                      <span class="text-muted">·</span>
                      {fmtGoals(nextMatch.prediction.expectedAwayGoals)}
                    </div>
                    <div class="mt-1 text-[10px] uppercase tracking-wider text-muted">
                      Prognose
                    </div>
                  {:else}
                    <div class="font-display text-2xl font-bold text-muted">vs.</div>
                  {/if}
                </div>

                <div class="flex flex-col items-center gap-1.5">
                  <TeamLogo
                    src={nextMatch.away_logo_url}
                    alt={nextMatch.away_team_short ?? nextMatch.away_team_name}
                  />
                  <span class="text-center text-[11px] font-semibold text-ink md:text-sm">
                    {nextMatch.away_team_short ?? nextMatch.away_team_name}
                  </span>
                </div>
              </div>

              {#if nextMatch.prediction && nextMatch.status !== "finished"}
                {@const p = nextMatch.prediction}
                {@const total = (p.probHomeWin ?? 0) + (p.probDraw ?? 0) + (p.probAwayWin ?? 0) || 1}
                {@const hPct = ((p.probHomeWin ?? 0) / total) * 100}
                {@const dPct = ((p.probDraw ?? 0) / total) * 100}
                {@const aPct = ((p.probAwayWin ?? 0) / total) * 100}
                <div class="mt-4">
                  <div class="mb-1.5 flex justify-between text-[10px] text-muted">
                    <span>Heim {Math.round(hPct)}%</span>
                    <span>U {Math.round(dPct)}%</span>
                    <span>{Math.round(aPct)}% Gast</span>
                  </div>
                  <div class="flex h-2 overflow-hidden rounded-full bg-edge">
                    <span style="width:{hPct}%" class="bg-accent"></span>
                    <span style="width:{dPct}%" class="bg-muted/40"></span>
                    <span style="width:{aPct}%" class="bg-gold"></span>
                  </div>
                  {#if p.modelVersion}
                    <div class="mt-2 text-center text-[10px] text-muted">
                      Modell {p.modelVersion}
                    </div>
                  {/if}
                </div>
              {/if}
            </a>
          </section>
        {/if}

        <!-- All fixtures -->
        {#if matches.length > 0}
          <section>
            <header class="mb-3 flex items-center justify-between">
              <div>
                <div class="text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Alle Begegnungen
                </div>
                <h2 class="font-display text-lg font-bold text-ink md:text-xl">
                  Spieltag {matchday}
                </h2>
              </div>
              <a
                href="/matchday/{matchday}"
                class="text-xs font-semibold text-accent transition hover:text-primary"
              >
                Detailansicht →
              </a>
            </header>
            <ul class="flex flex-col gap-2">
              {#each matches as match (match.match_id)}
                <li>
                  <MatchCard {match} />
                </li>
              {/each}
            </ul>
          </section>
        {/if}
      </div>

      <!-- Right side column -->
      <div class="flex flex-col gap-5 md:col-span-4 md:gap-6">
        <!-- Captain candidates list -->
        {#if captainCandidates.length > 0}
          <section class="rounded-3xl border border-edge bg-surface p-4 shadow-card md:p-5">
            <header class="mb-3 flex items-center justify-between">
              <div>
                <div class="text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Captain-Tipps
                </div>
                <h2 class="font-display text-base font-bold text-ink md:text-lg">
                  Top {captainCandidates.length} · Spieltag {matchday}
                </h2>
              </div>
              <span class="chip chip-gold">×2 Pkt</span>
            </header>

            <ol class="flex flex-col gap-2">
              {#each captainCandidates as c, i (c.playerId)}
                <li
                  class="flex items-center gap-2.5 rounded-2xl border border-edge bg-panel/40 px-2.5 py-2"
                >
                  <span
                    class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                    class:bg-gold={i === 0}
                    class:text-white={i === 0}
                    class:bg-edge={i !== 0}
                    class:text-muted={i !== 0}
                  >
                    {i + 1}
                  </span>
                  {#if c.imageUrl}
                    <img
                      src="https://kickbase.b-cdn.net/{c.imageUrl}"
                      alt={c.name}
                      class="h-8 w-8 rounded-full bg-panel object-cover ring-1 ring-edge"
                      loading="lazy"
                    />
                  {/if}
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-[13px] font-semibold text-ink">{c.name}</div>
                    <div class="text-[10px] text-muted">
                      {c.position}
                      {#if c.isHome !== null && c.opponentTeamId}
                        · {c.isHome ? "vs" : "@"} {c.opponentTeamId}
                      {/if}
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-display text-sm font-bold tabular-nums text-ink">
                      {fmtInt(c.expectedPoints)}
                    </div>
                    <div class="text-[9px] font-semibold uppercase tracking-wider text-gold">
                      ×2 = {fmtInt(c.expectedPoints * 2)}
                    </div>
                  </div>
                </li>
              {/each}
            </ol>
          </section>
        {/if}

        <!-- League mini-table (top 5 by rank) -->
        {#if rankingEntries.length > 0}
          <section class="rounded-3xl border border-edge bg-surface p-4 shadow-card md:p-5">
            <header class="mb-3 flex items-center justify-between">
              <div>
                <div class="text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Liga-Ranking
                </div>
                <h2 class="font-display text-base font-bold text-ink md:text-lg">
                  Top 5
                </h2>
              </div>
              <a
                href="/league"
                class="text-xs font-semibold text-accent transition hover:text-primary"
              >
                Alle →
              </a>
            </header>
            <ul class="flex flex-col gap-1.5">
              {#each rankingEntries.slice(0, 5) as entry (entry.userId)}
                {@const isMe = entry.userId === userId}
                <li
                  class="flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm"
                  class:bg-primary={isMe}
                  class:text-white={isMe}
                  class:bg-panel={!isMe}
                  class:text-ink={!isMe}
                >
                  <span
                    class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold tabular-nums"
                    class:bg-gold={isMe}
                    class:text-white={isMe}
                    class:bg-edge={!isMe}
                    class:text-muted={!isMe}
                  >
                    {entry.rank}
                  </span>
                  <span class="min-w-0 flex-1 truncate text-[13px] font-medium">
                    {entry.name || "Manager"}
                  </span>
                  <span class="font-mono text-[12px] tabular-nums">
                    {fmtInt(entry.totalPoints)}
                  </span>
                </li>
              {/each}
            </ul>
          </section>
        {/if}
      </div>
    </div>
  </div>
{/if}
