<script>
let { player } = $props();

const statusColor = $derived(
  player.status === "fit"
    ? "text-emerald-700 bg-emerald-50"
    : player.status === "injured"
      ? "text-red-700 bg-red-50"
      : player.status === "questionable"
        ? "text-amber-700 bg-amber-50"
        : "text-slate-500 bg-slate-50"
);

const marketValueLabel = $derived(
  player.marketValue
    ? new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0
      }).format(player.marketValue)
    : "—"
);
</script>

<article class="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
  <div class="flex size-8 shrink-0 items-center justify-center rounded bg-slate-100 text-xs font-semibold text-slate-700">
    {player.position}
  </div>
  <div class="flex-1">
    <div class="text-sm font-medium text-slate-900">{player.name}</div>
    <div class="text-xs text-slate-500">Ø {player.average?.toFixed(1) ?? "—"} P. · {marketValueLabel}</div>
  </div>
  <span class="rounded-full px-2 py-0.5 text-xs font-medium {statusColor}">{player.status}</span>
</article>
