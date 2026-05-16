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

/**
 * @param {number} v probability in [0, 1]
 * @returns {string}
 */
function fmtPct(v) {
  return `${Math.round((v ?? 0) * 100)}%`;
}
</script>

<a
  href="/matches/{match.match_id}"
  class="group flex flex-col overflow-hidden rounded-2xl border border-edge bg-surface shadow-sm transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_8px_24px_rgba(15,31,61,0.08)]"
>
  <div class="flex items-stretch">
    <div
      class="flex w-14 shrink-0 flex-col items-center justify-center bg-panel text-[11px] font-semibold uppercase tracking-wider text-muted"
    >
      {formatKickoffShort(match.kickoff_at)}
    </div>

    <div class="flex flex-1 items-center gap-3 px-3 py-3">
      <div class="flex flex-1 items-center gap-2">
        <TeamLogo src={match.home_logo_url} alt={match.home_team_short ?? match.home_team_name} />
        <span class="text-sm font-semibold text-ink">
          {match.home_team_name ?? match.home_team_id}
        </span>
        {#if match.home_team_rank}
          <span class="font-mono text-[11px] tabular-nums text-muted">
            ({match.home_team_rank})
          </span>
        {/if}
      </div>

      <div class="flex w-16 items-center justify-center">
        {#if isFinished}
          <span class="font-display text-lg font-bold tabular-nums text-ink">
            {match.home_score} : {match.away_score}
          </span>
        {:else}
          <span class="text-xs font-medium uppercase tracking-wider text-muted">vs.</span>
        {/if}
      </div>

      <div class="flex flex-1 items-center justify-end gap-2">
        {#if match.away_team_rank}
          <span class="font-mono text-[11px] tabular-nums text-muted">
            ({match.away_team_rank})
          </span>
        {/if}
        <span class="text-sm font-semibold text-ink">
          {match.away_team_name ?? match.away_team_id}
        </span>
        <TeamLogo src={match.away_logo_url} alt={match.away_team_short ?? match.away_team_name} />
      </div>
    </div>
  </div>

  {#if predictionPct && !isFinished}
    <div class="flex items-center gap-2 border-t border-edge bg-panel/40 px-3 py-2">
      <span class="font-mono text-[11px] font-semibold tabular-nums text-accent">
        {fmtPct(predictionPct.homeRaw)}
      </span>
      <div class="flex h-1.5 flex-1 overflow-hidden rounded-full bg-edge">
        <div class="bg-accent transition-all" style="width: {predictionPct.home}%"></div>
        <div class="bg-muted/40" style="width: {predictionPct.draw}%"></div>
        <div class="bg-gold transition-all" style="width: {predictionPct.away}%"></div>
      </div>
      <span class="font-mono text-[11px] font-semibold tabular-nums text-gold">
        {fmtPct(predictionPct.awayRaw)}
      </span>
    </div>
  {/if}
</a>
