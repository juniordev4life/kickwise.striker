<script>
  let { history = [] } = $props();

  // history: Array<{ matchday: number, points: number, hasPlayed: boolean }>
  const W = 600;
  const H = 200;
  const PAD = { top: 16, right: 12, bottom: 28, left: 36 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxPoints = $derived(Math.max(200, ...history.map((d) => d.points)));
  const barWidth = $derived(history.length > 0 ? innerW / history.length - 4 : 0);

  function barHeight(p) {
    return maxPoints === 0 ? 0 : (p / maxPoints) * innerH;
  }
  function barX(idx) {
    return PAD.left + (innerW / history.length) * idx + 2;
  }
  function barY(p) {
    return PAD.top + innerH - barHeight(p);
  }
  function tickY(value) {
    return PAD.top + innerH - (value / maxPoints) * innerH;
  }

  const ticks = $derived([0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxPoints * f)));
</script>

{#if history.length === 0}
  <p class="rounded-md bg-slate-50 p-4 text-center text-sm text-slate-500">
    Keine Spieltagspunkte verfügbar.
  </p>
{:else}
  <svg viewBox="0 0 {W} {H}" class="w-full" role="img" aria-label="Punkte pro Spieltag">
    <!-- Y-grid -->
    {#each ticks as t (t)}
      <line
        x1={PAD.left}
        x2={W - PAD.right}
        y1={tickY(t)}
        y2={tickY(t)}
        stroke="#e2e8f0"
        stroke-width="1"
      />
      <text x={PAD.left - 6} y={tickY(t) + 4} text-anchor="end" font-size="10" fill="#94a3b8">
        {t}
      </text>
    {/each}

    <!-- Bars -->
    {#each history as d, i (d.matchday)}
      <rect
        x={barX(i)}
        y={d.hasPlayed ? barY(d.points) : PAD.top + innerH - 2}
        width={Math.max(2, barWidth)}
        height={d.hasPlayed ? barHeight(d.points) : 2}
        fill={d.hasPlayed ? "#0f6e3a" : "#cbd5e1"}
        rx="2"
      >
        <title>Spieltag {d.matchday}: {d.points} Punkte{d.hasPlayed ? "" : " (nicht gespielt)"}</title>
      </rect>
      {#if i % Math.max(1, Math.floor(history.length / 10)) === 0}
        <text
          x={barX(i) + barWidth / 2}
          y={H - PAD.bottom + 16}
          text-anchor="middle"
          font-size="10"
          fill="#64748b"
        >
          {d.matchday}
        </text>
      {/if}
    {/each}
  </svg>
{/if}
