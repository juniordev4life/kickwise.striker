<script>
  let { history = [] } = $props();

  // history: Array<{ date: string, marketValue: number, delta24h: number|null }>
  const W = 600;
  const H = 200;
  const PAD = { top: 16, right: 12, bottom: 28, left: 56 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const values = $derived(history.map((d) => d.marketValue ?? 0));
  const min = $derived(values.length ? Math.min(...values) : 0);
  const max = $derived(values.length ? Math.max(...values) : 0);
  const range = $derived(max - min || 1);

  function x(idx) {
    if (history.length <= 1) return PAD.left + innerW / 2;
    return PAD.left + (innerW / (history.length - 1)) * idx;
  }
  function y(v) {
    return PAD.top + innerH - ((v - min) / range) * innerH;
  }

  const points = $derived(history.map((d, i) => `${x(i)},${y(d.marketValue ?? min)}`).join(" "));

  const fmt = new Intl.NumberFormat("de-DE", {
    notation: "compact",
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 1
  });

  const ticks = $derived(
    [0, 0.5, 1].map((f) => ({ value: min + range * f, y: y(min + range * f) }))
  );
</script>

{#if history.length === 0}
  <p class="rounded-md bg-slate-50 p-4 text-center text-sm text-slate-500">
    Noch keine Marktwert-Historie. Der Scout-Snapshot baut sie täglich auf.
  </p>
{:else}
  <svg viewBox="0 0 {W} {H}" class="w-full" role="img" aria-label="Marktwert über Zeit">
    <!-- Y grid -->
    {#each ticks as t (t.value)}
      <line
        x1={PAD.left}
        x2={W - PAD.right}
        y1={t.y}
        y2={t.y}
        stroke="#e2e8f0"
        stroke-width="1"
      />
      <text x={PAD.left - 6} y={t.y + 4} text-anchor="end" font-size="10" fill="#94a3b8">
        {fmt.format(t.value)}
      </text>
    {/each}

    <!-- Line + fill -->
    <polyline
      points={points}
      fill="none"
      stroke="#0f6e3a"
      stroke-width="2"
      stroke-linejoin="round"
      stroke-linecap="round"
    />

    <!-- Points -->
    {#each history as d, i (d.date)}
      <circle cx={x(i)} cy={y(d.marketValue ?? min)} r="3" fill="#0f6e3a">
        <title>{d.date}: {fmt.format(d.marketValue ?? 0)}</title>
      </circle>
    {/each}

    <!-- X axis labels: first + last -->
    {#if history.length > 0}
      <text x={x(0)} y={H - PAD.bottom + 16} text-anchor="middle" font-size="10" fill="#64748b">
        {history[0].date}
      </text>
      {#if history.length > 1}
        <text
          x={x(history.length - 1)}
          y={H - PAD.bottom + 16}
          text-anchor="middle"
          font-size="10"
          fill="#64748b"
        >
          {history.at(-1).date}
        </text>
      {/if}
    {/if}
  </svg>
{/if}
