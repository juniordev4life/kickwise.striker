<script>
import { onMount } from "svelte";
import ErrorState from "$components/common/ErrorState.svelte";
import KickwiseLogo from "$components/common/KickwiseLogo.svelte";
import MatchCard from "$components/match/MatchCard.svelte";
import Spinner from "$components/common/Spinner.svelte";
import TeamLogo from "$components/common/TeamLogo.svelte";
import { getMyLeagues } from "$services/league.services.js";
import { getCurrentMatchday } from "$services/matchday.services.js";
import { getCaptainCandidates } from "$services/squad.services.js";
import { authStore } from "$stores/auth.stores.svelte.js";

let season = $state("");
let matchday = $state(null);
let matches = $state([]);
let captainCandidates = $state([]);
let leagueId = $state(null);
let loading = $state(true);
let loadingCaptain = $state(false);
let error = $state(null);

const userName = $derived(authStore.currentUser?.profile?.name ?? "");
const firstName = $derived(userName.split(" ")[0] ?? userName);

/**
 * The first kicked-off-but-not-finished or upcoming match — used for the
 * "next match" hero. Falls back to the first finished match so the card is
 * never empty when a matchday has fully concluded.
 */
const nextMatch = $derived.by(() => {
  if (!matches.length) return null;
  const upcoming = matches.find((m) => m.status !== "finished");
  return upcoming ?? matches[0];
});

const captainPick = $derived(captainCandidates[0] ?? null);

const liveCount = $derived(
  matches.filter(
    (m) => m.status && m.status !== "finished" && m.status !== "scheduled"
  ).length
);

const finishedCount = $derived(matches.filter((m) => m.status === "finished").length);
const upcomingCount = $derived(matches.length - liveCount - finishedCount);

/**
 * Greeting that flexes with the user's local hour.
 *
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
 * @param {number} v
 * @returns {string}
 */
function fmtGoals(v) {
  return (v ?? 0).toFixed(1);
}

/**
 * @param {number} v
 * @returns {number}
 */
function fmtPoints(v) {
  return Math.round(v ?? 0);
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
    const data = await getCurrentMatchday();
    season = data.season ?? "";
    matchday = data.matchday;
    matches = data.matches ?? [];
  } catch (err) {
    error = err;
  } finally {
    loading = false;
  }
}

async function loadCaptainCandidates() {
  if (!leagueId || !matchday) return;
  loadingCaptain = true;
  try {
    const r = await getCaptainCandidates(leagueId, { matchday });
    captainCandidates = r.candidates ?? [];
  } catch {
    captainCandidates = [];
  } finally {
    loadingCaptain = false;
  }
}

onMount(async () => {
  await loadDashboard();
  try {
    const r = await getMyLeagues();
    leagueId = r.leagues?.[0]?.id ?? null;
    if (leagueId) await loadCaptainCandidates();
  } catch {
    /* league lookup is optional, dashboard works without it */
  }
});
</script>

<svelte:head>
  <title>Kickwise · Spieltag</title>
</svelte:head>

