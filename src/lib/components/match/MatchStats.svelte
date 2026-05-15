<script>
  /**
   * Side-by-side team stat comparison with horizontal bars.
   *
   * @prop homeStats - { xg, xga, shots, shotsOnTarget, deepPasses, ppda }
   * @prop awayStats - same shape
   */
  let { homeStats, awayStats } = $props();

  const hasData = $derived(homeStats || awayStats);

  function fmtFloat(v, digits = 2) {
    if (v === null || v === undefined) return "—";
    return Number(v).toFixed(digits);
  }
  function fmtInt(v) {
    if (v === null || v === undefined) return "—";
    return String(v);
  }

  const rows = $derived([
    {
      label: "xG",
      home: homeStats?.xg,
      away: awayStats?.xg,
      format: (v) => fmtFloat(v, 2),
      sumAsTotal: true,
      tooltip: "Expected Goals — Summe der Tor-Wahrscheinlichkeiten aller Schüsse"
    },
    {
      label: "Schüsse",
      home: homeStats?.shots,
      away: awayStats?.shots,
      format: fmtInt,
      sumAsTotal: true
    },
    {
      label: "Schüsse aufs Tor",
      home: homeStats?.shotsOnTarget,
      away: awayStats?.shotsOnTarget,
      format: fmtInt,
      sumAsTotal: true
    },
    {
      label: "Deep Passes",
      home: homeStats?.deepPasses,
      away: awayStats?.deepPasses,
      format: fmtInt,
      sumAsTotal: true,
      tooltip: "Pässe abgeschlossen in den letzten ~20 Metern vor dem gegnerischen Tor"
    },
    {
      label: "PPDA",
      home: homeStats?.ppda,
      away: awayStats?.ppda,
      format: (v) => fmtFloat(v, 1),
      sumAsTotal: false,
      tooltip: "Passes per Defensive Action — niedriger = aggressiveres Pressing"
    }
  ]);

  function homeWidth(row) {
    const h = Number(row.home ?? 0);
    const a = Number(row.away ?? 0);
    if (!row.sumAsTotal) {
      // For PPDA: lower is better, so invert
      const total = h + a;
      if (total === 0) return 50;
      return Math.max(8, Math.min(92, (a / total) * 100));
    }
    const total = h + a;
    if (total === 0) return 50;
    return Math.max(4, Math.min(96, (h / total) * 100));
  }
</script>

{#if !hasData}
  <p class="rounded-md bg-slate-50 p-4 text-center text-sm text-slate-500">
    Noch keine xG-Daten für dieses Spiel.
  </p>
{:else}
  <div class="flex flex-col gap-3">
    {#each rows as row (row.label)}
      <div class="grid grid-cols-[3rem_minmax(0,1fr)_3rem] items-center gap-3">
        <div class="text-right font-mono text-sm font-semibold tabular-nums text-slate-900">
          {row.format(row.home)}
        </div>
        <div class="flex flex-col gap-1" title={row.tooltip ?? ""}>
          <div class="text-center text-xs uppercase tracking-wide text-slate-500">
            {row.label}
          </div>
          <div class="relative flex h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              class="bg-[var(--color-pitch)]"
              style="width: {homeWidth(row)}%"
            ></div>
            <div class="flex-1 bg-amber-400"></div>
          </div>
        </div>
        <div class="text-left font-mono text-sm font-semibold tabular-nums text-slate-900">
          {row.format(row.away)}
        </div>
      </div>
    {/each}
  </div>
{/if}
