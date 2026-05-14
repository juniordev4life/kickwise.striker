<script>
import TeamLogo from "$components/common/TeamLogo.svelte";
import { formatKickoffShort } from "$utils/date.utils.js";

let { match } = $props();

const isFinished = $derived(match.status === "finished");
</script>

<article class="flex items-stretch overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
  <div class="flex w-12 shrink-0 flex-col items-center justify-center bg-slate-50 text-xs font-medium text-slate-500">
    {formatKickoffShort(match.kickoff_at)}
  </div>

  <div class="flex flex-1 items-center gap-3 px-3 py-2.5">
    <div class="flex flex-1 items-center gap-2">
      <TeamLogo src={match.home_logo_url} alt={match.home_team_short ?? match.home_team_name} />
      <span class="text-sm font-medium text-slate-900">
        {match.home_team_name ?? match.home_team_id}
      </span>
    </div>

    <div class="flex w-16 items-center justify-center font-mono text-base font-semibold">
      {#if isFinished}
        <span class="tabular-nums">{match.home_score} : {match.away_score}</span>
      {:else}
        <span class="text-slate-400">vs.</span>
      {/if}
    </div>

    <div class="flex flex-1 items-center justify-end gap-2">
      <span class="text-sm font-medium text-slate-900">
        {match.away_team_name ?? match.away_team_id}
      </span>
      <TeamLogo src={match.away_logo_url} alt={match.away_team_short ?? match.away_team_name} />
    </div>
  </div>
</article>