{#if loading}
  <div class="flex min-h-[60vh] items-center justify-center">
    <Spinner label="Lade Spieltag …" />
  </div>
{:else if error}
  <ErrorState
    title="Spieltag nicht geladen"
    message={error?.message}
    onRetry={loadDashboard}
  />
{:else}
  <div class="flex flex-col gap-5">
    <!-- Hero -->
    <section
      class="hero-blue relative overflow-hidden rounded-3xl p-5 text-white shadow-card sm:p-7"
    >
      <div class="pattern-dots pointer-events-none absolute inset-0 opacity-25"></div>

      <div class="relative flex items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#23C6D1]">
            {#if liveCount > 0}
              <span class="live-dot inline-block h-1.5 w-1.5 rounded-full bg-[#23C6D1]"></span>
              Spieltag {matchday} · live
            {:else if finishedCount === matches.length && matches.length > 0}
              Spieltag {matchday} · beendet
            {:else}
              Spieltag {matchday} · {season}
            {/if}
          </div>
          <h1 class="mt-2 font-display text-2xl font-bold leading-tight sm:text-3xl">
            {greeting()}{firstName ? `, ${firstName}` : ""}
          </h1>
          <p class="mt-1 max-w-sm text-sm text-white/70">
            {#if upcomingCount > 0}
              {upcomingCount}
              {upcomingCount === 1 ? "Spiel kommt noch" : "Spiele kommen noch"} —
              Captain-Tipps stehen bereit.
            {:else if finishedCount === matches.length && matches.length > 0}
              Alle Spiele beendet. Schau dir die Ergebnisse an oder spring zum nächsten
              Spieltag.
            {:else}
              Spieltag-Übersicht, Captain-Picks und Prognosen auf einen Blick.
            {/if}
          </p>
        </div>

        <KickwiseLogo
          variant="badge"
          class="h-16 w-16 shrink-0 drop-shadow-[0_8px_20px_rgba(35,198,209,0.35)] sm:h-20 sm:w-20"
        />
      </div>

      <!-- Captain pick (real data, only if available) -->
      {#if captainPick}
        <div class="relative mt-5 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
          <span
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#C9A64B]/25 text-[#C9A64B] ring-1 ring-[#C9A64B]/40"
          >
            <svg
              viewBox="0 0 24 24"
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M8 21h8M12 17v4M17 5h3v3a5 5 0 01-5 5h-1M7 5H4v3a5 5 0 005 5h1M7 3h10v6a5 5 0 01-10 0z" />
            </svg>
          </span>
          <div class="min-w-0 flex-1">
            <div class="text-[10px] font-semibold uppercase tracking-wider text-[#C9A64B]">
              Captain-Tipp
            </div>
            <div class="truncate font-display text-base font-bold">{captainPick.name}</div>
            <div class="text-[11px] text-white/60">
              {captainPick.position}
              {#if captainPick.isHome !== null && captainPick.opponentTeamId}
                · {captainPick.isHome ? "vs" : "@"} {captainPick.opponentTeamId}
              {/if}
            </div>
          </div>
          <div class="text-right">
            <div class="font-display text-2xl font-bold leading-none text-[#C9A64B]">
              {fmtPoints(captainPick.expectedPoints * 2)}
            </div>
            <div class="text-[10px] text-white/60">×2 Punkte</div>
          </div>
        </div>
      {/if}

      <!-- Quick stats -->
      <div class="relative mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div class="rounded-xl bg-white/10 px-2 py-2 backdrop-blur">
          <div class="font-display text-lg font-bold leading-none">{matches.length}</div>
          <div class="mt-0.5 text-[10px] text-white/60">Spiele</div>
        </div>
        <div class="rounded-xl bg-white/10 px-2 py-2 backdrop-blur">
          <div class="font-display text-lg font-bold leading-none text-[#23C6D1]">
            {liveCount + upcomingCount}
          </div>
          <div class="mt-0.5 text-[10px] text-white/60">offen</div>
        </div>
        <div class="rounded-xl bg-white/10 px-2 py-2 backdrop-blur">
          <div class="font-display text-lg font-bold leading-none">{finishedCount}</div>
          <div class="mt-0.5 text-[10px] text-white/60">beendet</div>
        </div>
      </div>
    </section>

    <!-- Quick actions -->
    <section class="grid grid-cols-3 gap-2">
      <a
        href="/squad"
        class="flex flex-col items-center gap-1.5 rounded-2xl border border-edge bg-surface p-3 transition hover:border-accent/40 hover:shadow-card"
      >
        <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
          </svg>
        </span>
        <span class="text-[11px] font-medium text-ink">Kader</span>
      </a>
      <a
        href="/players"
        class="flex flex-col items-center gap-1.5 rounded-2xl border border-edge bg-surface p-3 transition hover:border-accent/40 hover:shadow-card"
      >
        <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 21l-4.35-4.35M16 10a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
        </span>
        <span class="text-[11px] font-medium text-ink">Spieler</span>
      </a>
      <a
        href="/table"
        class="flex flex-col items-center gap-1.5 rounded-2xl border border-edge bg-surface p-3 transition hover:border-accent/40 hover:shadow-card"
      >
        <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </span>
        <span class="text-[11px] font-medium text-ink">Tabelle</span>
      </a>
    </section>

    <!-- Next match -->
    {#if nextMatch}
      <section class="rounded-3xl border border-edge bg-surface p-4 shadow-card sm:p-5">
        <header class="mb-3 flex items-center justify-between">
          <span class="chip chip-cyan">
            {nextMatch.status === "finished" ? "Letztes Spiel" : "Nächstes Spiel"}
          </span>
          {#if nextMatch.kickoff_at}
            <span class="text-[11px] text-muted">{fmtKickoff(nextMatch.kickoff_at)}</span>
          {/if}
        </header>

        <a
          href="/matches/{nextMatch.match_id}"
          class="block"
          aria-label="Zur Spieldetail-Ansicht"
        >
          <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div class="flex flex-col items-center gap-1.5">
              <TeamLogo
                src={nextMatch.home_logo_url}
                alt={nextMatch.home_team_short ?? nextMatch.home_team_name}
              />
              <span class="text-center text-[11px] font-semibold text-ink">
                {nextMatch.home_team_short ?? nextMatch.home_team_name}
              </span>
            </div>

            <div class="text-center">
              {#if nextMatch.status === "finished"}
                <div class="font-display text-3xl font-bold text-ink sm:text-4xl">
                  {nextMatch.home_score} <span class="text-muted">:</span>
                  {nextMatch.away_score}
                </div>
                <div class="mt-1 text-[10px] uppercase tracking-wider text-muted">Endstand</div>
              {:else if nextMatch.prediction}
                <div class="font-display text-2xl font-bold text-ink sm:text-3xl">
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
              <span class="text-center text-[11px] font-semibold text-ink">
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
                <span>{Math.round(hPct)}%</span>
                <span>{Math.round(dPct)}% U</span>
                <span>{Math.round(aPct)}%</span>
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

    <!-- Captain candidates list (real data via getCaptainCandidates) -->
    {#if captainCandidates.length > 1}
      <section class="rounded-3xl border border-edge bg-surface p-4 shadow-card sm:p-5">
        <header class="mb-3 flex items-center justify-between">
          <div>
            <div class="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Captain-Kandidaten
            </div>
            <h2 class="font-display text-lg font-bold text-ink">Top {captainCandidates.length} für Spieltag {matchday}</h2>
          </div>
          <span class="chip chip-gold">×2 Punkte</span>
        </header>

        <ol class="flex flex-col gap-2">
          {#each captainCandidates as c, i (c.playerId)}
            <li
              class="flex items-center gap-3 rounded-2xl border border-edge bg-panel/40 px-3 py-2.5"
            >
              <span
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
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
                  class="h-9 w-9 rounded-full bg-panel object-cover ring-1 ring-edge"
                  loading="lazy"
                />
              {/if}
              <div class="min-w-0 flex-1">
                <div class="truncate text-sm font-semibold text-ink">{c.name}</div>
                <div class="text-[11px] text-muted">
                  {c.position}
                  {#if c.isHome !== null && c.opponentTeamId}
                    · {c.isHome ? "vs" : "@"} {c.opponentTeamId}
                  {/if}
                </div>
              </div>
              <div class="text-right">
                <div class="font-display text-base font-bold tabular-nums text-ink">
                  {fmtPoints(c.expectedPoints)}
                </div>
                <div class="text-[10px] font-semibold uppercase tracking-wider text-gold">
                  ×2 = {fmtPoints(c.expectedPoints * 2)}
                </div>
              </div>
            </li>
          {/each}
        </ol>
      </section>
    {:else if loadingCaptain}
      <div class="rounded-3xl border border-edge bg-surface p-4 text-center text-sm text-muted">
        Lade Captain-Kandidaten …
      </div>
    {/if}

    <!-- All fixtures -->
    {#if matches.length > 0}
      <section>
        <header class="mb-3 flex items-center justify-between">
          <div>
            <div class="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Alle Begegnungen
            </div>
            <h2 class="font-display text-lg font-bold text-ink">Spieltag {matchday}</h2>
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
    {:else}
      <section
        class="rounded-3xl border border-edge bg-surface p-6 text-center text-sm text-muted"
      >
        Keine Spiele für Spieltag {matchday} — vielleicht hat der Scout noch nicht gelaufen.
      </section>
    {/if}
  </div>
{/if}
