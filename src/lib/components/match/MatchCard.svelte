<script>
import TeamLogo from "$components/common/TeamLogo.svelte";
import { formatKickoffShort } from "$utils/date.utils.js";

let { match } = $props();

const isFinished = $derived(match.status === "finished");

const prediction = $derived(match.prediction ?? null);

const predictionPct = $derived.by(() => {
  if (!prediction) return null;
  const h = Math.max(0, prediction.probHomeWin ?? 0);
  const d = Math.max(0, prediction.probDraw ?? 0);
  const a = Math.max(0, prediction.probAwayWin ?? 0);
  const total = h + d + a || 1;
  return {
    home: (h / total) * 100,
    draw: (d / total) * 100,
    away: (a / total) * 100,
    homeRaw: h,
    drawRaw: d,
    awayRaw: a
  };
});

function fmtPct(v) {
  return `${Math.round((v ?? 0) * 100)}%`;
}
</script>

<a
  href="/matches/{match.match_id}"
  class="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-[var(--color-pitch)] hover:shadow-md"
>
  <div class="flex items-stretch">
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
  </div>

  {#if predictionPct && !isFinished}
    <div class="flex items-center gap-2 px-3 py-1.5 text-[10px] text-slate-500">
      <span class="font-mono tabular-nums text-slate-700">{fmtPct(predictionPct.homeRaw)}</span>
      <div class="flex h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div class="bg-[var(--color-pitch)]" style="width: {predictionPct.home}%"></div>
        <div class="bg-slate-400" style="width: {predictionPct.draw}%"></div>
        <div class="bg-amber-400" style="width: {predictionPct.away}%"></div>
      </div>
      <span class="font-mono tabular-nums text-slate-700">{fmtPct(predictionPct.awayRaw)}</span>
    </div>
  {/if}
</a>
