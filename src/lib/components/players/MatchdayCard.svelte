<script>
  /**
   * One matchday card in the horizontal performance strip.
   *
   * @prop matchday - normalized performance matchday entry
   * @prop maxPoints - max points across all visible matchdays (for bar scaling)
   * @prop playerTeamId - the player's team id for this season (for H/A detection)
   * @prop opponentLogo - resolved Kickbase CDN URL
   * @prop opponentName - resolved opponent team display name
   */
  let {
    matchday,
    maxPoints,
    playerTeamId,
    opponentLogo,
    opponentName
  } = $props();

  const isHome = $derived(String(matchday.homeTeamId) === String(playerTeamId));
  const score = $derived(`${matchday.homeGoals ?? "—"}:${matchday.awayGoals ?? "—"}`);

  const pointsScale = $derived.by(() => {
    if (matchday.isUpcoming) return 0;
    if (!matchday.hasPlayed) return 0.05; // tiny stub so the card has shape
    return Math.min(1, (matchday.points ?? 0) / Math.max(50, maxPoints));
  });

  const barColor = $derived.by(() => {
    if (matchday.isUpcoming) return "#e2e8f0";
    if (!matchday.hasPlayed) return "#cbd5e1";
    if (matchday.goals > 0) return "#84cc16"; // bright green for scorer
    if (matchday.points >= 100) return "#0f6e3a"; // pitch green
    if (matchday.points >= 60) return "#f59e0b"; // amber
    return "#94a3b8";
  });

  const barHeight = $derived(Math.max(matchday.isUpcoming ? 0 : 6, pointsScale * 180));

  // Build the ⚽ / 🅰 icon stack: goals first (bottom of bar), then assists
  const iconStack = $derived.by(() => {
    const items = [];
    for (let i = 0; i < matchday.goals; i++) items.push({ type: "goal", char: "⚽" });
    for (let i = 0; i < matchday.assists; i++) items.push({ type: "assist", char: "A" });
    return items;
  });
</script>

<div class="flex w-16 shrink-0 flex-col items-center gap-1">
  <!-- Opponent logo + home/away indicator -->
  <div class="flex flex-col items-center gap-0.5">
    <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
      {matchday.matchday}.
    </span>
    {#if opponentLogo}
      <img
        src={opponentLogo}
        alt={opponentName ?? ""}
        title={opponentName ?? ""}
        width="22"
        height="22"
        class="rounded-sm"
        loading="lazy"
      />
    {:else}
      <span class="inline-block size-[22px] rounded-sm bg-slate-200"></span>
    {/if}
    <span
      class="rounded-sm px-1 text-[9px] font-bold leading-tight"
      class:bg-emerald-100={isHome}
      class:text-emerald-700={isHome}
      class:bg-slate-100={!isHome}
      class:text-slate-600={!isHome}
      title={isHome ? "Heimspiel" : "Auswärtsspiel"}
    >
      {isHome ? "H" : "A"}
    </span>
  </div>

  <!-- Bar with stacked goal/assist icons -->
  <div class="relative flex h-44 w-9 items-end">
    {#if matchday.isUpcoming}
      <div
        class="w-full rounded-sm border-2 border-dashed border-slate-200"
        style="height: 100%"
        title="Kommendes Spiel"
      ></div>
    {:else}
      <div
        class="flex w-full flex-col-reverse items-center gap-[2px] rounded-sm pt-1"
        style="height: {barHeight}px; background-color: {barColor};"
        title="Spieltag {matchday.matchday} · {score} · {matchday.points ?? 0} Punkte"
      >
        {#each iconStack as icon, idx (idx)}
          <span class="text-[11px] leading-none">
            {#if icon.type === "goal"}
              ⚽
            {:else}
              <span class="rounded-full bg-white/95 px-1 py-[1px] text-[9px] font-bold text-emerald-700">A</span>
            {/if}
          </span>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Score -->
  <div
    class="text-[10px] font-semibold leading-none"
    class:text-slate-400={matchday.isUpcoming}
    class:text-slate-700={!matchday.isUpcoming}
  >
    {matchday.isUpcoming ? "—" : score}
  </div>

  <!-- Points + minutes -->
  {#if matchday.hasPlayed}
    <div class="text-center">
      <div class="text-sm font-semibold text-slate-900 leading-none">{matchday.points}</div>
      <div class="text-[10px] text-slate-500 leading-none mt-0.5">{matchday.minutesPlayed ?? ""}</div>
    </div>
  {:else if matchday.isUpcoming}
    <div class="text-[10px] text-slate-400">offen</div>
  {:else}
    <div class="text-[10px] text-slate-400">—</div>
  {/if}
</div>
