<script>
import { onMount } from "svelte";
import ErrorState from "$components/common/ErrorState.svelte";
import Spinner from "$components/common/Spinner.svelte";
import PlayerCard from "$components/squad/PlayerCard.svelte";
import { getMyLeagues } from "$services/league.services.js";
import { getMySquad } from "$services/squad.services.js";

let leagues = $state([]);
let selectedLeagueId = $state(null);
let squad = $state(null);
let loading = $state(true);
let error = $state(null);

const grouped = $derived.by(() => {
  if (!squad?.players) return {};
  const buckets = { GK: [], DEF: [], MID: [], FWD: [] };
  for (const player of squad.players) {
    (buckets[player.position] ?? (buckets[player.position] = [])).push(player);
  }
  return buckets;
});

onMount(async () => {
  try {
    const result = await getMyLeagues();
    leagues = result.leagues ?? [];
    if (leagues.length > 0) {
      selectedLeagueId = leagues[0].id;
    } else {
      loading = false;
    }
  } catch (err) {
    error = err;
    loading = false;
  }
});

$effect(() => {
  if (selectedLeagueId) void loadSquad(selectedLeagueId);
});

async function loadSquad(leagueId) {
  loading = true;
  error = null;
  try {
    squad = await getMySquad(leagueId);
  } catch (err) {
    error = err;
  } finally {
    loading = false;
  }
}

const groupLabels = { GK: "Tor", DEF: "Abwehr", MID: "Mittelfeld", FWD: "Sturm" };
</script>

<div class="flex flex-col gap-4">
  <header class="flex items-center justify-between">
    <h1 class="text-xl font-semibold text-slate-900">Mein Kader</h1>
    {#if leagues.length > 1}
      <label class="flex items-center gap-2 text-sm text-slate-500">
        Liga:
        <select
          class="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
          bind:value={selectedLeagueId}
        >
          {#each leagues as league (league.id)}
            <option value={league.id}>{league.name}</option>
          {/each}
        </select>
      </label>
    {/if}
  </header>

  {#if loading}
    <Spinner />
  {:else if error}
    <ErrorState message={error?.message} onRetry={() => loadSquad(selectedLeagueId)} />
  {:else if !squad}
    <p class="rounded-md border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
      Kein Kader gefunden.
    </p>
  {:else}
    <div class="flex flex-col gap-6">
      {#each ["GK", "DEF", "MID", "FWD"] as position (position)}
        {#if grouped[position]?.length}
          <section class="flex flex-col gap-2">
            <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {groupLabels[position]}
            </h2>
            <ul class="flex flex-col gap-2">
              {#each grouped[position] as player (player.playerId)}
                <li>
                  <PlayerCard {player} />
                </li>
              {/each}
            </ul>
          </section>
        {/if}
      {/each}
    </div>
  {/if}
</div>
