<script>
  /**
   * Match prediction visualisation: stacked probability bar (Home / Draw / Away)
   * plus the expected goals from the Poisson-xG model.
   *
   * @prop prediction - object from Engine: { probHomeWin, probDraw, probAwayWin, expectedHomeGoals, expectedAwayGoals, modelVersion, features }
   * @prop homeName - display name for the home team
   * @prop awayName - display name for the away team
   */
  let { prediction, homeName, awayName } = $props();

  const pct = $derived.by(() => {
    if (!prediction) return null;
    const h = Math.max(0, prediction.probHomeWin ?? 0);
    const d = Math.max(0, prediction.probDraw ?? 0);
    const a = Math.max(0, prediction.probAwayWin ?? 0);
    const total = h + d + a || 1;
    return {
      home: (h / total) * 100,
      draw: (d / total) * 100,
      away: (a / total) * 100
    };
  });

  const verdict = $derived.by(() => {
    if (!prediction) return null;
    const probs = [
      { side: "home", label: homeName, p: prediction.probHomeWin ?? 0 },
      { side: "draw", label: "Unentschieden", p: prediction.probDraw ?? 0 },
      { side: "away", label: awayName, p: prediction.probAwayWin ?? 0 }
    ];
    probs.sort((a, b) => b.p - a.p);
    return probs[0];
  });

  function fmtPct(v) {
    return `${Math.round((v ?? 0) * 100)}%`;
  }

  function fmtGoals(v) {
    return Number(v ?? 0).toFixed(2);
  }
</script>

{#if !prediction}
  <p class="rounded-md bg-slate-50 p-4 text-center text-sm text-slate-500">
    Noch keine Prediction für dieses Spiel.
  </p>
{:else}
  <div class="flex flex-col gap-4">
    <!-- Verdict -->
    <div class="text-center text-sm text-slate-600">
      Modell-Tipp:
      <span class="font-semibold text-slate-900">{verdict.label}</span>
      <span class="ml-1 text-slate-400">({fmtPct(verdict.p)})</span>
    </div>

    <!-- Stacked probability bar -->
    <div class="flex flex-col gap-1">
      <div class="flex h-3 overflow-hidden rounded-full bg-slate-200">
        <div class="bg-[var(--color-pitch)]" style="width: {pct.home}%" title="Heimsieg {fmtPct(prediction.probHomeWin)}"></div>
        <div class="bg-slate-400" style="width: {pct.draw}%" title="Unentschieden {fmtPct(prediction.probDraw)}"></div>
        <div class="bg-amber-400" style="width: {pct.away}%" title="Auswärtssieg {fmtPct(prediction.probAwayWin)}"></div>
      </div>
      <div class="grid grid-cols-3 text-xs text-slate-600">
        <div class="text-left">
          <span class="inline-block size-2 rounded-sm bg-[var(--color-pitch)]"></span>
          {homeName}
          <span class="ml-1 font-semibold tabular-nums">{fmtPct(prediction.probHomeWin)}</span>
        </div>
        <div class="text-center">
          <span class="inline-block size-2 rounded-sm bg-slate-400"></span>
          Remis
          <span class="ml-1 font-semibold tabular-nums">{fmtPct(prediction.probDraw)}</span>
        </div>
        <div class="text-right">
          <span class="font-semibold tabular-nums">{fmtPct(prediction.probAwayWin)}</span>
          {awayName}
          <span class="ml-1 inline-block size-2 rounded-sm bg-amber-400"></span>
        </div>
      </div>
    </div>

    <!-- Expected goals -->
    <div class="grid grid-cols-3 items-center gap-2 rounded-md bg-slate-50 p-3 text-center text-sm">
      <div>
        <div class="text-xs uppercase tracking-wide text-slate-500">erwart. Tore</div>
        <div class="font-mono text-lg font-semibold tabular-nums text-slate-900">
          {fmtGoals(prediction.expectedHomeGoals)}
        </div>
      </div>
      <div class="text-xs text-slate-400">vs.</div>
      <div>
        <div class="text-xs uppercase tracking-wide text-slate-500">erwart. Tore</div>
        <div class="font-mono text-lg font-semibold tabular-nums text-slate-900">
          {fmtGoals(prediction.expectedAwayGoals)}
        </div>
      </div>
    </div>

    <div class="text-center text-[10px] uppercase tracking-wide text-slate-400">
      Modell: {prediction.modelVersion}
      {#if prediction.features?.formWindow}
        · letzte {prediction.features.formWindow} Spiele
      {/if}
    </div>
  </div>
{/if}
