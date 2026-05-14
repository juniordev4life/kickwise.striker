<script>
import { onMount } from "svelte";
import ErrorState from "$components/common/ErrorState.svelte";
import Spinner from "$components/common/Spinner.svelte";
import LeagueTable from "$components/league/LeagueTable.svelte";
import { getLeagueRanking, getMyLeagues } from "$services/league.services.js";

let leagues = $state([]);
let selectedLeagueId = $state(null);
let ranking = $state(null);
let loading = $state(true);
let error = $state(null);

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
  if (selectedLeagueId) {
    void loadRanking(selectedLeagueId);
  }
});

async function loadRanking(leagueId) {
  loading = true;
  error = null;
  try {
    ranking = await getLeagueRanking(leagueId);
  } catch (err) {
    error = err;
  } finally {
    loading = false;
  }
}
</script>

<div class="flex flex-col gap-4">
  <header class="flex items-center justify-between">
    <h1 class="text-xl font-semibold text-slate-900">Liga-Tabelle</h1>
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
    <ErrorState message={error?.message} onRetry={() => loadRanking(selectedLeagueId)} />
  {:else if leagues.length === 0}
    <p class="rounded-md border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
      Du bist (noch) in keiner Kickbase-Liga.
    </p>
  {:else}
    <LeagueTable entries={ranking?.entries ?? []} />
  {/if}
</div>
