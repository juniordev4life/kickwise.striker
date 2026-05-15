<script>
  import { onMount } from "svelte";
  import MatchdayCard from "./MatchdayCard.svelte";
  import { getAllTeams } from "$services/teams.services.js";

  // performance: { seasons: [{ seasonId, title, isCurrent, matchdays: [...] }] }
  // playerTeamId: the player's current Bundesliga team id (used as fallback
  //   for H/A detection in seasons where the API doesn't pass `pt`)
  let { performance, playerTeamId } = $props();

  const seasons = $derived(performance?.seasons ?? []);

  let selectedSeasonId = $state(null);
  const selectedSeason = $derived.by(() => {
    if (!seasons.length) return null;
    if (selectedSeasonId) return seasons.find((s) => s.seasonId === selectedSeasonId) ?? null;
    return seasons.find((s) => s.isCurrent) ?? seasons.at(-1);
  });

  $effect(() => {
    if (!selectedSeasonId && seasons.length) {
      const current = seasons.find((s) => s.isCurrent) ?? seasons.at(-1);
      selectedSeasonId = current.seasonId;
    }
  });

  // Team-Lookup (logos + names) — loaded once
  let teamsById = $state({});
  onMount(async () => {
    try {
      const { teams } = await getAllTeams();
      const map = {};
      for (const t of teams) map[t.teamId] = t;
      teamsById = map;
    } catch (_err) {
      teamsById = {};
    }
  });

  // Filter state
  let homeAwayFilter = $state("all"); // "all" | "home" | "away"
  let opponentFilter = $state(""); // teamId or ""
  let onlyNextOpponent = $state(false);

  // Determine the next opponent across all seasons
  const nextOpponent = $derived.by(() => {
    for (const s of seasons) {
      for (const m of s.matchdays) {
        if (m.isUpcoming && m.matchday) {
          const isHome = String(m.homeTeamId) === String(m.playerTeamId || playerTeamId);
          const oppId = isHome ? m.awayTeamId : m.homeTeamId;
          if (oppId) return { teamId: oppId, matchday: m.matchday, season: s.title };
        }
      }
    }
    return null;
  });

  function getOpponentLogo(md) {
    const playerTid = String(md.playerTeamId || playerTeamId || "");
    const isHome = String(md.homeTeamId) === playerTid;
    const raw = isHome ? md.awayTeamLogo : md.homeTeamLogo;
    if (!raw) return null;
    return `https://kickbase.b-cdn.net/${raw}`;
  }

  function getOpponentId(md) {
    const playerTid = String(md.playerTeamId || playerTeamId || "");
    const isHome = String(md.homeTeamId) === playerTid;
    return String(isHome ? md.awayTeamId : md.homeTeamId);
  }

  function getOpponentName(md) {
    const oppId = getOpponentId(md);
    return teamsById[oppId]?.name ?? oppId ?? null;
  }

  const filteredMatchdays = $derived.by(() => {
    if (!selectedSeason) return [];
    let list = selectedSeason.matchdays;

    if (homeAwayFilter !== "all") {
      list = list.filter((md) => {
        const playerTid = String(md.playerTeamId || playerTeamId || "");
        const isHome = String(md.homeTeamId) === playerTid;
        return homeAwayFilter === "home" ? isHome : !isHome;
      });
    }

    const opp = onlyNextOpponent ? nextOpponent?.teamId : opponentFilter;
    if (opp) {
      list = list.filter((md) => getOpponentId(md) === String(opp));
    }

    return list;
  });

  // List of opponents in this season for the dropdown
  const seasonOpponents = $derived.by(() => {
    if (!selectedSeason) return [];
    const seen = new Set();
    const out = [];
    for (const md of selectedSeason.matchdays) {
      const id = getOpponentId(md);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push({ teamId: id, name: teamsById[id]?.name ?? id });
    }
    return out.sort((a, b) => a.name.localeCompare(b.name, "de"));
  });

  const maxPoints = $derived(
    filteredMatchdays.reduce((m, md) => Math.max(m, md.points ?? 0), 0)
  );

  function resetFilters() {
    homeAwayFilter = "all";
    opponentFilter = "";
    onlyNextOpponent = false;
  }

  // Stats summary for the currently visible matchdays
  const stats = $derived.by(() => {
    const played = filteredMatchdays.filter((m) => m.hasPlayed);
    return {
      games: played.length,
      goals: played.reduce((s, m) => s + m.goals, 0),
      assists: played.reduce((s, m) => s + m.assists, 0),
      total: played.reduce((s, m) => s + m.points, 0),
      avg: played.length
        ? Math.round(played.reduce((s, m) => s + m.points, 0) / played.length)
        : 0
    };
  });
