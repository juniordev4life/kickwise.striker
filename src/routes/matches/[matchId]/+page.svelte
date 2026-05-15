<script>
  import { page } from "$app/state";
  import { getMatchById } from "$services/matches.services.js";
  import TeamLogo from "$components/common/TeamLogo.svelte";
  import GoalTimeline from "$components/match/GoalTimeline.svelte";
  import MatchStats from "$components/match/MatchStats.svelte";
  import Spinner from "$components/common/Spinner.svelte";
  import ErrorState from "$components/common/ErrorState.svelte";
  import { formatKickoffLong } from "$utils/date.utils.js";

  const matchId = $derived(page.params.matchId);

  let match = $state(null);
  let loading = $state(true);
  let error = $state(null);

  $effect(() => {
    load(matchId);
  });

  async function load(id) {
    loading = true;
    error = null;
    try {
      const data = await getMatchById(id);
      match = data.match;
    } catch (err) {
      error = err;
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex flex-col gap-6">
  <a
    href="/matchday"
    class="inline-flex w-fit items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
  >
    ← Zurück zum Spieltag
  </a>

  {#if loading}
    <Spinner label="Lade Spieldaten …" />
  {:else if error}
    <ErrorState message={error?.message} onRetry={() => load(matchId)} />
  {:else if !match}
    <p class="rounded-md border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
      Spiel nicht gefunden.
    </p>
  {:else}
    <!-- Header -->
    <header class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div class="text-xs uppercase tracking-wide text-slate-500">
        {match.leagueName ?? ""} · {match.matchdayName ?? `Spieltag ${match.matchday ?? "—"}`}
      </div>
      <div class="mt-1 text-xs text-slate-500">{formatKickoffLong(match.kickoffAt)}</div>

      <div class="mt-4 flex items-center justify-between gap-3">
        <a
          href="/players?teamId={match.homeTeam.teamId}"
          class="flex flex-1 flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end"
        >
          <span class="text-right font-semibold text-slate-900">{match.homeTeam.name}</span>
          <TeamLogo src={match.homeTeam.logoUrl} alt={match.homeTeam.shortName} size={48} />
        </a>

        <div class="flex w-32 flex-col items-center">
          {#if match.finalScore}
            <div class="font-mono text-3xl font-bold tabular-nums text-slate-900">
              {match.finalScore.home} : {match.finalScore.away}
            </div>
            {#if match.halfTimeScore}
              <div class="mt-1 text-xs text-slate-500">
                ({match.halfTimeScore.home} : {match.halfTimeScore.away})
              </div>
            {/if}
            {#if !match.isFinished}
              <div class="mt-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
                Läuft
              </div>
            {/if}
          {:else}
            <div class="text-base font-medium text-slate-500">vs.</div>
            <div class="mt-1 text-xs text-slate-500">Noch nicht gespielt</div>
          {/if}
        </div>

        <a
          href="/players?teamId={match.awayTeam.teamId}"
          class="flex flex-1 flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-start"
        >
          <TeamLogo src={match.awayTeam.logoUrl} alt={match.awayTeam.shortName} size={48} />
          <span class="font-semibold text-slate-900">{match.awayTeam.name}</span>
        </a>
      </div>

      {#if match.location?.city}
        <div class="mt-4 text-center text-xs text-slate-500">
          📍 {match.location.stadium ?? ""}{match.location.stadium && match.location.city ? ", " : ""}{match.location.city ?? ""}
        </div>
      {/if}
    </header>

    <!-- Goal timeline -->
    {#if match.isFinished || match.goals?.length > 0}
      <section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 class="mb-3 text-base font-semibold text-slate-900">Tor-Verlauf</h2>
        <GoalTimeline goals={match.goals ?? []} homeTeamId={match.homeTeam.teamId} />
      </section>
    {/if}

    <!-- Team stats (xG, shots, deep passes, PPDA) -->
    <section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 class="mb-3 text-base font-semibold text-slate-900">Team-Statistiken</h2>
      <MatchStats homeStats={match.homeStats} awayStats={match.awayStats} />
    </section>

    <!-- Placeholder for future stages -->
    <section class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
      <h2 class="mb-1 font-semibold text-slate-700">Mehr Statistiken kommen</h2>
      <p>
        Ballbesitz, Passquote und Aufstellungen folgen in einer weiteren Stufe aus FBref bzw.
        Kickbase.
      </p>
    </section>
  {/if}
</div>
