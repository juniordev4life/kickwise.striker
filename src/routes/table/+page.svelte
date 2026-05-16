<script>
import { onMount } from "svelte";
import ErrorState from "$components/common/ErrorState.svelte";
import Spinner from "$components/common/Spinner.svelte";
import TeamLogo from "$components/common/TeamLogo.svelte";
import { getBundesligaTable } from "$services/table.services.js";

let teams = $state([]);
let loading = $state(true);
let error = $state(null);

onMount(load);

async function load() {
  loading = true;
  error = null;
  try {
    const result = await getBundesligaTable();
    teams = (result.teams ?? []).slice().sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
  } catch (err) {
    error = err;
  } finally {
    loading = false;
  }
}

function rankClass(rank) {
  if (rank == null) return "";
  if (rank <= 4) return "border-l-4 border-l-emerald-500";
  if (rank <= 6) return "border-l-4 border-l-sky-400";
  if (rank === 7) return "border-l-4 border-l-amber-400";
  if (rank >= 16) return "border-l-4 border-l-red-500";
  return "";
}
</script>

<div class="flex flex-col gap-4">
  <h1 class="text-xl font-semibold text-slate-900">1. Bundesliga – Tabelle</h1>

  {#if loading}
    <Spinner label="Lade Tabelle …" />
  {:else if error}
    <ErrorState message={error?.message} onRetry={load} />
  {:else if teams.length === 0}
    <p class="rounded-md border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
      Keine Tabellendaten verfügbar.
    </p>
  {:else}
    <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table class="w-full text-sm">
        <thead class="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th class="w-10 px-3 py-2 text-right font-medium">#</th>
            <th class="px-2 py-2 text-left font-medium">Verein</th>
            <th class="w-10 px-2 py-2 text-right font-medium">Sp</th>
            <th class="w-12 px-2 py-2 text-right font-medium">Diff</th>
            <th class="w-12 px-3 py-2 text-right font-medium">Pkt</th>
          </tr>
        </thead>
        <tbody>
          {#each teams as team (team.teamId)}
            <tr class="border-b border-slate-100 last:border-0 hover:bg-slate-50 {rankClass(team.rank)}">
              <td class="px-3 py-2 text-right font-mono font-medium text-slate-700 tabular-nums">
                {team.rank ?? "—"}
              </td>
              <td class="px-2 py-2">
                <div class="flex items-center gap-2">
                  <TeamLogo src={team.logoUrl} alt={team.name} size={24} />
                  <span class="text-slate-900">{team.name}</span>
                </div>
              </td>
              <td class="px-2 py-2 text-right font-mono text-slate-700 tabular-nums">
                {team.matchesPlayed ?? "—"}
              </td>
              <td class="px-2 py-2 text-right font-mono tabular-nums" class:text-emerald-700={team.goalDifference > 0} class:text-red-600={team.goalDifference < 0} class:text-slate-700={team.goalDifference === 0}>
                {team.goalDifference > 0 ? "+" : ""}{team.goalDifference ?? "—"}
              </td>
              <td class="px-3 py-2 text-right font-mono font-semibold text-slate-900 tabular-nums">
                {team.seasonPoints ?? "—"}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="flex flex-wrap gap-4 text-xs text-slate-500">
      <span class="flex items-center gap-1.5"><span class="inline-block size-2.5 rounded-sm bg-emerald-500"></span> Champions League</span>
      <span class="flex items-center gap-1.5"><span class="inline-block size-2.5 rounded-sm bg-sky-400"></span> Europa League</span>
      <span class="flex items-center gap-1.5"><span class="inline-block size-2.5 rounded-sm bg-amber-400"></span> Conference League</span>
      <span class="flex items-center gap-1.5"><span class="inline-block size-2.5 rounded-sm bg-red-500"></span> Abstieg / Relegation</span>
    </div>
  {/if}
</div>