</script>

{#if !seasons.length}
  <p class="rounded-md bg-slate-50 p-4 text-center text-sm text-slate-500">
    Noch keine Performance-Daten.
  </p>
{:else}
  <div class="flex flex-col gap-3">
    <!-- Season tabs -->
    <div class="flex flex-wrap gap-1">
      {#each seasons as season (season.seasonId)}
        <button
          type="button"
          onclick={() => (selectedSeasonId = season.seasonId)}
          class="rounded-md px-3 py-1 text-xs font-medium transition"
          class:bg-slate-900={selectedSeason?.seasonId === season.seasonId}
          class:text-white={selectedSeason?.seasonId === season.seasonId}
          class:bg-slate-100={selectedSeason?.seasonId !== season.seasonId}
          class:text-slate-700={selectedSeason?.seasonId !== season.seasonId}
        >
          {season.title}
          {#if season.isCurrent}
            <span class="ml-1 text-[10px] opacity-70">aktuell</span>
          {/if}
        </button>
      {/each}
    </div>

    <!-- Filter row -->
    <div class="flex flex-wrap items-end gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
      <div class="flex flex-col gap-1 text-xs">
        <span class="font-semibold uppercase tracking-wide text-slate-500">Heim / Auswärts</span>
        <div class="inline-flex overflow-hidden rounded-md border border-slate-300 bg-white">
          {#each [{ v: "all", label: "Alle" }, { v: "home", label: "Heim" }, { v: "away", label: "Auswärts" }] as opt (opt.v)}
            <button
              type="button"
              onclick={() => (homeAwayFilter = opt.v)}
              class="px-3 py-1 text-xs font-medium"
              class:bg-slate-900={homeAwayFilter === opt.v}
              class:text-white={homeAwayFilter === opt.v}
              class:text-slate-700={homeAwayFilter !== opt.v}
            >
              {opt.label}
            </button>
          {/each}
        </div>
      </div>

      <div class="flex flex-col gap-1 text-xs">
        <span class="font-semibold uppercase tracking-wide text-slate-500">Gegner</span>
        <select
          bind:value={opponentFilter}
          disabled={onlyNextOpponent}
          class="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm disabled:opacity-50"
        >
          <option value="">Alle Gegner</option>
          {#each seasonOpponents as opp (opp.teamId)}
            <option value={opp.teamId}>{opp.name}</option>
          {/each}
        </select>
      </div>

      {#if nextOpponent}
        <label class="flex items-center gap-2 text-xs">
          <input type="checkbox" bind:checked={onlyNextOpponent} class="size-4" />
          <span>
            Nur gegen <span class="font-semibold">{teamsById[nextOpponent.teamId]?.name ?? nextOpponent.teamId}</span>
            (nächster Gegner)
          </span>
        </label>
      {/if}

      <button
        type="button"
        onclick={resetFilters}
        class="ml-auto rounded-md border border-slate-300 bg-white px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
      >
        Zurücksetzen
      </button>
    </div>

    <!-- Horizontal scrollable matchday strip -->
    {#if filteredMatchdays.length === 0}
      <p class="rounded-md bg-slate-50 p-4 text-center text-sm text-slate-500">
        Keine Spieltage passen zu den Filtern.
      </p>
    {:else}
      <div class="overflow-x-auto rounded-md border border-slate-200 bg-white pb-2 pt-3 shadow-sm">
        <div class="flex gap-1 px-3">
          {#each filteredMatchdays as md, idx (md.matchday + "_" + idx)}
            <MatchdayCard
              matchday={md}
              {maxPoints}
              {playerTeamId}
              opponentLogo={getOpponentLogo(md)}
              opponentName={getOpponentName(md)}
            />
          {/each}
        </div>
      </div>
    {/if}

    <!-- Aggregated stats for the current filter -->
    <div class="flex flex-wrap gap-4 rounded-md bg-slate-50 p-3 text-xs text-slate-600">
      <div><span class="font-semibold text-slate-900">{stats.games}</span> Spiele</div>
      <div>⚽ <span class="font-semibold text-slate-900">{stats.goals}</span></div>
      <div>🅰 <span class="font-semibold text-slate-900">{stats.assists}</span></div>
      <div>Ø <span class="font-semibold text-slate-900">{stats.avg}</span> Punkte</div>
      <div>Σ <span class="font-semibold text-slate-900">{stats.total}</span></div>
    </div>
  </div>
{/if}
