<script>
  /**
   * @prop goals      - normalized list of goal events (sorted by minute asc)
   * @prop homeTeamId - team id of the home side (for left/right placement)
   */
  let { goals = [], homeTeamId } = $props();

  function isHomeGoal(g, idx) {
    // openligadb gives scoreTeam1/scoreTeam2 after the goal. The team that
    // scored is the one whose tally went up vs. the previous goal.
    const prev = goals[idx - 1];
    const prevHome = prev?.scoreHome ?? 0;
    const prevAway = prev?.scoreAway ?? 0;
    if (g.isOwnGoal) {
      // own-goal counts to the OTHER team; the scorer plays for the
      // opposite side
      return (g.scoreAway ?? 0) > prevAway;
    }
    return (g.scoreHome ?? 0) > prevHome;
  }

  function labelSuffix(g) {
    const tags = [];
    if (g.isPenalty) tags.push("Elfmeter");
    if (g.isOwnGoal) tags.push("Eigentor");
    if (g.isOvertime) tags.push("Verlängerung");
    return tags.length ? ` (${tags.join(", ")})` : "";
  }
</script>

{#if goals.length === 0}
  <p class="rounded-md bg-slate-50 p-4 text-center text-sm text-slate-500">
    Keine Tore in diesem Spiel.
  </p>
{:else}
  <ol class="flex flex-col gap-1">
    {#each goals as g, i (g.goalId)}
      {@const home = isHomeGoal(g, i)}
      <li class="flex items-center gap-3 rounded-md border border-slate-100 bg-white px-3 py-2 text-sm">
        <span class="w-10 shrink-0 text-right font-mono text-xs text-slate-500">{g.minute}'</span>
        <span class="w-12 shrink-0 font-mono font-semibold tabular-nums">
          {g.scoreHome}:{g.scoreAway}
        </span>
        {#if home}
          <span class="flex-1 text-slate-900">
            ⚽ <span class="font-medium">{g.scorerName}</span><span class="text-xs text-slate-500">{labelSuffix(g)}</span>
          </span>
          <span class="w-8 shrink-0"></span>
        {:else}
          <span class="w-8 shrink-0"></span>
          <span class="flex-1 text-right text-slate-900">
            <span class="text-xs text-slate-500">{labelSuffix(g)}</span><span class="font-medium">{g.scorerName}</span> ⚽
          </span>
        {/if}
      </li>
    {/each}
  </ol>
{/if}
